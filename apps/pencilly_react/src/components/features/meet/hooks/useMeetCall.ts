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
  PendingParticipant,
  WsServerMessage,
} from "../types";

const PENDING_TIMEOUT_MS = 30_000;

interface UseMeetCallOptions {
  /** Callback when a call is accepted (to show CallView) */
  onCallAccepted?: (sessionId: string) => void;
}

interface UseMeetCallReturn {
  /** Start a new call (optionally linked to a conversation) */
  startCall: (
    conversationId?: string,
    callType?: CallType,
  ) => Promise<StreamSession | null>;
  /** Join an existing call by session ID */
  joinCall: (sessionId: string, callType?: CallType) => Promise<void>;
  /** Handle WS message for activity events (incoming calls, joins) */
  handleWsMessage: (message: WsServerMessage) => void;
  /** Participants waiting to join (conversation call) */
  pendingParticipants: PendingParticipant[];
  /** Add a pending participant manually */
  addPending: (participant: PendingParticipant) => void;
  /** Current active session */
  activeSession: StreamSession | null;
  /** Stream session API */
  streamSessionAPI: ReturnType<typeof useStreamSession>;
  /** LiveKit API */
  liveKitAPI: ReturnType<typeof useLiveKit>;
  /** End the current call */
  endCall: () => Promise<void>;
  /** Current call type */
  callType: CallType;
  /** Set call type */
  setCallType: (type: CallType) => void;
  /** Status message */
  statusMessage: string;
  /** Active conversation ID for this call */
  activeConversationId: string | null;
  /** Send reaction via WS (to be called from CallView) */
  sendReaction: ((emoji: string) => void) | null;
  /** Set send reaction handler */
  setSendReaction: (fn: ((emoji: string) => void) | null) => void;
}

/**
 * Manages call/activity lifecycle within the meet feature.
 * Handles starting, joining, incoming calls, and pending participants.
 */
export function useMeetCall({ onCallAccepted }: UseMeetCallOptions = {}) {
  const { user } = useUser();
  const [pendingParticipants, setPendingParticipants] = useState<
    PendingParticipant[]
  >([]);
  const [activeSession, setActiveSession] = useState<StreamSession | null>(
    null,
  );
  const [callType, setCallType] = useState<CallType>("video");
  const [statusMessage, setStatusMessage] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [sendReaction, setSendReaction] = useState<
    ((emoji: string) => void) | null
  >(null);
  const pendingTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const { currentValue: paramSession , removeParam} =
    useCustomSearchParams(CALL_SESSION_KEY);
  const processedEventKeys = useRef<Map<string, number>>(new Map());
  const DEDUP_MS = 30_000;

  useEffect(() => {
    return () => {
      processedEventKeys.current.clear();
    };
  }, []);

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

  /** Add a pending participant with auto-removal after 30s */
  const addPending = useCallback((participant: PendingParticipant) => {
    setPendingParticipants(prev => {
      if (prev.some(p => p.userId === participant.userId)) return prev;
      return [...prev, participant];
    });

    // Auto-remove after 30s
    const timer = setTimeout(() => {
      setPendingParticipants(prev =>
        prev.filter(p => p.userId !== participant.userId),
      );
      pendingTimers.current.delete(participant.userId);
    }, PENDING_TIMEOUT_MS);

    pendingTimers.current.set(participant.userId, timer);
  }, []);

  /** Remove a pending participant (e.g., when they join) */
  const removePending = useCallback((userId: number) => {
    setPendingParticipants(prev => prev.filter(p => p.userId !== userId));
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

      // Create session (pass conversation_id to API)
      const session = await streamSessionAPI.createSession(conversationId);
      if (!session) return null;

      setActiveSession(session);

      // Get token and join LiveKit
      const tokenResponse = await streamSessionAPI.getToken(session.id, {
        name: displayName,
        metadata: profileImage ? { profileImage } : undefined,
      });

      if (tokenResponse) {
        await liveKitAPI.join(
          session.livekit_url,
          tokenResponse.token,
          displayName,
          profileImage,
        );

        // For audio-only calls, mute camera immediately after joining
        if (type === "audio" && !liveKitAPI.cameraMuted) {
          setTimeout(() => {
            liveKitAPI.toggleCamera();
          }, 500);
        }
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
        metadata: profileImage ? { profileImage } : undefined,
      });

      if (tokenResponse) {
        await liveKitAPI.join(
          session.livekit_url,
          tokenResponse.token,
          displayName,
          profileImage,
        );

        if (type === "audio" && !liveKitAPI.cameraMuted) {
          setTimeout(() => {
            liveKitAPI.toggleCamera();
          }, 500);
        }
      }
    },
    [streamSessionAPI, liveKitAPI, displayName, profileImage],
  );

  /** End the current call */
  const endCall = useCallback(async () => {
    removeParam(CALL_SESSION_KEY);
    if (activeSession) {
      await streamSessionAPI.endSession(activeSession.id);
    }
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
      if (message.type !== "conversation:event") return;
      const wsEvent = message as ConversationEvent;
      const { event } = wsEvent;
      if (event.type !== "activity") return;

      // Build a stable key for deduplication:
      const sessionId =
        event.payload?.payload?.sessionId ??
        event.payload?.sessionId ??
        undefined;
      const eventId = (event as any).id ?? undefined;
      let key = "event:";
      if (sessionId) key = `session:${sessionId}`;
      else if (eventId) key = `id:${eventId}`;
      else key = `sub:${event.subtype}:actor:${event.actor?.id ?? "unknown"}`;

      // Skip if recently processed
      const now = Date.now();
      const last = processedEventKeys.current.get(key);
      if (last && now - last < DEDUP_MS) {
        console.debug("Skipping duplicate WS event", key);
        return;
      }
      processedEventKeys.current.set(key, now);

      // Optionally prune old entries
      processedEventKeys.current.forEach((ts, k) => {
        if (now - ts > DEDUP_MS * 2) processedEventKeys.current.delete(k);
      });

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
        const joinedUserId = event.payload?.userId;
        if (joinedUserId) {
          removePending(joinedUserId);
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
        t => t.kind === "video" && t.source === "camera",
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
        username: p.name,
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
        reaction: null,
      };
    });
  }, [lkParticipants, micMuted, cameraMuted, remoteTracks, localTracks]);

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
    sendReaction,
    setSendReaction,
    participants,
  };
}
