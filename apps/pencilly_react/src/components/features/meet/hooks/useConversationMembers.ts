import { useCallback, useEffect, useRef, useState } from "react";

import { useUser } from "@/stores/context/user";

import { useConversationApi } from "./useConversationApi";
import type { ConversationMember, MeetUser } from "../types";

interface UseConversationMembersReturn {
  /** All members (excluding current user) */
  members: MeetUser[];
  /** All raw members (including current user) for chat info */
  allMembers: MeetUser[];
  /** Whether loading */
  isLoading: boolean;
  /** Members for mention in chat (username-based, excludes current user) */
  mentionMembers: { username: string; displayName: string; avatarUrl?: string }[];
  /** Refetch members */
  refetch: () => Promise<void>;
}

/**
 * Fetches and manages conversation members.
 * - Filters out the current user for mention list
 * - Uses first_name + last_name for display, falls back to username
 */
export function useConversationMembers(conversationId: string | null): UseConversationMembersReturn {
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
    if (!conversationId || conversationId === prevConversationId.current) return;
    prevConversationId.current = conversationId;
    void fetchMembers();
  }, [conversationId, fetchMembers]);

  /** Convert a raw member to a MeetUser for display */
  const toMeetUser = useCallback((m: ConversationMember): MeetUser => {
    const displayName = m.first_name
      ? `${m.first_name} ${m.last_name ?? ""}`.trim()
      : m.username;
    return {
      id: String(m.id),
      name: displayName,
      avatarUrl: m.profile_image_url,
      username: m.username
    };
  }, []);

  /** All members for chat info (including current user) */
  const allMembers = rawMembers.map(toMeetUser);

  /** Members excluding current user */
  const members = rawMembers
    .filter(m => m.username !== user?.username)
    .map(toMeetUser);

  /** Mention members (username-based, excludes current user) */
  const mentionMembers = rawMembers
    .filter(m => m.username !== user?.username)
    .map(m => ({
      username: m.username,
      displayName: m.first_name
        ? `${m.first_name} ${m.last_name ?? ""}`.trim()
        : m.username,
      avatarUrl: m.profile_image_url,
    }));

  return {
    members,
    allMembers,
    isLoading,
    mentionMembers,
    refetch: fetchMembers,
  };
}
