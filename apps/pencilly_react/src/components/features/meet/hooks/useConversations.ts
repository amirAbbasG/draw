import { useCallback, useRef, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { showMessageNotification } from "@/components/features/meet/notification";
import { useUser } from "@/stores/context/user";

import { meetKeys } from "../query-keys";
import type {
  Conversation,
  ConversationEvent,
  WsReadUpdatedMessage,
  WsServerMessage,
  WsUpsertMessage,
} from "../types";
import { useConversationApi } from "./useConversationApi";

/**
 * Manages the conversation list.
 * Fetches from REST on mount via useQuery, then applies real-time updates from WS events
 * by patching the React Query cache directly.
 *
 * - `unread_count` from API -> `unseenCount` on the conversation
 * - `member_count` from API -> `isGroup` (more than 2 = group)
 * - Updates unseenCount when new message arrives and user is not viewing that conversation
 * - Resets unseenCount to 0 when user reads messages
 */
export function useConversations(setIsOpen: (open: boolean) => void) {
  const queryClient = useQueryClient();
  const api = useConversationApi();
  const { user } = useUser();

  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  const activeConvIdRef = useRef<string | null>(null);
  activeConvIdRef.current = activeConversation?.id ?? null;

  /** Enrich a conversation from API with client-side computed fields */
  const enrichConversation = useCallback(
    (conv: Conversation): Conversation => ({
      ...conv,
      unseenCount: conv.unread_count ?? conv.unseenCount ?? 0,
      isGroup: conv.type === "group" || conv.countMemebrs > 2,
      profile_image_url: conv.profile_image_url || (conv as any).profile_image,
    }),
    [],
  );

  // ─── useQuery for conversation list ────────────────────
  const {
    data: conversations = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: meetKeys.conversations(),
    queryFn: async () => {
      const response = await api.fetchConversations();
      return response?.items?.map(enrichConversation) ?? [];
    },
  });

  // Keep a ref for WS callback closures that need the latest value
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  // ─── Cache helpers (replaces setConversations) ─────────

  /** Update the cached conversation list. Accepts a callback or direct value, matching the
   *  same (prev => newValue) signature that callers relied on via setConversations. */
  const setConversations = useCallback(
    (updater: Conversation[] | ((prev: Conversation[]) => Conversation[])) => {
      queryClient.setQueryData<Conversation[]>(
        meetKeys.conversations(),
        (prev = []) =>
          typeof updater === "function" ? updater(prev) : updater,
      );
    },
    [queryClient],
  );

  const updateConversation = useCallback(
    (id: string, updates: Partial<Conversation>) => {
      setConversations(prev =>
        prev.map(c => (c.id === id ? { ...c, ...updates } : c)),
      );
    },
    [setConversations],
  );

  const removeConversation = useCallback(
    (id: string) => {
      setConversations(prev => prev.filter(c => c.id !== id));
    },
    [setConversations],
  );

  // ─── WS handlers ──────────────────────────────────────

  /** Handle incoming message event - update lastMessage + unseenCount on the conversation */
  const handleMessageEvent = useCallback(
    (event: ConversationEvent) => {
      const { conversationId, event: evt } = event;

      if (evt.type === "system") {
        if (evt.subtype === "member_removed") {
          const id = evt.conversationId;
          if (id && evt.payload?.removedUser?.username === user?.username) {
            setConversations(prev => prev.filter(c => c.id !== id));
          }
        }
        if (evt.subtype === "conversation_redirected_to_group") {
          const destId = evt.payload?.destinationConversationId;
          if (destId) {
            setActiveConversation(
              conversationsRef.current.find(c => c.id === destId) ?? null,
            );
          }
        }
      }

      if (evt.type === "message") {
        if (
          !evt.isCurrentUser &&
          evt.conversationId !== activeConvIdRef.current
        ) {
          const conv = conversationsRef.current.find(
            c => c.id === evt.conversationId,
          );
          if (conv?.muted) return;

          showMessageNotification(
            {
              senderName: evt.actor?.name ?? "Unknown",
              senderAvatarUrl: evt.actor?.profileImageUrl ?? undefined,
              messagePreview: evt.body ?? "",
              conversationId: evt.conversationId,
            },
            () => {
              if (conv) {
                setActiveConversation(conv);
                setIsOpen(true);
              }
            },
          );
        }

        setConversations(prev =>
          prev.map(c => {
            if (c.id !== conversationId) return c;
            return {
              ...c,
              last_message: evt,
              last_event_at: evt.createdAt,
              last_message_at: evt.createdAt,
              next_seq: Math.max(c.next_seq, event.seq + 1),
              state_version: event.stateVersion,
              unseenCount: evt.isCurrentUser
                ? c.unseenCount
                : (c.unseenCount ?? 0) + 1,
            };
          }),
        );
      }

      if (evt.type === "state" && evt.subtype === "state_changed") {
        const id = evt.conversationId;
        if (id && evt.payload?.after) {
          setConversations(prev =>
            prev.map(c => (c.id === id ? { ...c, ...evt.payload?.after } : c)),
          );
        }
      }
    },
    [setIsOpen, setConversations, user?.username, conversationsRef.current],
  );

  /** Handle conversations:upsert - add new conversation or refresh existing */
  const handleUpsert = useCallback(
    async (message: WsUpsertMessage) => {
      const { conversationId, conversation } = message;
      let conv: Conversation = conversation;
      if (!conversation) {
        conv = conversation ?? (await api.fetchConversation(conversationId));
      }
      if (conv) {
        setConversations(prev => {
          const exists = prev.some(c => c.id === conversationId);
          if (exists) {
            return prev.map(c =>
              c.id === conversationId ? enrichConversation(conv) : c,
            );
          }
          const newConversations = [enrichConversation(conv), ...prev];
          conversationsRef.current = newConversations; // Update ref for WS handlers
          return newConversations;
        });
      }
    },
    [api, enrichConversation, setConversations],
  );

  /** Handle read_updated - reset unseen count when the current user reads */
  const handleReadUpdated = useCallback(
    (message: WsReadUpdatedMessage) => {
      if (message.userId !== user?.id) return;

      setConversations(prev =>
        prev.map(c => {
          if (c.id !== message.conversationId) return c;
          return { ...c, unseenCount: 0 };
        }),
      );
    },
    [user?.id, setConversations],
  );

  /** Central WS message handler */
  const handleWsMessage = useCallback(
    (message: WsServerMessage) => {
      switch (message.type) {
        case "conversations:upsert":
          void handleUpsert(message as WsUpsertMessage);
          break;
        case "conversation:event":
          handleMessageEvent(message as ConversationEvent);
          break;
        case "conversation:read_updated":
          handleReadUpdated(message as WsReadUpdatedMessage);
          break;
      }
    },
    [handleMessageEvent, handleUpsert, handleReadUpdated],
  );

  const handleOpenChat = useCallback(
    (conversation: Conversation) => {
      setActiveConversation(conversation);
      updateConversation(conversation.id, { unseenCount: 0 });
    },
    [updateConversation],
  );

  return {
    conversations,
    isLoading,
    refetch,
    handleWsMessage,
    updateConversation,
    removeConversation,
    activeConversation,
    setActiveConversation,
    handleOpenChat,
    setConversations,
  };
}
