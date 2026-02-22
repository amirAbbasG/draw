import { useCallback } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useUser } from "@/stores/context/user";

import { meetKeys } from "../query-keys";
import type { ConversationEvent, ConversationMember, MeetUser } from "../types";
import { useConversationApi } from "./useConversationApi";

/**
 * Fetches and manages conversation members via useQuery (cached per conversationId).
 * - Filters out the current user for mention list
 * - Uses first_name + last_name for display, falls back to username
 */
export function useConversationMembers(conversationId: string | null) {
  const queryClient = useQueryClient();
  const api = useConversationApi();
  const { user } = useUser();

  // ─── useQuery for members (cached per conversationId) ──
  const {
    data: rawMembers = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: meetKeys.members(conversationId!),
    queryFn: async () => {
      const response = await api.fetchMembers(conversationId!);
      return response?.items ?? [];
    },
    enabled: !!conversationId,
  });

  // ─── Cache helper ──────────────────────────────────────

  const setRawMembers = useCallback(
    (updater: (prev: ConversationMember[]) => ConversationMember[]) => {
      if (!conversationId) return;
      queryClient.setQueryData<ConversationMember[]>(
        meetKeys.members(conversationId),
        (prev = []) => updater(prev),
      );
    },
    [queryClient, conversationId],
  );

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

  const removeMember = useCallback(
    (id: string) => {
      setRawMembers(prev => prev.filter(m => String(m.id) !== id));
    },
    [setRawMembers],
  );

  const handleMembersMessageEvent = useCallback(
    (event: ConversationEvent) => {
      const { event: evt } = event;

      if (evt.type === "system") {
        if (!conversationId) return;
        if (
          evt.subtype === "member_removed" &&
          evt.payload?.removedUser?.username !== user?.username
        ) {
          setRawMembers(prev =>
            prev.filter(
              m => String(m.id) !== String(evt.payload.removedUser.id),
            ),
          );
        }
        if (evt.subtype === "member_added" && evt.payload?.addedUser && evt.conversationId === conversationId) {
          const newUser = evt.payload.addedUser;
          setRawMembers(prev => {
            if (
              prev.some(m => String(m.id) === String(newUser?.id))
            ) {
              return prev;
            }
            return [...prev, {
              username: newUser.username,
              id: newUser.id,
              first_name: newUser.name,
              last_name: "",
              profile_image_url: newUser.profileImageUrl,
            }];
          });
        }
      }
    },
    [conversationId, user?.username, setRawMembers],
  );

  return {
    allMembers,
    isLoading,
    refetch,
    removeMember,
    handleMembersMessageEvent,
  };
}
