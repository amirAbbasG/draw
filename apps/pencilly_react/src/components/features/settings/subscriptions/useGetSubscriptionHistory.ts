import { useInfiniteQuery } from "@tanstack/react-query";

import { useCheckIsAuth } from "@/hooks/useCheckIsAuth";
import { axiosClient } from "@/lib/axios-client";
import { queryKeys } from "@/services/query-keys";

export interface SubHistoryRes {
  count: number;
  total_pages: number;
  page: number;
  page_size: number;
  next: string;
  previous: string;
  results: SubHistoryItem[];
}

export interface SubHistoryItem {
  id: number;
  status: string;
  price_plan_id: string;
  amount: number;
  processing_site: string;
  user_profile_id: number;
  created_at: string;
  updated_at: string;
}

const PAGE_SIZE = 30;

export const useGetSubscriptionHistory = () => {
  const { isAuth } = useCheckIsAuth();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: queryKeys.userTransactions,
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const { data } = await axiosClient.get<SubHistoryRes>(
          `/billing/purchase_history/?page=${pageParam}&page_size=${PAGE_SIZE}`,
        );
        return data;
      },
      select: data => {
        return testData;
        // return data.pages.flatMap(page => page.results) || [];
      },
      getNextPageParam: function (lastPage, _allPage, lastPageParam) {
        if (lastPageParam < (lastPage.total_pages || 0))
          return lastPageParam + 1;
        return null;
      },
      enabled: isAuth,
    });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

const testData: SubHistoryItem[] = [
  {
    id: 1,
    status: "active",
    price_plan_id: "plan_basic",
    amount: 9.99,
    processing_site: "web",
    user_profile_id: 101,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-01-01T10:00:00Z",
  },
  {
    id: 2,
    status: "expired",
    price_plan_id: "plan_pro",
    amount: 19.99,
    processing_site: "mobile",
    user_profile_id: 102,
    created_at: "2025-02-01T11:00:00Z",
    updated_at: "2025-02-01T11:00:00Z",
  },
  {
    id: 3,
    status: "failed",
    price_plan_id: "plan_basic",
    amount: 9.99,
    processing_site: "web",
    user_profile_id: 103,
    created_at: "2025-03-01T12:00:00Z",
    updated_at: "2025-03-01T12:05:00Z",
  },
  {
    id: 4,
    status: "expired",
    price_plan_id: "plan_premium",
    amount: 29.99,
    processing_site: "api",
    user_profile_id: 104,
    created_at: "2025-04-01T09:30:00Z",
    updated_at: "2025-04-01T09:30:00Z",
  },
  {
    id: 5,
    status: "expired",
    price_plan_id: "plan_pro",
    amount: 19.99,
    processing_site: "web",
    user_profile_id: 105,
    created_at: "2025-05-01T08:00:00Z",
    updated_at: "2025-05-01T08:00:00Z",
  },
  {
    id: 6,
    status: "expired",
    price_plan_id: "plan_pro",
    amount: 19.99,
    processing_site: "web",
    user_profile_id: 105,
    created_at: "2025-05-01T08:00:00Z",
    updated_at: "2025-05-01T08:00:00Z",
  },
  {
    id: 7,
    status: "expired",
    price_plan_id: "plan_pro",
    amount: 19.99,
    processing_site: "web",
    user_profile_id: 105,
    created_at: "2025-05-01T08:00:00Z",
    updated_at: "2025-05-01T08:00:00Z",
  },
  {
    id: 8,
    status: "expired",
    price_plan_id: "plan_pro",
    amount: 19.99,
    processing_site: "web",
    user_profile_id: 105,
    created_at: "2025-05-01T08:00:00Z",
    updated_at: "2025-05-01T08:00:00Z",
  },
  {
    id: 9,
    status: "expired",
    price_plan_id: "plan_pro",
    amount: 19.99,
    processing_site: "web",
    user_profile_id: 105,
    created_at: "2025-05-01T08:00:00Z",
    updated_at: "2025-05-01T08:00:00Z",
  },
  {
    id: 10,
    status: "expired",
    price_plan_id: "plan_pro",
    amount: 19.99,
    processing_site: "web",
    user_profile_id: 105,
    created_at: "2025-05-01T08:00:00Z",
    updated_at: "2025-05-01T08:00:00Z",
  },
  {
    id: 11,
    status: "expired",
    price_plan_id: "plan_pro",
    amount: 19.99,
    processing_site: "web",
    user_profile_id: 105,
    created_at: "2025-05-01T08:00:00Z",
    updated_at: "2025-05-01T08:00:00Z",
  },
];
