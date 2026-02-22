import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { commentKeys } from "@/components/features/comment/query-keys";
import { useUiStore } from "@/stores/zustand/ui/ui-store";
import { useDrawUsers, User } from "@/services/user";

import type { Comment } from "./types";

export const useCommentActions = () => {
  const queryClient = useQueryClient();
  const activeHistory = useUiStore(useShallow(state => state.activeHistory));
  const queryKey = commentKeys.allComments(activeHistory || "");
  const { data: users } = useDrawUsers();

  const getMentions = (content: string) => {
    return (content
      .match(/@(\w+)/g)
      ?.map(username => {
        const cleanUsername = username.replace("@", "");
        return users.find(u => u.username === cleanUsername);
      })
      .filter(Boolean) || []) as User[];
  };

  const addMutation = useMutation({
    mutationFn: async ({ comment }: { comment: Comment }) => {
      //TODO: implement add comment api
      return comment;
    },
    onMutate: async ({ comment }) => {
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey) as Comment[];

      queryClient.setQueryData(queryKey, (data: Comment[]) => {
        return [...data, comment];
      });

      return { previousData };
    },
    onError: (_err, _data, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
    },
  });

  const addComment = (
    content: string,
    itemId: string,
    isStageComment: boolean,
  ) => {
    const comment: Comment = {
      id: crypto.randomUUID(),
      reactions: [],
      replies: [],
      user: users.find(u => u.isCurrent)!,
      mentionUsers: getMentions(content),
      itemId,
      createdAt: new Date().toISOString(),
      content,
      isStageComment,
      resolved: false,
    };
    addMutation.mutate({ comment });
  };

  const deleteMutation = useMutation({
    mutationFn: async ({ commentId }: { commentId: string }) => {
      //TODO: implement delete comment api
    },
    onMutate: async ({ commentId }) => {
      await queryClient.cancelQueries({ queryKey });
      // await queryClient.cancelQueries({ queryKey: newsKeys.savedNews(1) });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey) as Comment[];
      // const previousSavedNews = queryClient.getQueryData(newsKeys.savedNews(1));

      queryClient.setQueryData(queryKey, (data: Comment[]) => {
        return data.filter(comment => comment.id !== commentId);
      });

      return { previousData };
    },
    onError: (_err, _data, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({
      commentId,
      data,
    }: {
      commentId: string;
      data: Partial<Comment>;
    }) => {
      //TODO: implement edit comment api
    },
    onMutate: async ({ commentId, data }) => {
      await queryClient.cancelQueries({ queryKey });
      // await queryClient.cancelQueries({ queryKey: newsKeys.savedNews(1) });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey) as Comment[];
      // const previousSavedNews = queryClient.getQueryData(newsKeys.savedNews(1));

      queryClient.setQueryData(queryKey, (prevData: Comment[]) => {
        return prevData.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                ...data,
                mentionUsers: data.content
                  ? getMentions(data.content)
                  : comment.mentionUsers,
              }
            : comment,
        );
      });

      return { previousData };
    },
    onError: (_err, _data, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
    },
  });

  return {
    addComment,
    isPendingAdd: addMutation.isPending,
    deleteComment: deleteMutation.mutateAsync,
    isPendingDelete: deleteMutation.isPending,
    editComment: editMutation.mutateAsync,
    isPendingEdit: editMutation.isPending,
    getMentions,
    showAdd: !!users && !!users.length,
  };
};
