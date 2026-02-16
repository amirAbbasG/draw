import { useCallback, useRef } from "react";

import { useWebSocket, type WsConnectionState } from "@/hooks/useWebSocket";
import { envs } from "@/constants/envs";
import { useUser } from "@/stores/context/user";

import type { WsServerMessage } from "../types";
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

interface UseConversationWsReturn {
  /** Current connection state */
  connectionState: WsConnectionState;
  /** Subscribe to conversation(s) */
  subscribe: (conversationIds: string[]) => boolean;
  /** Unsubscribe from conversation(s) */
  unsubscribe: (conversationIds: string[]) => boolean;
  /** Send a chat message via WS */
  sendMessage: (
    conversationId: string,
    text: string,
    clientEventId?: string,
    replyTo?: string,
  ) => boolean;
  /** Mark messages as read */
  markRead: (conversationId: string, lastReadSeq: number) => boolean;
  /** Send raw WS message */
  send: (data: Record<string, unknown>) => boolean;
  /** Manually disconnect */
  disconnect: () => void;
  /** Manually reconnect */
  reconnect: () => void;
  /** Auto-subscribed conversation IDs from server */
  autoSubscribedIds: React.MutableRefObject<string[]>;
}

/**
 * Wraps the generic useWebSocket with conversation-specific logic.
 * Connects to the conversations WS endpoint when enabled and user is authenticated.
 */
export function useConversationWs(options: UseConversationWsOptions = {}): UseConversationWsReturn {
  const { enabled = true, onMessage, onConnect, onDisconnect } = options;
  const { user } = useUser();
  const autoSubscribedIds = useRef<string[]>([]);

  const wsUrl = envs.wsBaseUrl
    ? `${envs.wsBaseUrl}/conversations/`
    : "";

  const isAuthenticated = !!user;

  const handleMessage = useCallback((data: any) => {
    const message = data as WsServerMessage;

    // Track auto-subscribed IDs
    if (message.type === "conversations:connected") {
      autoSubscribedIds.current = message.autoSubscribedConversationIds ?? [];
    }

    onMessage?.(message);
  }, [onMessage]);

  const {
    send,
    connectionState,
    disconnect,
    reconnect,
  } = useWebSocket({
    url: wsUrl,
    enabled: enabled && isAuthenticated && !!wsUrl,
    onMessage: handleMessage,
    onConnect,
    onDisconnect,
    reconnect: true,
    maxRetries: 5,
    heartbeatInterval: 30000,
  });

  const subscribe = useCallback((conversationIds: string[]): boolean => {
    return send({
      type: "conversations:subscribe",
      conversationIds,
    });
  }, [send]);

  const unsubscribe = useCallback((conversationIds: string[]): boolean => {
    return send({
      type: "conversations:unsubscribe",
      conversationIds,
    });
  }, [send]);

  const sendMessage = useCallback((
    conversationId: string,
    text: string,
    clientEventId?: string,
    replyTo?: string,
  ): boolean => {
    const payload: Record<string, unknown> = {
      type: "chat:send",
      conversationId,
      text,
      clientEventId: clientEventId ?? generateClientEventId(),
    };
    if (replyTo) {
      payload.replyTo = replyTo;
    }
    return send(payload);
  }, [send]);

  const markRead = useCallback((conversationId: string, lastReadSeq: number): boolean => {
    return send({
      type: "conversation:mark_read",
      conversationId,
      lastReadSeq,
    });
  }, [send]);

  return {
    connectionState,
    subscribe,
    unsubscribe,
    sendMessage,
    markRead,
    send,
    disconnect,
    reconnect,
    autoSubscribedIds,
  };
}
