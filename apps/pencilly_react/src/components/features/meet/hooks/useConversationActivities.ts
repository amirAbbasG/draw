import { useQuery } from "@tanstack/react-query";

import type { ConversationActivity } from "@/components/features/meet/types";
import { useAxiosFetcher } from "@/hooks/useAxiosFetch";

import { meetKeys } from "../query-keys";

export interface ActivitiesParams {
  conversation_id: string;
  before_created_at?: string;
  limit?: number;
  kind?: "call" | "collab";
  status?: "active" | "ended";
}

export interface ActivitiesRes {
  conversation_id: string;
  count: number;
  has_more: boolean;
  next_before_created_at: string;
  items: ConversationActivity[];
}

export const useConversationActivities = (
  { conversation_id, ...params }: ActivitiesParams,
  enabled?: boolean,
) => {
  const { axiosFetch } = useAxiosFetcher();

  const { data: activities = [], refetch } = useQuery({
    queryKey: meetKeys.activities(conversation_id, params.kind, params.status),
    queryFn: async () => {
      try {
        const data = await axiosFetch<ActivitiesRes>({
          url: `/conversations/${conversation_id}/activities/`,
          requestConfig: { params },
        });
        return data?.items ?? [];
      } catch {
        return [] as ConversationActivity[];
      }
    },
    enabled: !!enabled,
  });

  const activeCall =
    activities.find(a => a.kind === "call" && a.status === "active") ?? null;

  return {
    activities,
    activeCall,
    refresh: refetch,
  };
};
