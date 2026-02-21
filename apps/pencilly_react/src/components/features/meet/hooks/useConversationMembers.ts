import { useCallback, useEffect, useRef, useState } from "react";

import { useUser } from "@/stores/context/user";

import type { ConversationEvent, ConversationMember, MeetUser } from "../types";
import { useConversationApi } from "./useConversationApi";

/**
 * Fetches and manages conversation members.
 * - Filters out the current user for mention list
 * - Uses first_name + last_name for display, falls back to username
 */
export function useConversationMembers(conversationId: string | null) {
  const [rawMembers, setRawMembers] = useState<ConversationMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const api = useConversationApi();
  const { user } = useUser();
  const prevConversationId = useRef<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    const response = await api.fetchMembers(conversationId);
    if (response?.items) {
      setRawMembers(response.items);
    }
    setIsLoading(false);
  }, [conversationId, api]);

  useEffect(() => {
    if (!conversationId || conversationId === prevConversationId.current)
      return;
    prevConversationId.current = conversationId;
    void fetchMembers();
  }, [conversationId, fetchMembers]);

  // console.log(rawMembers)
  /** Convert a raw member to a MeetUser for display */
  const toMeetUser = useCallback(
    (m: ConversationMember): MeetUser => {
      const displayName = m.first_name
        ? `${m.first_name} ${m.last_name ?? ""}`.trim()
        : m.username;
      return {
        ...m,
        id: String(m.id),
        name: displayName,
        avatarUrl: m.profile_image_url,
        isCurrentUser: m.username === user?.username,
      };
    },
    [user],
  );

  /** All members for chat info (including current user) */
  const allMembers = rawMembers.map(toMeetUser);

  const removeMember = (id: string) => {
    setRawMembers(prev => prev.filter(m => String(m.id) !== id));
  };

  const handleMembersMessageEvent = useCallback(
    (event: ConversationEvent) => {
      const { conversationId, event: evt } = event;

      if (evt.type === "system") {
        if (!conversationId) return;
        if (
          evt.subtype === "member_removed" &&
          evt.payload?.removedUser?.username !== user?.username
        ) {
          removeMember(evt.payload.removedUser.id);
        }
        if (evt.subtype === "member_added" && evt.payload?.addedUser) {
          setRawMembers(prev => {
            // Avoid duplicates
            if (prev.some(m => String(m.id) === String(evt.payload.addedUser?.id))) {
              return prev;
            }
            return [...prev, evt.payload.addedUser];
          });
        }
      }
    },
    [allMembers],
  );

  return {
    allMembers,
    isLoading,
    refetch: fetchMembers,
    removeMember,
    handleMembersMessageEvent,
  };
}
