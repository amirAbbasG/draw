import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { commentKeys } from "@/components/features/comment/query-keys";
import { useAxiosFetcher } from "@/hooks/useAxiosFetch";
import { useCheckIsAuth } from "@/hooks/useCheckIsAuth";
import { useUiStore } from "@/stores/zustand/ui/ui-store";

import type { Comment } from "./types";

export const useGetComments = () => {
  const activeHistory = useUiStore(useShallow(state => state.activeHistory));
  const { axiosFetch } = useAxiosFetcher();
  const { isAuth } = useCheckIsAuth();

  return useQuery({
    queryKey: commentKeys.allComments(activeHistory || ""),
    queryFn: () =>
      axiosFetch<Comment[]>({
        url: "/design/comments/",
      }),
    enabled: isAuth && !!activeHistory,
  });
};
