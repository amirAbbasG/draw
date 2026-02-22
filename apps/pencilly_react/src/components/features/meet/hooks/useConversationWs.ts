import { useCallback, useRef, useEffect } from "react";

import { useWebSocket } from "@/hooks/useWebSocket";
import { useUser } from "@/stores/context/user";
import { envs } from "@/constants/envs";

import type { ReactionType, WsServerMessage } from "../types";
import { generateClientEventId } from "../utils";

export type WsEventHandler = (message: WsServerMessage) => void;

interface UseConversationWsOptions {
  /** Enable the WS connection */
  enabled?: boolean;
  /** Called for every incoming WS message */
  onMessage?: WsEventHandler;
  /** Called when WS connects */
  onConnect?: () => void;
  /** Called when WS disconnects */
  onDisconnect?: (code?: number, reason?: string) => void;
}

/**
 * Wraps the generic useWebSocket with conversation-specific logic.
 * Connects to the conversations WS endpoint when enabled and user is authenticated.
 */
export function useConversationWs(options: UseConversationWsOptions = {}) {
  const { enabled = true, onMessage, onConnect, onDisconnect } = options;
  const { user } = useUser();
  const autoSubscribedIds = useRef<string[]>([]);

  const wsUrl = envs.wsBaseUrl ? `${envs.wsBaseUrl}/conversations/` : "";

  const isAuthenticated = !!user;

  // Centralized dedupe map for incoming messages (prevent duplicate processing)
  const processedEventKeys = useRef<Map<string, number>>(new Map());
  const DEDUP_MS = 30_000;

  useEffect(() => {
    return () => {
      processedEventKeys.current.clear();
    };
  }, []);

  const deriveKeyForMessage = useCallback((message: WsServerMessage): string | null => {
    try {
      if (message.type === "conversations:connected") return null;

      // conversation:event has nested `event` payload
      if (message.type === "conversation:event") {
        const convEvent = message as any;
        const ev = convEvent.event ?? {};
        const sessionId =
            ev.payload?.payload?.sessionId ?? ev.payload?.sessionId ?? undefined;
        const eventId = ev.id ?? convEvent.eventId ?? undefined;

        if (sessionId) return `session:${sessionId}`;
        // If we have an event id and a status, include status in the key so
        // status transitions for the same event (e.g. pending -> done) are
        // not treated as duplicates and are delivered to listeners.
        const statusForKey = ev.status ?? ev.payload?.status ?? ev.payload?.payload?.status ?? undefined;
        if (eventId) return statusForKey ? `id:${eventId}:status:${statusForKey}` : `id:${eventId}`;

        // Deduplicate status-type events by status + actor + conversation
        const status =
            ev.status ?? ev.payload?.status ?? ev.payload?.payload?.status ?? undefined;
        if (status) {
          return `status:${status}:actor:${ev.actor?.id ?? "unknown"}:conv:${convEvent.conversationId ?? "global"}`;
        }

        return `sub:${ev.subtype ?? ev.type ?? "unknown"}:actor:${ev.actor?.id ?? "unknown"}:conv:${convEvent.conversationId ?? "global"}`;
      }

      // conversation:reaction - use conversationId + actor/identity + optional clientEventId
      if (message.type === "conversation:reaction") {
        const m = message as any;
        const conv = m.conversationId ?? m.conversation_id ?? "global";
        const id = m.identity ?? m.senderUserId ?? "unknown";
        const cid = m.clientEventId ?? m.client_event_id ?? m.id ?? undefined;
        return cid ? `reaction:${conv}:${id}:${cid}` : `reaction:${conv}:${id}`;
      }

      // call invite messages - dedupe by sessionId if present
      if (message.type === "conversation:call_invite") {
        const m = message as any;
        const sid = m.sessionId ?? m.session_id ?? m.session?.id ?? undefined;
        return sid ? `call_invite:session:${sid}` : `call_invite:${JSON.stringify(m).slice(0, 200)}`;
      }

      // fallback: no dedupe by default for unknown message shapes
      return null;
    } catch (e) {
      return null;
    }
  }, []);


  const handleMessage = useCallback(
    (data: any) => {
      const message = data as WsServerMessage;
      // console.log("Received WS message:", message);
      // Track auto-subscribed IDs
      if (message.type === "conversations:connected") {
        autoSubscribedIds.current = message.autoSubscribedConversationIds ?? [];
      }

      // Central dedupe: derive a stable key for common conversation messages
      const key = deriveKeyForMessage(message);
      if (key) {
        const now = Date.now();
        const last = processedEventKeys.current.get(key);
        if (last && now - last < DEDUP_MS) {
          return; // skip duplicate
        }
        processedEventKeys.current.set(key, now);

        // Prune old entries
        processedEventKeys.current.forEach((ts, k) => {
          if (now - ts > DEDUP_MS * 2) processedEventKeys.current.delete(k);
        });
      }

      onMessage?.(message);
    },
    [onMessage, deriveKeyForMessage],
  );

  const { send, sendBinary, connectionState, disconnect, reconnect } = useWebSocket({
    url: wsUrl,
    enabled: enabled && isAuthenticated && !!wsUrl,
    onMessage: handleMessage,
    onConnect,
    onDisconnect,
    reconnect: true,
    maxRetries: 5,
    heartbeatInterval: 30000,
  });

  const subscribe = useCallback(
    (conversationIds: string[]): boolean => {
      return send({
        type: "conversations:subscribe",
        conversationIds,
      });
    },
    [send],
  );

  const unsubscribe = useCallback(
    (conversationIds: string[]): boolean => {
      return send({
        type: "conversations:unsubscribe",
        conversationIds,
      });
    },
    [send],
  );

  const sendMessage = useCallback(
    (
      conversationId: string,
      text: string,
      clientEventId?: string,
      replyTo?: string,
        agentType?: string
    ): boolean => {
      const payload: Record<string, unknown> = {
        type: "chat:send",
        conversationId,
        text,
        clientEventId: clientEventId ?? generateClientEventId(),
        agentType,
      };
      console.log(payload)
      if (replyTo) {
        payload.replyTo = replyTo;
      }
      return send(payload);
    },
    [send],
  );

  const markRead = useCallback(
    (conversationId: string, lastReadSeq: number): boolean => {
      return send({
        type: "conversation:mark_read",
        conversationId,
        lastReadSeq,
      });
    },
    [send],
  );

  const sendReaction = useCallback(
    (conversationId: string, identity: string, reactionType: ReactionType, text: string = "") => {
      return send({
        type: "conversation:reaction",
        conversationId,
        reactionType,
        identity,
        text: text || "✋",
      });
    },
    [send],
  );

  /* ── Audio upload helpers ── */

  const sendAudioUploadInit = useCallback(
    (payload: {
      conversationId: string;
      clientEventId: string;
      mimeType: string;
      fileSizeBytes: number;
      durationMs: number;
      replyTo?: string;
    }): boolean => {
      return send({
        type: "audio:upload_init",
        conversationId: payload.conversationId,
        clientEventId: payload.clientEventId,
        mimeType: payload.mimeType,
        fileSizeBytes: payload.fileSizeBytes,
        durationMs: payload.durationMs,
        ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
      });
    },
    [send],
  );

  const sendAudioChunk = useCallback(
    (uploadId: string, seq: number, chunkData: Uint8Array): boolean => {
      const header = new TextEncoder().encode(`${uploadId}:${seq}|`);
      const frame = new Uint8Array(header.length + chunkData.length);
      frame.set(header, 0);
      frame.set(chunkData, header.length);
      return sendBinary(frame.buffer as ArrayBuffer);
    },
    [sendBinary],
  );

  const sendAudioUploadComplete = useCallback(
    (uploadId: string): boolean => {
      return send({
        type: "audio:upload_complete",
        uploadId,
      });
    },
    [send],
  );

  return {
    connectionState,
    subscribe,
    unsubscribe,
    sendMessage,
    markRead,
    send,
    sendBinary,
    disconnect,
    reconnect,
    autoSubscribedIds,
    sendReaction,
    sendAudioUploadInit,
    sendAudioChunk,
    sendAudioUploadComplete,
  };
}
