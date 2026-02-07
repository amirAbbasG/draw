import { useCallback, useEffect, useRef, useState } from "react";

import { ROOM_KEY } from "@/components/features/share/constants";
import {
  useConnections,
  type Room,
} from "@/hooks/collaboration/useConnections";
import { useCustomSearchParams } from "@/hooks/useCustomSearchParams";
import { useUser } from "@/stores/context/user";
import { useTranslations } from "@/i18n";

import { useCollabAwareness } from "./useCollabAwareness";
import { useCollabCommands } from "./useCollabCommands";
import { useCollabSync } from "./useCollabSync";
import { useYjsSession } from "./useYjsSession";
import {setCallData, setCollaborators, setRoomId} from "@/stores/zustand/collaborate/actions";
import {useCollaborateStore} from "@/stores/zustand/collaborate/collaborate-store";
import {useShallow} from "zustand/react/shallow";

export interface PendingJoinRequest {
  id: string;
  username: string;
  avatarUrl?: string;
  timestamp: number;
}

interface Params {
  drawAPI: DrawAPI;
  onDestroy?: () => void;
  setIsOpenShare: (isOpen: boolean) => void;
}


export const useCollaboration = ({ drawAPI, onDestroy, setIsOpenShare }: Params) => {
  const { user: userData } = useUser();
  const t = useTranslations("collaboration");
  const storageName = localStorage.getItem("pencilly-username");

  const [roomId, collaborators] = useCollaborateStore(useShallow(state => [state.roomId, state.collaborators]))
  // --- State ---
  const [errorMessage, setErrorMessage] = useState("");
  const [collabErrorMessage, setCollabErrorMessage] = useState<string | null>(
    null,
  );
  const [shareLink, setShareLink] = useState("");
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [isCollabAnimating, setIsCollabAnimating] = useState(false);
  const [username, setUsername] = useState(
    storageName === "false" ? "" : storageName || "",
  );

  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [pendingJoinRequests, setPendingJoinRequests] = useState<
    PendingJoinRequest[]
  >([]);
  const [isOwnerState, setIsOwnerState] = useState(false);

  const roomInfoRef = useRef<any>(null);
  const isApprovedRef = useRef(false);

  // --- URL Params ---
  const {
    removeParam,
    currentValue: paramRoom,
    setSearchParams,
  } = useCustomSearchParams(ROOM_KEY);
  const { createRoom, joinRoom, isCreatingRoom, isJoiningRoom } =
    useConnections();

  // --- 1. Infrastructure ---
  const {
    yDocRef,
    providerRef,
    connect: connectYjs,
    destroySession,
    isOffline,
    connectionError,
    attemptReconnect,
    reconnectAttempts,
    setConnectionError: setYjsError,
    wsUrlRef,
  } = useYjsSession(drawAPI);

  // --- 2. Awareness ---
  const { onPointerUpdate } =
    useCollabAwareness(
      providerRef,
      drawAPI,
      {
        username: username || userData?.username || "Anonymous",
        avatarUrl: userData?.profile_image_url || undefined,
      },
      roomInfoRef,
    );

  // --- 3. Sync ---
  const { syncLocalToRemote, handleInitialSync } = useCollabSync(
    yDocRef,
    drawAPI,
    isCollaborating,
  );

  // --- 4. Commands ---
  const handleKick = useCallback(() => {
    removeParam(ROOM_KEY);

    setTimeout(() => {
      destroySession();
      onDestroy?.();
      setErrorMessage(t("alerts.collabKicked"));
      setIsCollaborating(false);
      setIsPendingApproval(false);
      isApprovedRef.current = false;
      setIsOwnerState(false);
    }, 50);
  }, [removeParam, destroySession, onDestroy, t]);

  const handleApproved = useCallback(() => {
    setIsPendingApproval(false);
    isApprovedRef.current = true;

    // Now sync the draw data
    handleInitialSync(true);

    // Update URL param
    if (roomId) {
      setSearchParams({ [ROOM_KEY]: roomId });
      setIsOpenShare(true)
    }
  }, [handleInitialSync, roomId, setSearchParams]);

  const handleDenied = useCallback(() => {
    setIsPendingApproval(false);
    isApprovedRef.current = false;
    setErrorMessage(t("alerts.collabJoinDenied"));

    // Clean up
    destroySession();
    onDestroy?.();
    setIsCollaborating(false);
  }, [destroySession, onDestroy, t]);

  const handleJoinRequest = useCallback((request: PendingJoinRequest) => {
    setPendingJoinRequests(prev => {
      // Avoid duplicates
      if (prev.some(r => r.id === request.id)) return prev;
      return [...prev, request];
    });
  }, []);

  const {
    sendKickMessage,
    sendApprovalMessage,
    sendDenialMessage,
  } = useCollabCommands({
    yDoc: yDocRef.current,
    provider: providerRef.current,
    isOwner: isOwnerState,
    onKick: handleKick,
    onApproved: handleApproved,
    onDenied: handleDenied,
    onJoinRequest: handleJoinRequest,
  });

  const approveJoinRequest = useCallback(
    (requestId: string) => {
      sendApprovalMessage(requestId);
      setPendingJoinRequests(prev => prev.filter(req => req.id !== requestId));
    },
    [sendApprovalMessage],
  );

  const denyJoinRequest = useCallback(
    (requestId: string) => {
      sendDenialMessage(requestId);
      setPendingJoinRequests(prev => prev.filter(req => req.id !== requestId));
    },
    [sendDenialMessage],
  );

  // --- Lifecycle Logic ---

  const connectToRoom = useCallback(
    (newRoomId: string, wsUrl: string, isJoin: boolean, isOwnerJoin?: boolean) => {
      setRoomId(newRoomId);

      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.log(data)
          if (data?.type === "room:info") {
            roomInfoRef.current = data;

            if (data.role === "owner") {
              isApprovedRef.current = true;
              setIsOwnerState(true);
            }

            providerRef.current?.awareness.setLocalStateField("user", {
              ...providerRef.current.awareness.getLocalState()?.user,
              roomInfo: data,
            });
          }
          if (data?.type === "room:permission") {
            roomInfoRef.current = { ...roomInfoRef.current, scope: data.scope };
            providerRef.current?.awareness.setLocalStateField("user", {
              ...providerRef.current.awareness.getLocalState()?.user,
              roomInfo: roomInfoRef.current,
            });
          }
          if (data?.type === "room:call_invite") {
            setCallData(data)
          }
        } catch (e) {
          /* ignore */
        }
      };

      const { provider } = connectYjs(newRoomId, wsUrl, handleMessage);

      if (isJoin && !isOwnerJoin) {
        setIsPendingApproval(true);
        isApprovedRef.current = false;
        setIsOwnerState(false);

        const sendJoinRequestOnSync = () => {
          const currentUsername = username || userData?.username || "Anonymous";
          const currentAvatarUrl = userData?.profile_image_url || undefined;

          const yCommands = provider.doc.getMap<any>("commands");
          const key = `join_request:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

          yCommands.set(key, {
            type: "join_request",
            senderId: provider.awareness.clientID.toString(),
            username: currentUsername,
            avatarUrl: currentAvatarUrl,
            ts: Date.now(),
          });

          // Remove listener after sending
          provider.off("sync", sendJoinRequestOnSync);
        };

        // Check if already synced, otherwise wait for sync event
        if (provider.synced) {
          sendJoinRequestOnSync();
        } else {
          provider.on("sync", () => {
            sendJoinRequestOnSync();
          });
        }
        setIsOpenShare(false)
      } else {
        // Owner: perform initial sync immediately
        isApprovedRef.current = true;
        setIsOwnerState(true);
        handleInitialSync(false);
      }

      // Set initial awareness state
      provider.awareness.setLocalStateField("user", {
        username: username || userData?.username || "Anonymous",
        avatarUrl: userData?.profile_image_url || undefined,
        userState: "active",
        roomInfo: roomInfoRef.current,
      });

      setIsCollaborating(true);

      if (!isJoin || isOwnerJoin) {
        setSearchParams({ [ROOM_KEY]: newRoomId });
      }

      setErrorMessage("");
      setCollabErrorMessage(null);

      return () => {
        removeParam(ROOM_KEY);
        onDestroy?.();
        destroySession();
        setIsCollaborating(false);
        setIsPendingApproval(false);
        isApprovedRef.current = false;
        setIsOwnerState(false);
        setCollaborators(new Map());
      };
    },
    [
      connectYjs,
      destroySession,
      username,
      userData,
      setSearchParams,
      handleInitialSync,
      removeParam,
      onDestroy,
      setCollaborators,
    ],
  );

  // Watch for offline/online status to show animations/toasts
  useEffect(() => {
    if (isOffline && isCollaborating) {
      setCollabErrorMessage(t("alerts.collabDisconnected"));
      setIsCollabAnimating(true);
      setTimeout(() => setIsCollabAnimating(false), 1000);
    } else {
      setCollabErrorMessage(null);
    }
  }, [isOffline, isCollaborating, t]);

  // Sync connection errors from hook to local state
  useEffect(() => {
    if (connectionError) setErrorMessage(connectionError);
  }, [connectionError]);

  // Reconnect logic watcher
  useEffect(() => {
    if (isOffline && isCollaborating && reconnectAttempts > 0) {
      const id = roomId;
      const url = wsUrlRef.current;
      if (id && url) connectToRoom(id, url, false);
    }
  }, [
    reconnectAttempts,
    isOffline,
    isCollaborating,
    roomId,
    wsUrlRef,
    connectToRoom,
  ]);

  // Manual Trigger for reconnect (exposed to UI)
  const handleReconnect = () => {
    if (roomId && isOffline) {
      attemptReconnect(roomId);
    }
  };

  const startCollaboration = async (existingRoomId?: string) => {
    if (isCreatingRoom || isJoiningRoom) return;

    let data: Room | null = null;
    const isJoin = !!existingRoomId;

    if (isJoin) {
      data = await joinRoom({ room_id: existingRoomId });
    } else {
      data = await createRoom();
    }

    if (data) {
      return connectToRoom(data.room_id, data.ws_url, isJoin, data.role === "owner");
    }
    return () => {
      removeParam(ROOM_KEY);
      onDestroy?.();
      destroySession();
      setIsCollaborating(false);
      setIsPendingApproval(false);
      isApprovedRef.current = false;
      setIsOwnerState(false);
      setCollaborators(new Map());
    };
  };

  const cancelPendingApproval = useCallback(() => {
    removeParam(ROOM_KEY);
    setIsPendingApproval(false);
    destroySession();
    onDestroy?.();
    setIsCollaborating(false);
    isApprovedRef.current = false;
    setIsOwnerState(false);

  }, [destroySession, onDestroy]);

  const clearErrors = () => {
    setErrorMessage("");
    setCollabErrorMessage(null);
    setYjsError(null);
  };

  // Derived
  const currentUser =
    collaborators &&
    Array.from(collaborators.values()).find(u => u.isCurrentUser);
  const isOwner = currentUser?.roomInfo?.role === "owner";
  const isCollabViewMode =
    isCollaborating && currentUser?.roomInfo?.scope === "read_only";

  const syncCollaboration = useCallback(
    (...args: Parameters<typeof syncLocalToRemote>) => {
      if (!isApprovedRef.current) return;
      syncLocalToRemote(...args);
    },
    [syncLocalToRemote],
  );

  return {
    startCollaboration,
    syncCollaboration,
    onPointerUpdate,
    sendKickMessage,
    handleReconnect,
    clearErrors,

    approveJoinRequest,
    denyJoinRequest,
    cancelPendingApproval,

    // State setters
    setShareLink,
    setUsername,
    setErrorMessage,

    // State values
    isCollaborating,
    isOffline,
    isCollabAnimating,
    collabErrorMessage,
    errorMessage,
    shareLink,
    username,

    isPendingApproval,
    pendingJoinRequests,

    // Helpers
    isOwner,
    isCollabViewMode,
    currentUser,
    paramRoom,
    shouldJoinFromParam: !!paramRoom && !!drawAPI,
  };
};
