import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

import {
  HistoryItem,
  HistoryResponse,
} from "@/components/features/history/types";
import { useCheckIsAuth } from "@/hooks/useCheckIsAuth";
import { axiosClient } from "@/lib/axios-client";
import { queryKeys } from "@/services/query-keys";

export const PAGE_SIZE = 30;

export const useGetHistory = (enabled?: boolean) => {
  const { isAuth } = useCheckIsAuth();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: queryKeys.history,
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const { data } = await axiosClient.get<HistoryResponse>(
          `/draws/histories?page=${pageParam}&page_size=${PAGE_SIZE}`,
        );
        return data;
      },
      select: data => {
        return (
          data.pages.flatMap(page => page.items.filter(i => i.visible)) || []
        );
      },
      getNextPageParam: function (lastPage, _allPage, lastPageParam) {
        if (lastPageParam < (lastPage.total_pages || 0))
          return lastPageParam + 1;
        return null;
      },
      enabled: isAuth && !!enabled,
    });

  return {
    isLoading,
    data: data?.sort(h => (h?.pin ? -1 : 1)),
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

export const useGetHistoryById = () => {
  const { isPending, mutateAsync: getHistoryById } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data } = await axiosClient.get<HistoryItem>(
        `/draws/histories/${id}`,
      );
      return data;
    },
  });

  return { getHistoryById, isPending };
};
