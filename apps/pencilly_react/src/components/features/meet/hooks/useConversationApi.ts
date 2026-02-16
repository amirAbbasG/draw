import { useCallback } from "react";

import { useAxiosFetcher } from "@/hooks/useAxiosFetch";

import type {
  Conversation,
  ConversationListResponse,
  ConversationMembersResponse,
  MessagesResponse,
  ReadByResponse,
  Activity,
  ConversationEventPayload,
} from "../types";

const API_BASE = "/conversations";

/**
 * Provides REST API calls for conversations.
 * Uses axiosFetch from useAxiosFetcher for all requests.
 *
 * Rules:
 * - GET requests: no `showError: true`, no explicit `method: "get"`
 * - POST/PATCH/DELETE: include `showError: true`
 */
export function useConversationApi() {
  const { axiosFetch } = useAxiosFetcher();

  /** GET /api/v1/conversations/ */
  const fetchConversations = useCallback(async (): Promise<ConversationListResponse | null> => {
    try {
      const data = await axiosFetch<ConversationListResponse>({
        url: `${API_BASE}/`,
      });
      return data ?? null;
    } catch {
      return null;
    }
  }, [axiosFetch]);

  /** GET /api/v1/conversations/{id}/ */
  const fetchConversation = useCallback(async (conversationId: string): Promise<Conversation | null> => {
    try {
      const data = await axiosFetch<Conversation>({
        url: `${API_BASE}/${conversationId}/`,
      });
      return data ?? null;
    } catch {
      return null;
    }
  }, [axiosFetch]);

  /** POST /api/v1/conversations/ */
  const createConversation = useCallback(async (
    title: string,
    memberIds: number[],
  ): Promise<Conversation | null> => {
    try {
      const data = await axiosFetch<Conversation>(
        { method: "post", url: `${API_BASE}/`, showError: true },
        { title, member_ids: memberIds },
      );
      return data ?? null;
    } catch {
      return null;
    }
  }, [axiosFetch]);

  /** GET /api/v1/conversations/{id}/messages/ */
  const fetchMessages = useCallback(async (
    conversationId: string,
  ): Promise<MessagesResponse | null> => {
    try {
      const data = await axiosFetch<MessagesResponse>({
        url: `${API_BASE}/${conversationId}/messages/`,
      });
      return data ?? null;
    } catch {
      return null;
    }
  }, [axiosFetch]);

  /** PATCH /api/v1/conversations/{id}/messages/{eventId}/ */
  const editMessage = useCallback(async (
    conversationId: string,
    eventId: string,
    text: string,
  ): Promise<{ event: ConversationEventPayload } | null> => {
    try {
      const data = await axiosFetch<{ event: ConversationEventPayload }>(
        { method: "patch", url: `${API_BASE}/${conversationId}/messages/${eventId}/`, showError: true },
        { text },
      );
      return data ?? null;
    } catch {
      return null;
    }
  }, [axiosFetch]);

  /** DELETE /api/v1/conversations/{id}/messages/{eventId}/ */
  const deleteMessage = useCallback(async (
    conversationId: string,
    eventId: string,
  ): Promise<{ event: ConversationEventPayload } | null> => {
    try {
      const data = await axiosFetch<{ event: ConversationEventPayload }>({
        method: "delete",
        url: `${API_BASE}/${conversationId}/messages/${eventId}/`,
        showError: true,
      });
      return data ?? null;
    } catch {
      return null;
    }
  }, [axiosFetch]);

  /** GET /api/v1/conversations/{id}/read_by/?after_seq=0&limit=200 */
  const fetchReadBy = useCallback(async (
    conversationId: string,
    afterSeq: number = 0,
    limit: number = 200,
  ): Promise<ReadByResponse | null> => {
    try {
      const data = await axiosFetch<ReadByResponse>({
        url: `${API_BASE}/${conversationId}/read_by/?after_seq=${afterSeq}&limit=${limit}`,
      });
      return data ?? null;
    } catch {
      return null;
    }
  }, [axiosFetch]);

  /** POST /api/v1/conversations/{id}/activities/ */
  const startActivity = useCallback(async (
    conversationId: string,
    kind: string,
    provider: string,
    providerRoomId: string,
    payload?: Record<string, any>,
    clientEventId?: string,
  ): Promise<{ activity: Activity; event: ConversationEventPayload } | null> => {
    try {
      const data = await axiosFetch<{ activity: Activity; event: ConversationEventPayload }>(
        { method: "post", url: `${API_BASE}/${conversationId}/activities/`, showError: true },
        {
          kind,
          provider,
          provider_room_id: providerRoomId,
          payload: payload ?? {},
          client_event_id: clientEventId,
        },
      );
      return data ?? null;
    } catch {
      return null;
    }
  }, [axiosFetch]);

  /** PATCH /api/v1/conversations/{id}/states/ */
  const updateConversationStates = useCallback(async (
    conversationId: string,
    states: Partial<{
      chat_state: string;
      call_state: string;
      collab_state: string;
      stream_state: string;
      status: string;
    }>,
  ): Promise<Conversation | null> => {
    try {
      const data = await axiosFetch<Conversation>(
        { method: "patch", url: `${API_BASE}/${conversationId}/states/`, showError: true },
        states,
      );
      return data ?? null;
    } catch {
      return null;
    }
  }, [axiosFetch]);

  /** POST /api/v1/conversations/{id}/read/ */
  const markRead = useCallback(async (
    conversationId: string,
    lastReadSeq?: number,
  ): Promise<boolean> => {
    try {
      await axiosFetch(
        { method: "post", url: `${API_BASE}/${conversationId}/read/` },
        { last_read_seq: lastReadSeq || 0 },
      );
      return true;
    } catch {
      return false;
    }
  }, [axiosFetch]);

  /** GET /api/v1/conversations/{id}/members/ */
  const fetchMembers = useCallback(async (
    conversationId: string,
  ): Promise<ConversationMembersResponse | null> => {
    try {
      const data = await axiosFetch<ConversationMembersResponse>({
        url: `${API_BASE}/${conversationId}/members/?limit=50&offset=0`,
      });
      return data ?? null;
    } catch {
      return null;
    }
  }, [axiosFetch]);

  /** POST /api/v1/conversations/{id}/leave/ (leave conversation) */
  const leaveConversation = useCallback(async (
    conversationId: string,
  ): Promise<boolean> => {
    try {
      await axiosFetch({
        method: "post",
        url: `${API_BASE}/${conversationId}/leave/`,
        showError: true,
      });
      return true;
    } catch {
      return false;
    }
  }, [axiosFetch]);

  /** DELETE /api/v1/conversations/{id}/ (delete for everyone) */
  const deleteConversation = useCallback(async (
    conversationId: string,
  ): Promise<boolean> => {
    try {
      await axiosFetch({
        method: "delete",
        url: `${API_BASE}/${conversationId}/`,
        showError: true,
      });
      return true;
    } catch {
      return false;
    }
  }, [axiosFetch]);

  return {
    fetchConversations,
    fetchConversation,
    createConversation,
    fetchMessages,
    editMessage,
    deleteMessage,
    fetchReadBy,
    startActivity,
    updateConversationStates,
    markRead,
    fetchMembers,
    leaveConversation,
    deleteConversation,
  };
}
