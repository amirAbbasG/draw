import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import authAPI from "@/components/features/auth/services";
import type { Provider } from "@/components/features/auth/types";
import { useErrorToast } from "@/hooks/useErrorToast";
import {useState} from "react";

export const useSubmitOAuth = () => {
  const { showCatchError } = useErrorToast();
  const [pendingProvider, setPendingProvider] = useState<Provider>();


  const { mutate: startOauth, isPending } = useMutation({
    mutationFn: ({ provider }: { provider: Provider }) => {
      setPendingProvider(provider);
      return authAPI.oAuth(provider);
    },
    onSuccess: ({ data }) => {
      const authUrl = data.auth_url;
      if (!authUrl) {
        toast.error(data.message);
        return;
      }

      window.location.href = authUrl;
    },
    onError: e => {
      showCatchError(e);
    },
    onSettled: () => {
      setPendingProvider(undefined);
    },
  });

  return {
    startOauth,
    isPending,
    pendingProvider,
  };
};
