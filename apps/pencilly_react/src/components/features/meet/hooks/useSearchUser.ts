import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { UserSearchResponse } from "@/components/features/meet/types";
import { useAxiosFetcher } from "@/hooks/useAxiosFetch";

import { meetKeys } from "../query-keys";

export const useSearchUser = () => {
  const [q, setQ] = useState("");
  const { axiosFetch } = useAxiosFetcher();

  const { data, isLoading } = useQuery({
    queryKey: meetKeys.searchUser(q),
    queryFn: async () => {
      const data = await axiosFetch<UserSearchResponse>({
        url: `/users/search/?q=${encodeURIComponent(q)}`,
      });
      return data.results ?? [];
    },
    enabled: q.length > 0 && /\S+@\S+\.\S+/.test(q),
  });

  return {
    data,
    isLoading,
    setQ,
    q,
  };
};
