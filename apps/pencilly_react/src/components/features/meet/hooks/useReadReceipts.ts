import { useCallback, useRef } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { meetKeys } from "../query-keys";
import type { WsReadUpdatedMessage, WsServerMessage } from "../types";
import { useConversationApi } from "./useConversationApi";

interface UseReadReceiptsOptions {
  /** The active conversation ID */
  conversationId: string | null;
  /** WS markRead function */
  wsMarkRead: (conversationId: string, lastReadSeq: number) => boolean;
}

interface UseReadReceiptsReturn {
  /** Read receipts keyed by seq */
  readReceipts: Map<number, number[]>;
  /** Mark messages as read (sends via WS) */
  markAsRead: (seq: number) => void;
  /** Handle incoming WS read_updated event */
  handleWsMessage: (message: WsServerMessage) => void;
}

/**
 * Manages read receipts for the active conversation.
 * Fetches initial read-by via useQuery (cached per conversationId),
 * then updates from WS events via queryClient.setQueryData.
 */
export function useReadReceipts({
  conversationId,
  wsMarkRead,
}: UseReadReceiptsOptions): UseReadReceiptsReturn {
  const queryClient = useQueryClient();
  const api = useConversationApi();
  const lastSentSeq = useRef(0);

  // ─── useQuery for read receipts ────────────────────────
  const { data: readReceipts = new Map<number, number[]>() } = useQuery({
    queryKey: meetKeys.readReceipts(conversationId!),
    queryFn: async () => {
      lastSentSeq.current = 0;
      const response = await api.fetchReadBy(conversationId!, 0, 200);
      const map = new Map<number, number[]>();
      if (response?.items) {
        for (const item of response.items) {
          map.set(item.seq, item.user_ids);
        }
      }
      return map;
    },
    enabled: !!conversationId,
  });

  // ─── Cache helper ──────────────────────────────────────

  const setReadReceipts = useCallback(
    (updater: (prev: Map<number, number[]>) => Map<number, number[]>) => {
      if (!conversationId) return;
      queryClient.setQueryData<Map<number, number[]>>(
        meetKeys.readReceipts(conversationId),
        (prev = new Map()) => updater(prev),
      );
    },
    [queryClient, conversationId],
  );

  /** Mark messages up to `seq` as read via WS */
  const markAsRead = useCallback(
    (seq: number) => {
      if (!conversationId || seq <= lastSentSeq.current) return;
      lastSentSeq.current = seq;
      wsMarkRead(conversationId, seq);
    },
    [conversationId, wsMarkRead],
  );

  /** Handle read_updated events from WS */
  const handleWsMessage = useCallback(
    (message: WsServerMessage) => {
      if (message.type !== "conversation:read_updated") return;

      const readMsg = message as WsReadUpdatedMessage;
      if (readMsg.conversationId !== conversationId) return;

      setReadReceipts(prev => {
        const next = new Map(prev);
        for (let seq = 1; seq <= readMsg.lastReadSeq; seq++) {
          const existing = next.get(seq) ?? [];
          if (!existing.includes(readMsg.userId)) {
            next.set(seq, [...existing, readMsg.userId]);
          }
        }
        return next;
      });
    },
    [conversationId, setReadReceipts],
  );

  return {
    readReceipts,
    markAsRead,
    handleWsMessage,
  };
}
