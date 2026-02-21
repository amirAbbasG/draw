import { useEffect, useState } from "react";

import type {
  ConversationActivity,
} from "@/components/features/meet/types";
import { useAxiosFetcher } from "@/hooks/useAxiosFetch";

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

export const useConversationActivities = ({
  conversation_id,
  ...params
}: ActivitiesParams, enabled?: boolean) => {
  const { axiosFetch } = useAxiosFetcher();
  const [activities, setActivities] = useState<ConversationActivity[]>();

  const fetchActivities = async () => {
    try {
      const data = await axiosFetch<ActivitiesRes>({
        url: `/conversations/${conversation_id}/activities/`,
        requestConfig: {
          params,
        },
      });
      setActivities(data?.items ?? []);
    } catch {
      setActivities([]);
    }
  };

  useEffect(() => {
    if (enabled) {
    void fetchActivities();
    }
  }, [enabled, conversation_id]);

  const activeCall =
    activities?.find(a => a.kind === "call" && a.status === "active") ?? null;

  return {
    activities,
    activeCall,
    refresh: fetchActivities,
  };
};
