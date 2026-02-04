import { useQuery } from "@tanstack/react-query";

import { useAxiosFetcher } from "@/hooks/useAxiosFetch";
import { queryKeys } from "@/services/query-keys";

export interface CreditRes {
  credit_amount: number;
  usd_equivalent: number;
  has_subscription: boolean;
  subscription_remaining: any;
}

export const useGetCreditsUsage = () => {
  const { axiosFetch } = useAxiosFetcher();
  return useQuery({
    queryKey: queryKeys.userCredits,
    queryFn: () =>
      axiosFetch<CreditRes>({
        url: "/billing/credits/balance/",
      }),
  });
};
