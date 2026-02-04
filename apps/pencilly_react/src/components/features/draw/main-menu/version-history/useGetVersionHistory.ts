import {useInfiniteQuery} from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useAxiosFetcher } from "@/hooks/useAxiosFetch";
import { useCheckIsAuth } from "@/hooks/useCheckIsAuth";
import { queryKeys } from "@/services/query-keys";
import {useUiStore} from "@/stores/zustand/ui/ui-store";
import {VersionHistoryResponse} from "@/components/features/draw/main-menu/version-history/types";


export const PAGE_SIZE = 30;


const testData: VersionHistoryResponse =  {
  items: [
    // {
    //   id: "ewewed",
    //   createdAt: "2024-02-06T10:13:20.000Z",
    //   username: "amirhag73-1229",
    // },
    // {
    //   id: "wlvnwopie;",
    //   createdAt: "2024-02-06T10:14:25.000Z",
    //   username: "user_2",
    // },
    // {
    //   id: "asdasd",
    //   createdAt: "2024-02-06T10:15:30.000Z",
    //   username: "amirhag73-1229",
    // },
  ],
  count: 3,
  has_next: false,
  previous_page: null,
  has_previous: false,
  next_page: null,
  page: 1,
  total_pages: 1,
  page_size: 30,
}

export const useGetVersionHistory = () => {
  const { isAuth } = useCheckIsAuth();
  const activeHistory = useUiStore(useShallow(state => state.activeHistory));
  const { axiosFetch } = useAxiosFetcher();



  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
      useInfiniteQuery({
        queryKey: queryKeys.versionHistory(activeHistory || ""),
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
          // const { data } = await axiosClient.get<VersionHistoryResponse>(
          //     `/draws/version_history/${activeHistory}/?page=${pageParam}&page_size=${PAGE_SIZE}`,
          // );
          // return data;
          return testData;
        },
        select: data => {
          return (
              data.pages.flatMap(page => page.items) || []
          );
        },
        getNextPageParam: function (lastPage, _allPage, lastPageParam) {
          if (lastPageParam < (lastPage.total_pages || 0))
            return lastPageParam + 1;
          return null;
        },
        enabled: isAuth,
      });

  return {
    isLoading,
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
