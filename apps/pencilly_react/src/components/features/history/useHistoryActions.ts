import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  CreateHistoryInput,
  HistoryResponse,
  UpdateHistoryInput,
} from "@/components/features/history/types";
import { useAxiosFetcher } from "@/hooks/useAxiosFetch";
import { useCustomSearchParams } from "@/hooks/useCustomSearchParams";
import { setActiveHistory } from "@/stores/zustand/ui/actions";
import { HISTORY_KEY } from "@/constants/keys";
import { queryKeys } from "@/services/query-keys";

export const useHistoryActions = () => {
  const { axiosFetch } = useAxiosFetcher();
  const queryClient = useQueryClient();
  const {setSearchParams, removeParam, currentValue: paramHistory} = useCustomSearchParams(HISTORY_KEY);

  const queryKey = queryKeys.history;

  const { mutateAsync: updateHistory, isPending: isPendingUpdate } =
    useMutation({
      mutationFn: async ({ id, data, image, ...rest }: UpdateHistoryInput) => {
        const formData = new FormData();
        if (image) {
          formData.append("image", image);
        }

        formData.append("data", data ? JSON.stringify(data) : "");

        Object.entries(rest || {}).map(([key, val]) => {
          formData.append(key, val.toString());
        });

        return await axiosFetch<{ id: string }>(
          {
            url: `/draws/histories/${id}/`,
            showError: true,
            method: "patch",
          },
          formData,
        );
      },
      onMutate: async ({ id, data, visible, image, pin }) => {
        await queryClient.cancelQueries({ queryKey });

        const previousData = queryClient.getQueryData(
          queryKey,
        ) as InfiniteData<HistoryResponse>;

        queryClient.setQueryData<InfiniteData<HistoryResponse> | undefined>(
          queryKey,
          oldData => {
            if (!oldData) return oldData;

            const newPages = oldData.pages.map(page => ({
              ...page,
              items: page.items.map(item => {
                return item.id === id
                  ? {
                      ...item,
                      ...(data || {}),
                      pin: pin ?? item.pin,
                      visible: visible ?? item.visible,
                      preview: image
                        ? URL.createObjectURL(image)
                        : item.preview,
                    }
                  : item;
              }),
            }));

            return {
              ...oldData,
              pages: newPages,
            };
          },
        );

        return { previousData };
      },
      onError: (_err, _data, context) => {
          console.log(_err);
        queryClient.setQueryData(queryKey, context?.previousData);
      },
      onSuccess: (_, variables) => {
        if (variables.visible === false && paramHistory === variables.id) {
          removeParam(HISTORY_KEY);
          setActiveHistory("");
        }
      },
    });

  const changePin = (id: string, value: boolean) => {
    return updateHistory({ id, pin: value });
  };

  const deleteHistory = (id: string) => {
    return updateHistory({ id, visible: false });
  };

  const { mutateAsync: createHistory, isPending: isPendingCreate } =
    useMutation({
      mutationFn: async ({ data, image }: CreateHistoryInput) => {
        const fd = new FormData();
        fd.append("data", JSON.stringify(data));
        fd.append("image", image);
        return await axiosFetch<{ id: string }>(
          {
            url: "/draws/histories/",
            showError: true,
            method: "post",
            requestConfig: {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          },
          fd,
        );
      },
      onSuccess: (data, { setAsActive = true }) => {
        void queryClient.invalidateQueries({ queryKey });
        if (data) {
          setActiveHistory(data.id);
          if (setAsActive) {
            setTimeout(() => {
              setSearchParams({[HISTORY_KEY]: data.id});
            }, 100);
          }
        }
      },
    });

  return {
    deleteHistory,
    changePin,
    isPendingUpdate,
    updateHistory,
    createHistory,
    isPendingCreate,
  };
};
