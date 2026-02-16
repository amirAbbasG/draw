import { useCallback, useEffect, useRef, useState } from "react";

import { useUser } from "@/stores/context/user";

import { useConversationApi } from "./useConversationApi";
import type {
  Conversation,
  WsServerMessage,
  ConversationEvent,
  WsUpsertMessage,
  WsReadUpdatedMessage,
} from "../types";
import { formatMessageTime } from "../utils";

interface UseConversationsReturn {
  conversations: Conversation[];
  isLoading: boolean;
  refetch: () => Promise<void>;
  /** Handle a WS message to update conversations in real time */
  handleWsMessage: (message: WsServerMessage) => void;
  /** Update a single conversation in the list */
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  /** Remove a conversation from the list */
  removeConversation: (id: string) => void;
}

/**
 * Manages the conversation list.
 * Fetches from REST on mount, then applies real-time updates from WS events.
 *
 * - `unread_count` from API -> `unseenCount` on the conversation
 * - `member_count` from API -> `isGroup` (more than 2 = group)
 * - Updates unseenCount when new message arrives and user is not viewing that conversation
 * - Resets unseenCount to 0 when user reads messages
 */
export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const api = useConversationApi();
  const { user } = useUser();
  const hasFetched = useRef(false);

  /** Enrich a conversation from API with client-side computed fields */
  const enrichConversation = useCallback((conv: Conversation): Conversation => ({
    ...conv,
    unseenCount: conv.unread_count ?? conv.unseenCount ?? 0,
    isGroup: (conv.countMemebrs ?? 0) > 2,
  }), []);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    const response = await api.fetchConversations();
    if (response?.items) {
      setConversations(response.items.map(enrichConversation));
    }
    setIsLoading(false);
  }, [api, enrichConversation]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      void fetchAll();
    }
  }, [fetchAll]);

  const updateConversation = useCallback((id: string, updates: Partial<Conversation>) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c)),
    );
  }, []);

  const removeConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
  }, []);

  /** Handle incoming message event - update lastMessage + unseenCount on the conversation */
  const handleMessageEvent = useCallback((event: ConversationEvent) => {
    const { conversationId, event: evt } = event;
    if (evt.type !== "message") return;

    const isFromCurrentUser = evt.senderUserId === user?.id;

    setConversations(prev =>
      prev.map(c => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          lastMessage: {
            text: evt.deletedAt ? "This message was deleted" : evt.body,
            senderName: evt.actor?.name ?? "Unknown",
            timestamp: formatMessageTime(evt.createdAt),
          },
          last_event_at: evt.createdAt,
          next_seq: Math.max(c.next_seq, event.seq + 1),
          state_version: event.stateVersion,
          // Increment unseen count only for messages from others
          unseenCount: isFromCurrentUser ? c.unseenCount : (c.unseenCount ?? 0) + 1,
        };
      }),
    );
  }, [user?.id]);

  /** Handle conversations:upsert - add new conversation or refresh existing */
  const handleUpsert = useCallback(async (message: WsUpsertMessage) => {
    const { conversationId } = message;

    // Always refetch to get updated data
    const conv = await api.fetchConversation(conversationId);
    if (conv) {
      setConversations(prev => {
        const exists = prev.some(c => c.id === conversationId);
        if (exists) {
          return prev.map(c => c.id === conversationId ? enrichConversation(conv) : c);
        }
        return [enrichConversation(conv), ...prev];
      });
    }
  }, [api, enrichConversation]);

  /** Handle read_updated - reset unseen count when the current user reads */
  const handleReadUpdated = useCallback((message: WsReadUpdatedMessage) => {
    // Only reset if the reading user is the current user
    if (message.userId !== user?.id) return;

    setConversations(prev =>
      prev.map(c => {
        if (c.id !== message.conversationId) return c;
        return {
          ...c,
          unseenCount: 0,
        };
      }),
    );
  }, [user?.id]);

  /** Central WS message handler */
  const handleWsMessage = useCallback((message: WsServerMessage) => {
    switch (message.type) {
      case "conversation:event":
        handleMessageEvent(message as ConversationEvent);
        break;
      case "conversations:upsert":
        handleUpsert(message as WsUpsertMessage);
        break;
      case "conversation:read_updated":
        handleReadUpdated(message as WsReadUpdatedMessage);
        break;
    }
  }, [handleMessageEvent, handleUpsert, handleReadUpdated]);

  return {
    conversations,
    isLoading,
    refetch: fetchAll,
    handleWsMessage,
    updateConversation,
    removeConversation,
  };
}
