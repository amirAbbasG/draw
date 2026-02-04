import {useMutation, type UseMutationOptions, useQueryClient} from "@tanstack/react-query";
import { toast } from "sonner";

import { useAxiosFetcher, type ConfigObjType } from "@/hooks/useAxiosFetch";
import {queryKeys} from "@/services/query-keys";

type Params = {
  timeout?: number;
  poll_interval_ms?: number;
  max_try?: number;
} & Omit<UseMutationOptions<any, Error, { body: any }, unknown>, "mutationFn"> &
  ConfigObjType;

interface MutateParam {
  body: any;
}

export function useMutateWithJob<TR>({
  url,
  showError = true,
  requestConfig,
  method,
  timeout = 10,
  poll_interval_ms = 500,
  max_try = 3,
  ...rest
}: Params) {
  const { axiosFetch } = useAxiosFetcher();
  const queryClient = useQueryClient()

  return useMutation<TR, Error, MutateParam>({
    mutationFn: async ({ body }: MutateParam): Promise<TR> => {
      const res = await axiosFetch<{ job_id: string }>(
        {
          url,
          showError,
          requestConfig,
          method,
        },
        body,
      );
      if (!res) {
        toast.error("Request Failed");
        throw new Error("Request failed");
      }

      for (let attempt = 1; attempt <= max_try; attempt++) {
        const data = await axiosFetch<TR>({
          url: `/draws/jobs/wait/${res.job_id}/?timeout=${timeout}&poll_interval_ms=${poll_interval_ms}`,
          showError,
        });

        if (!data) {
          toast.error("Wait request failed");
          throw new Error("Wait request failed");
        }

        const status = (data as any)?.status;
        if (status !== 202) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.userBalance
          })
          return data;
        }

        if (attempt === max_try) {
          throw new Error("Job still pending after maximum retries");
        }

        await new Promise(r => setTimeout(r, poll_interval_ms));
      }

      throw new Error("Unexpected error while waiting for job");
    },
    ...rest,
  });
}
