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
  > & {profile_image_file: File}
>;

export const useUpdateConversationInfo = (conversationId: string) => {
  const { axiosFetch } = useAxiosFetcher();
  const queryClient = useQueryClient();
  const queryKey = meetKeys.conversations();


  const { mutate, isPending } = useMutation({
    mutationFn: ({profile_image_file, ...rest}: UpdateConversationInput) => {
      const data = new FormData();
      if (profile_image_file) {
        data.append("profile_image_file", profile_image_file);
      }
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined) {
          data.append(key, String(value));
        }
      });

      return axiosFetch(
        {
          method: "patch",
          url: `/conversations/${conversationId}/`,
          showError: true,
          throwError: true,
        },
        data,
      );
    },
    onMutate: async ({profile_image_file, ...data}) => {
      // Optimistically update the conversation info in the cache
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey) as Conversation[];

      queryClient.setQueryData(queryKey, (conversations: Conversation[]) => {
        return conversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              ...data,
              profile_image_url: profile_image_file ? URL.createObjectURL(profile_image_file) : conv.profile_image_url,
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
  };
};
