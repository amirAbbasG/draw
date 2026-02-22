import { useMutation, useQueryClient } from "@tanstack/react-query";

import { meetKeys } from "@/components/features/meet/query-keys";
import { Conversation } from "@/components/features/meet/types";
import { useAxiosFetcher } from "@/hooks/useAxiosFetch";

export type UpdateConversationInput = Partial<
  Pick<
    Conversation,
    | "chat_state"
    | "call_state"
    | "collab_state"
    | "stream_state"
    | "status"
    | "title"
  > & {profile_image: string}
>;

export const useUpdateConversationInfo = (conversationId: string) => {
  const { axiosFetch } = useAxiosFetcher();
  const queryClient = useQueryClient();
  const queryKey = meetKeys.conversations();

  const { mutateAsync: uploadImage, isPending: isUploading } = useMutation({
    mutationFn: ({ file }: { file: File }) => {
      const data = new FormData();
      data.append("file", file);
      return axiosFetch<{url: string}>(
        {
          method: "post",
          url: `/upload/`,
          showError: true,
        },
        data,
      );
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateConversationInput) =>
      axiosFetch(
        {
          method: "patch",
          url: `/conversations/${conversationId}/`,
          showError: true,
          throwError: true,
        },
        data,
      ),
    onMutate: async data => {
      // Optimistically update the conversation info in the cache
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey) as Conversation[];

      queryClient.setQueryData(queryKey, (conversations: Conversation[]) => {
        return conversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              ...data,
            };
          }
          return conv;
        });
      });

      return { previousData };
    },
    onError: (_err, _data, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
    },
  });

  return {
    updateConversationInfo: mutate,
    isUpdating: isPending,
    uploadImage,
    isUploading,
  };
};
