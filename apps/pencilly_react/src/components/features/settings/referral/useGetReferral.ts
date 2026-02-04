import { useQuery } from "@tanstack/react-query";

import { useCheckIsAuth } from "@/hooks/useCheckIsAuth";
import { axiosClient } from "@/lib/axios-client";
import { queryKeys } from "@/services/query-keys";

export interface ReferralResponse {
  referral_code: string;
  referral_link: string;
  total_referrals: number;
  completed_referrals: number;
}

export const fetchReferral = async () => {
  const { data } = await axiosClient.get<ReferralResponse>(
    "/subscriptions/referral/my-code/",
  );
  return data;
};

export const useGetReferral = () => {
  const { isAuth } = useCheckIsAuth();
  const { data, isPending } = useQuery({
    queryKey: queryKeys.getReferral,
    queryFn: fetchReferral,
    enabled: isAuth,
  });

  return {
    referralData: data,
    isPending,
  };
};
