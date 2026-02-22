import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { StreamSession } from "@/components/features/call/types";
import type { CallParticipant } from "@/components/features/meet/call";
import { useLiveKit } from "@/components/features/meet/hooks/useLiveKit";
import { useStreamSession } from "@/components/features/meet/hooks/useStreamSession";
import { useCustomSearchParams } from "@/hooks/useCustomSearchParams";
import { useUser } from "@/stores/context/user";
import { CALL_SESSION_KEY } from "@/constants/keys";

import { showIncomingCall } from "../notification";
import type {
  CallType,
  ConversationEvent,
  MeetUser,
  WsServerMessage,
} from "../types";

const PENDING_TIMEOUT_MS = 30_000;

interface UseMeetCallOptions {
  onCallAccepted?: (sessionId: string) => void;
}

export function useMeetCall({ onCallAccepted }: UseMeetCallOptions = {}) {
  const { user } = useUser();
  const [pendingParticipants, setPendingParticipants] = useState<
    Array<MeetUser & { addedAt: number }>
  >([]);
  const [activeSession, setActiveSession] = useState<StreamSession | null>(
    null,
  );
  const [callType, setCallType] = useState<CallType>("video");
  const [statusMessage, setStatusMessage] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const pendingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const { currentValue: paramSession, removeParam } =
    useCustomSearchParams(CALL_SESSION_KEY);
  const [userReactions, setUserReactions] = useState<Map<string, string>>(
    new Map(),
  );
  const [userRaiseHand, setUserRaiseHand] = useState<Map<string, boolean>>(
    new Map(),
  );

  const streamSessionAPI = useStreamSession({
    onError: setStatusMessage,
  });

  const liveKitAPI = useLiveKit({
    onStatusChange: setStatusMessage,
  });

  const displayName = user
    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
      user.username ||
      ""
    : "";

  const profileImage = user?.profile_image_url ?? undefined;
  const username = user?.username ?? undefined;

  const addPending = useCallback((participants: MeetUser[]) => {
    setPendingParticipants(prev => {
      const filtered = participants
        .filter(p => !prev.some(existing => existing.id === p.id))
        .map(p => ({
          ...p,
          addedAt: Date.now(),
        }));

      return [...prev, ...filtered];
    });

    // Auto-remove after 30s
    const timer = setTimeout(() => {
      setPendingParticipants(prev =>
        prev.filter(p => !participants.some(r => r.id === p.id)),
      );
      participants.forEach(p => {
        const timer = pendingTimers.current.get(p.id);
        if (timer) {
          clearTimeout(timer);
          pendingTimers.current.delete(p.id);
        }
      });
    }, PENDING_TIMEOUT_MS);

    participants.forEach(p => {
      pendingTimers.current.set(p.id, timer);
    });
  }, []);

  /** Remove a pending participant (e.g., when they join) */
  const removePending = useCallback((userId: string) => {
    setPendingParticipants(prev => prev.filter(p => p.id !== userId));
    const timer = pendingTimers.current.get(userId);
    if (timer) {
      clearTimeout(timer);
      pendingTimers.current.delete(userId);
    }
  }, []);

  /** Start a new call, optionally linked to a conversation */
  const startCall = useCallback(
    async (
      conversationId?: string,
      type: CallType = "video",
    ): Promise<StreamSession | null> => {
      setCallType(type);
      setActiveConversationId(conversationId ?? null);

      const session = await streamSessionAPI.createSession(conversationId);
      if (!session) return null;

      setActiveSession(session);

      const tokenResponse = await streamSessionAPI.getToken(session.id, {
        name: displayName,
        metadata: {
          profileImage,
          username,
        },
      });

      if (tokenResponse) {
        // Pass publishVideo=false for audio calls so camera is not published at all
        await liveKitAPI.join(
          session.livekit_url,
          tokenResponse.token,
          displayName,
          profileImage,
          { publishVideo: type !== "audio" },
        );
      }

      return session;
    },
    [streamSessionAPI, liveKitAPI, displayName, profileImage],
  );

  /** Join an existing call by session ID */
  const joinCall = useCallback(
    async (sessionId: string, type: CallType = "video") => {
      setCallType(type);

      const session = await streamSessionAPI.getSession(sessionId);
      if (!session) return;

      setActiveSession(session);
      setActiveConversationId(session.conversation_id ?? null);

      const tokenResponse = await streamSessionAPI.getToken(session.id, {
        name: displayName,
        metadata: {
          profileImage,
          username,
        },
      });

      if (tokenResponse) {
        await liveKitAPI.join(
          session.livekit_url,
          tokenResponse.token,
          displayName,
          profileImage,
          { publishVideo: type !== "audio" }, // <- audio call will not publish video
        );
      }
    },
    [streamSessionAPI, liveKitAPI, displayName, profileImage],
  );

  /** End the current call */
  const endCall = useCallback(async () => {
    removeParam(CALL_SESSION_KEY);
    // if (activeSession) {
    //   await streamSessionAPI.endSession(activeSession.id);
    // }
    liveKitAPI.leave();
    setActiveSession(null);
    setActiveConversationId(null);
    setPendingParticipants([]);
    pendingTimers.current.forEach(timer => clearTimeout(timer));
    pendingTimers.current.clear();
  }, [activeSession, streamSessionAPI, liveKitAPI]);

  /** Handle WS messages for activity events */
  const handleWsMessage = useCallback(
    (message: WsServerMessage) => {
      if (message.type === "conversation:call_invite") {
        showIncomingCall(
          {
            callerName: message?.invitedBy?.name ?? "Unknown",
            callerAvatarUrl: message?.invitedBy?.profileImageUrl ?? undefined,
            callType: "voice",
          },
          () => {
            const sid = message.sessionId;
            if (sid) {
              void joinCall(sid);
              onCallAccepted?.(sid);
            }
          },
        );
      }

      if (message.type === "conversation:reaction") {
        const id = message.identity || message.senderUserId;
        const { reactionType, conversationId, text } = message;
        if (conversationId !== activeConversationId) return;
        if (reactionType === "emoji") {
          setUserReactions(prev => {
            const newMap = new Map(prev);
            newMap.set(id, text);
            return newMap;
          });
          setTimeout(() => {
            setUserReactions(prev => {
              const newMap = new Map(prev);
              newMap.delete(id);
              return newMap;
            });
          }, 4000);
        } else if (
          reactionType === "raise_hand" ||
          reactionType === "lower_hand"
        ) {
          setUserRaiseHand(prev => {
            const newMap = new Map(prev);
            newMap.set(id, reactionType === "raise_hand");
            return newMap;
          });
        }
        return;
      }

      if (message.type !== "conversation:event") return;
      const wsEvent = message as ConversationEvent;
      const { event } = wsEvent;

      if (
        event.type === "system" &&
        event.subtype === "conversation_redirected_to_group"
      ) {
        const destId = event.payload?.destinationConversationId;
        if (destId) {
          setActiveConversationId(destId);
        }
      }

      if (event.type === "activity") {
        // Build a stable key for deduplication:
        const sessionId =
          event.payload?.payload?.sessionId ??
          event.payload?.sessionId ??
          undefined;

        // Existing handling logic follows...
        if (
          event.subtype === "activity_started" &&
          event.payload?.kind === "call"
        ) {
          const actorData = event.payload?.actor ?? event.actor;
          const sid = sessionId;
          if (event.isCurrentUser) return;

          showIncomingCall(
            {
              callerName: actorData?.name ?? "Unknown",
              callerAvatarUrl: actorData?.profileImageUrl ?? undefined,
              callType: "voice",
            },
            () => {
              if (sid) {
                void joinCall(sid);
                onCallAccepted?.(sid);
              }
            },
          );
        }

        if (event.subtype === "activity_joined") {
          removePending("group"); // Remove generic "group" pending if exists
          const joinedUserId = event.payload?.userId;
          if (joinedUserId) {
            removePending(joinedUserId);
          }
        }
      }
    },

    [joinCall, onCallAccepted, removePending],
  );

  // Auto-join from URL params
  useEffect(() => {
    if (
      paramSession &&
      !activeSession &&
      liveKitAPI.connectionState === "idle"
    ) {
      joinCall(paramSession).then(() => {
        onCallAccepted?.(paramSession);
      });
    }
  }, [paramSession]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      pendingTimers.current.forEach(timer => clearTimeout(timer));
      pendingTimers.current.clear();
    };
  }, []);

  const {
    participants: lkParticipants,
    remoteTracks,
    localTracks,
    micMuted,
    cameraMuted,
  } = liveKitAPI;

  const participants: CallParticipant[] = useMemo(() => {
    return lkParticipants.map(p => {
      const localVTrack = localTracks.find(
        t => t.kind === "video" && t.source !== "screen",
      );
      const remoteVTrack = remoteTracks.find(
        t =>
          t.kind === "video" &&
          t.source === "camera" &&
          t.participantIdentity === p.identity,
      );

      const localSTrack = localTracks.find(
        t => t.kind === "video" && t.source === "screen",
      );
      const remoteSTrack = remoteTracks.find(
        t =>
          t.kind === "video" &&
          t.source === "screen" &&
          t.participantIdentity === p.identity,
      );
      const screenTrack = p.isLocal
        ? localSTrack?.track
        : (remoteSTrack?.track ?? null);

      return {
        id: p.identity ?? String(Math.random()),
        name: p.name ?? p.identity ?? "Unknown",
        username: p.username,
        avatarUrl: p.profileImage,
        isLocal: p.isLocal ?? false,
        isMuted: p.isLocal ? micMuted : false,
        isCameraOff: p.isLocal ? cameraMuted : false,
        isSpeaking: p.isSpeaking ?? false,
        videoTrack: p.isLocal
          ? localVTrack
            ? {
                ...localVTrack,
                participantIdentity: p.identity ?? "local",
                isMuted: cameraMuted,
                sid: "local-video",
                source: "camera",
              }
            : undefined
          : remoteVTrack,
        screenTrack,
        isScreenSharing: !!screenTrack,
        reaction: userReactions.get(p.identity ?? "") ?? null,
        raisedHand: userRaiseHand.get(p.identity ?? "") ?? false,
      };
    });
  }, [
    lkParticipants,
    micMuted,
    cameraMuted,
    remoteTracks,
    localTracks,
    userReactions,
    userRaiseHand,
  ]);

  return {
    startCall,
    joinCall,
    handleWsMessage,
    pendingParticipants,
    addPending,
    activeSession,
    streamSessionAPI,
    liveKitAPI,
    endCall,
    callType,
    setCallType,
    statusMessage,
    activeConversationId,
    participants,
  };
}
