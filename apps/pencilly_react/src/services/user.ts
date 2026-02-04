import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { useAxiosFetcher } from "@/hooks/useAxiosFetch";
import { useCheckIsAuth } from "@/hooks/useCheckIsAuth";
import { axiosClient } from "@/lib/axios-client";
import { useUiStore } from "@/stores/zustand/ui/ui-store";
import { queryKeys } from "@/services/query-keys";
import {isEmpty} from "@/lib/utils";
import {USER_KEY} from "@/constants/keys";

export interface AuthProvider {
  provider: string;
  provider_id: any;
  verified: boolean;
  last_used: any;
}

export interface Balance {
  amount: number;
  currency: string;
}

export interface Preferences {
  subscribed_for_notifications: boolean;
  locale: string;
}

export interface Session {
  session_id: string;
  device_id: string;
  device_name: string;
  ip_address: string;
  user_agent: string;
}

export interface Integrations {
  google_drive: GoogleDrive;
  dropbox: Dropbox;
  box: Box;
  ondrive: Ondrive;
}

export interface GoogleDrive {
  connected: boolean;
  email: any;
  connected_at: any;
}

export interface Dropbox {
  connected: boolean;
  email: any;
  connected_at: any;
}

export interface Box {
  connected: boolean;
  email: any;
  connected_at: any;
}

export interface Ondrive {
  connected: boolean;
  email: any;
  connected_at: any;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: any;
  credits_amount: number;
  duration_days: number;
  plan_type: string;
  is_free: boolean;
  is_monthly: boolean;
  is_yearly: boolean;
  features: Record<string, string>;
}

export interface UserSubscription {
  id: string;
  active: boolean;
  status: string;
  start_date: string;
  end_date: any;
  monthly_credits: number;
  used_credits: number;
  remaining_credits: number;
  plan_type: string;
}

export interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  is_active: boolean;
  email_verified: boolean;
  has_password: boolean;
  date_joined: string;
  last_login: string;
  auth_provider: AuthProvider;
  balance: Balance;
  preferences: Preferences;
  plan?: Plan;
  subscription?: UserSubscription;
  isCurrent?: boolean;
}

export interface UserDetails extends User {
  token_type: string;
  expires_in: number;
  expires_at: string;
  message: string;
  user: User;
  session: Session;
  integrations: Integrations;
}


export const useGetMe = () => {
  const localUser = localStorage.getItem(USER_KEY);

  return useQuery({
    queryKey: queryKeys.getMe,
    queryFn: async () => {
      const { data } = await axiosClient.get<UserDetails>("/users/me/");
      if (data) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return data.user;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
    initialData: localUser && !isEmpty(localUser) ? JSON.parse(localUser || "{}") : undefined,
    retry: (failureCount, error) => {
      if (
        isAxiosError(error) &&
        (error.response?.status === 404 || error.response?.status === 401)
      ) {
        return false;
      }
      return failureCount < 4;
    },
  });
};

export function useLogout() {
  const queryClient = useQueryClient();
  const { axiosFetch } = useAxiosFetcher();
  return useMutation({
    mutationFn: () =>
      axiosFetch({
        url: "/auth/logout/",
        method: "post",
        showError: true,
      }),
    onSuccess: () => {
      localStorage.removeItem(USER_KEY);
      console.log("Logged out successfully");
      queryClient.setQueryData<UserDetails | null>(queryKeys.getMe, null);
      void queryClient.resetQueries({ queryKey: queryKeys.getMe, exact: true });
    },
    onError: () => {
      toast.error("Unable to log out Please try again later");
    },
  });
}

export const useDeleteAccount = () => {
  const { axiosFetch } = useAxiosFetcher();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: () =>
        axiosFetch({
          url: "/api/v1/auth/account/",
          method: "delete",
          showError: true,
        }),
    onSuccess: () => {
      queryClient.setQueryData<UserDetails | null>(queryKeys.getMe, null);
      void queryClient.resetQueries({ queryKey: queryKeys.getMe, exact: true });
    },
  });

  return {
    deleteAccount: mutateAsync,
    isPendingDelete: isPending,
  };
};

export const useDrawUsers = () => {
  const activeHistory = useUiStore(useShallow(state => state.activeHistory));

  const { axiosFetch } = useAxiosFetcher();
  const { isAuth } = useCheckIsAuth();
  //TODO:  replace with real api

  // return useQuery({
  //   queryKey: queryKeys.designUsers(designId || ""),
  //   queryFn: () => {
  //     return axiosFetch<User[]>({
  //       url: "/design/users/",
  //     });
  //   },
  //   enabled: isAuth && !!designId,
  // });
  const { data, isPending } = useGetMe();

  return {
    isPending,
    data: data
      ? [
          { ...data, isCurrent: true, isOwner: true },
          {
            ...data,
            username: "user_2",
            first_name: "John",
            last_name: "Doe",
            email: "jon@gmail.com",
            profile_image:
              "https://nerdstudio-backend-bucket.s3.amazonaws.com/media/gallery/thumbnails/209_a_photorealistic_high-quality_magazi_thumb.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQ3EGTGXZ6JVDVRHR%2F20250925%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20250925T085555Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=43ca5480b23778933ef35951f746a3ec120360d62068001e812716080bd116f8",
          },
        ]
      : [],
    isAuth,
  };
};


export interface UserBalance {
  credit_amount: number
  usd_equivalent: number
  has_subscription: boolean
  subscription_remaining: any
}


export const useUserBalance = () => {
  const { axiosFetch } = useAxiosFetcher();
  const isAuth = useCheckIsAuth()

  return useQuery({
    queryKey: queryKeys.userBalance,
    queryFn: async () => axiosFetch<UserBalance>({
      url: "/billing/credits/balance/"
    }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!isAuth
  })
}