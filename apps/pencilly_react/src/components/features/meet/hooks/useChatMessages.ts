import { useCallback, useRef } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { decorators } from "@/components/features/meet/constants";
import { useUser } from "@/stores/context/user";

import { meetKeys } from "../query-keys";
import type {
  ChatMessage,
  ConversationEvent,
  ConversationEventPayload,
  WsServerMessage,
} from "../types";
import { extractDecoratorsFromText, generateClientEventId } from "../utils";
import { useConversationApi } from "./useConversationApi";

interface UseChatMessagesOptions {
  /** The active conversation ID to load messages for */
  conversationId: string | null;
  /** WS sendMessage function */
  wsSendMessage: (
    conversationId: string,
    text: string,
    clientEventId?: string,
    replyTo?: string,
    agentType?: string,
  ) => boolean;
}

interface UseChatMessagesReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  /** Send a new text message (via WS) */
  sendMessage: (text: string, replyToId?: string) => void;
  /** Edit a message (via REST) */
  editMessage: (eventId: string, newText: string) => Promise<void>;
  /** Delete a message (via REST) */
  deleteMessage: (eventId: string) => Promise<void>;
  /** Handle incoming WS message for this conversation */
  handleWsMessage: (message: WsServerMessage) => void;
  /** Clear messages (e.g. when switching conversations) */
  clear: () => void;
}

/** Convert a raw event payload to a ChatMessage. */
function eventToMessage(
  event: ConversationEventPayload,
  userName?: string,
): ChatMessage {
  return {
    id: event.id,
    conversationId: event.conversationId,
    seq: event.seq,
    type: event.type,
    subtype: event.subtype,
    status: event.status,
    senderUserId: event.senderUserId,
    actor: event.actor,
    body: event.body,
    payload: event.payload,
    clientEventId: event.clientEventId,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    editedAt: event.editedAt,
    deletedAt: event.deletedAt,
    isCurrentUser:
      event.isCurrentUser ??
      (userName ? userName === event.actor?.username : false),
    displayStatus: event.status === "done" ? "sent" : event.status,
    replyTo: event.payload?.replyTo ?? undefined,
    agentType: event.payload?.agentType ?? event.agentType ?? undefined,
  };
}

/**
 * Manages messages for the active conversation.
 * Fetches history via useQuery (cached per conversationId for instant switching),
 * receives real-time updates via WS, and handles optimistic sending,
 * editing (useMutation), and deleting (useMutation).
 */
