import { useCallback, useEffect, useRef, useState } from "react";

import { useConversationApi } from "./useConversationApi";
import type { ReadReceipt, WsReadUpdatedMessage, WsServerMessage } from "../types";

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
 * Fetches initial read-by via REST, then updates from WS events.
 */
export function useReadReceipts({ conversationId, wsMarkRead }: UseReadReceiptsOptions): UseReadReceiptsReturn {
  const [readReceipts, setReadReceipts] = useState<Map<number, number[]>>(new Map());
  const api = useConversationApi();
  const lastSentSeq = useRef(0);
  const prevConversationId = useRef<string | null>(null);

  // Fetch initial read-by when conversation changes
  useEffect(() => {
    if (!conversationId || conversationId === prevConversationId.current) return;
    prevConversationId.current = conversationId;
    lastSentSeq.current = 0;

    const load = async () => {
      const response = await api.fetchReadBy(conversationId, 0, 200);
      if (response?.items) {
        const map = new Map<number, number[]>();
        for (const item of response.items) {
          map.set(item.seq, item.user_ids);
        }
        setReadReceipts(map);
      }
    };

    load();
  }, [conversationId, api]);

  /** Mark messages up to `seq` as read via WS */
  const markAsRead = useCallback((seq: number) => {
    if (!conversationId || seq <= lastSentSeq.current) return;
    lastSentSeq.current = seq;
    wsMarkRead(conversationId, seq);
  }, [conversationId, wsMarkRead]);

  /** Handle read_updated events from WS */
  const handleWsMessage = useCallback((message: WsServerMessage) => {
    if (message.type !== "conversation:read_updated") return;

    const readMsg = message as WsReadUpdatedMessage;
    if (readMsg.conversationId !== conversationId) return;

    setReadReceipts(prev => {
      const next = new Map(prev);
      // Update all seqs up to lastReadSeq for this user
      for (let seq = 1; seq <= readMsg.lastReadSeq; seq++) {
        const existing = next.get(seq) ?? [];
        if (!existing.includes(readMsg.userId)) {
          next.set(seq, [...existing, readMsg.userId]);
        }
      }
      return next;
    });
  }, [conversationId]);

  return {
    readReceipts,
    markAsRead,
    handleWsMessage,
  };
}