export function useChatMessages({
  conversationId,
  wsSendMessage,
}: UseChatMessagesOptions): UseChatMessagesReturn {
  const queryClient = useQueryClient();
  const api = useConversationApi();
  const { user } = useUser();
  const currentUserId = user?.id ?? 0;
  const pendingClientIds = useRef<Set<string>>(new Set());

  // ─── useQuery for messages (cached per conversationId) ─
  const { data: messages = [], isLoading } = useQuery({
    queryKey: meetKeys.messages(conversationId!),
    queryFn: async () => {
      const response = await api.fetchMessages(conversationId!);
      if (response?.items) {
        const sorted = [...response.items].sort((a, b) => a.seq - b.seq);
        return sorted.map(evt => eventToMessage(evt, user?.username));
      }
      return [] as ChatMessage[];
    },
    enabled: !!conversationId,
  });

  // ─── Cache helper ──────────────────────────────────────

  const setMessages = useCallback(
    (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
      if (!conversationId) return;
      queryClient.setQueryData<ChatMessage[]>(
        meetKeys.messages(conversationId),
        (prev = []) => updater(prev),
      );
    },
    [queryClient, conversationId],
  );

  // ─── useMutation for edit ──────────────────────────────

  const editMutation = useMutation({
    mutationFn: async ({
      eventId,
      newText,
    }: {
      eventId: string;
      newText: string;
    }) => {
      return api.editMessage(conversationId!, eventId, newText);
    },

    onSuccess: (result, { eventId }) => {
      if (result?.event) {
        setMessages(prev =>
          prev.map(m =>
            m.id === eventId
              ? {
                  ...m,
                  body: result.event.body,
                  editedAt: result.event.editedAt,
                }
              : m,
          ),
        );
      }
    },
  });

  // ─── useMutation for delete ────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async ({ eventId }: { eventId: string }) => {
      return api.deleteMessage(conversationId!, eventId);
    },
    onSuccess: (result, { eventId }) => {
      if (result?.event) {
        setMessages(prev =>
          prev.map(m =>
            m.id === eventId
              ? { ...m, body: "", deletedAt: result.event.deletedAt }
              : m,
          ),
        );
      }
    },
  });

  // ─── Optimistic send via WS ────────────────────────────

  const sendMessage = useCallback(
    (text: string, replyToId?: string) => {
      if (!conversationId) return;

      const clientEventId = generateClientEventId();
      pendingClientIds.current.add(clientEventId);
      const decorator = extractDecoratorsFromText(text, decorators);

      const optimistic: ChatMessage = {
        id: clientEventId,
        conversationId,
        seq: -1,
        type: "message",
        subtype: "text",
        status: "pending",
        senderUserId: currentUserId,
        actor: user
          ? {
              id: user.id,
              name:
                `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
                user.username,
            }
          : undefined,
        body: text,
        payload: {},
        clientEventId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCurrentUser: true,
        displayStatus: "pending",
      };

      setMessages(prev => [...prev, optimistic]);
      wsSendMessage(
        conversationId,
        text,
        clientEventId,
        replyToId,
        decorator.firstId,
      );
    },
    [conversationId, currentUserId, user, wsSendMessage, setMessages],
  );

  /** Wrapper around editMutation that matches the original async signature */
  const editMessage = useCallback(
    async (eventId: string, newText: string) => {
      if (!conversationId) return;
      editMutation.mutate({ eventId, newText });
    },
    [conversationId, editMutation],
  );

  /** Wrapper around deleteMutation that matches the original async signature */
  const deleteMessage = useCallback(
    async (eventId: string) => {
      if (!conversationId) return;
      deleteMutation.mutate({ eventId });
    },
    [conversationId, deleteMutation],
  );

  // ─── WS handler ───────────────────────────────────────

  const handleWsMessage = useCallback(
    (message: WsServerMessage) => {
      if (message.type !== "conversation:event") return;

      const wsEvent = message as ConversationEvent;
      if (wsEvent.conversationId !== conversationId) return;

      const { event } = wsEvent;

      if (!(event.type === "message" || event.type === "agent")) return;

      // Check if this is a response to our optimistic message
      if (
        event.clientEventId &&
        pendingClientIds.current.has(event.clientEventId)
      ) {
        pendingClientIds.current.delete(event.clientEventId);
        setMessages(prev =>
          prev.map(m =>
            m.clientEventId === event.clientEventId
              ? eventToMessage(event, user?.username)
              : m,
          ),
        );
        return;
      }

      // AI decorator agent responses handling
      const isAiDecorator =
        event.subtype === "ai-decorator" ||
        event.payload?.agentType === "ai-decorator" ||
        event.agentType === "ai-decorator";

      if (isAiDecorator) {
        if (event.status === "pending") {
          setMessages(prev => {
            const exists = prev.some(m => m.id === event.id);
            if (exists) {
              return prev.map(m =>
                m.id === event.id
                  ? {
                      ...m,
                      status: event.status,
                      payload: event.payload,
                      updatedAt: event.updatedAt,
                      displayStatus:
                        event.status === "done" ? "sent" : event.status,
                    }
                  : m,
              );
            }
            return [...prev, eventToMessage(event, user?.username)];
          });
          return;
        }

        if (event.status === "done") {
          setMessages(prev =>
            prev.map(m =>
              m.id === event.id ? eventToMessage(event, user?.username) : m,
            ),
          );
          return;
        }
      }

      // Handle edited message
      if (event.editedAt && !event.deletedAt) {
        setMessages(prev =>
          prev.map(m =>
            m.id === event.id
              ? { ...m, body: event.body, editedAt: event.editedAt }
              : m,
          ),
        );
        return;
      }

      // Handle deleted message
      if (event.deletedAt) {
        setMessages(prev =>
          prev.map(m =>
            m.id === event.id
              ? { ...m, body: "", deletedAt: event.deletedAt }
              : m,
          ),
        );
        return;
      }

      // New message from another user - deduplicate by event.id
      setMessages(prev => {
        const exists = prev.some(m => m.id === event.id);
        if (exists) return prev;
        return [...prev, eventToMessage(event, user?.username)];
      });
    },
    [conversationId, currentUserId, setMessages, user?.username],
  );

  // ─── Clear ────────────────────────────────────────────

  const clear = useCallback(() => {
    if (conversationId) {
      queryClient.removeQueries({
        queryKey: meetKeys.messages(conversationId),
      });
    }
  }, [queryClient, conversationId]);

  return {
    messages,
    isLoading,
    sendMessage,
    editMessage,
    deleteMessage,
    handleWsMessage,
    clear,
  };
}
