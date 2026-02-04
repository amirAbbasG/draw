import { useCommentActions } from "@/components/features/comment/useCommentActions";
import { useGetMe } from "@/services/user";

import type { Comment, Reaction, Reply } from "./types";

export const useCommentDetailsActions = (comment: Comment) => {
  const { data: user } = useGetMe();
  const { editComment, isPendingEdit, getMentions } = useCommentActions();
  const { deleteComment, isPendingDelete } = useCommentActions();

  const addReply = (content: string) => {
    if (!user) return;
    const reply: Reply = {
      id: crypto.randomUUID(),
      content,
      reactions: [],
      createdAt: new Date().toISOString(),
      mentionUsers: getMentions(content),
      user,
    };
    void editComment({
      commentId: comment.id,
      data: {
        replies: [...(comment.replies || []), reply],
      },
    });
  };

  const deleteItem = (id: string, iseReply: boolean) => {
    if (iseReply) {
      void editComment({
        commentId: comment.id,
        data: {
          replies: (comment.replies || []).filter(r => r.id !== id),
        },
      });
    } else {
      void deleteComment({ commentId: id });
    }
  };

  const addReaction = (content: string, replyId?: string) => {
    if (!user) return;

    const getList = (reactions: Reaction[] = []) => {
      const existing = reactions.find(r => r.content === content);
      if (existing) {
        if (existing.users.find(u => u.username === user.username)) {
          return reactions;
        }
        return reactions.map(r =>
          r.id === existing.id
            ? { ...r, users: [...(r.users || []), user] }
            : r,
        );
      }
      return [
        ...reactions,
        { id: crypto.randomUUID(), content, users: [user] } as Reaction,
      ];
    };

    void editComment({
      commentId: comment.id,
      data: replyId
        ? {
            replies: (comment.replies || []).map(r =>
              r.id === replyId ? { ...r, reactions: getList(r.reactions) } : r,
            ),
          }
        : { reactions: getList(comment.reactions) },
    });
  };

  const onClickReaction = (id: string, replyId?: string) => {
    if (!user) return;

    const getList = (reactions: Reaction[] = []) => {
      const existing = reactions.find(r => r.id === id);
      if (!existing) return reactions;
      const isUserReacted = existing.users.find(
        u => u.username === user.username,
      );
      return reactions.map(r =>
        r.id === id
          ? {
              ...r,
              users: isUserReacted
                ? (r.users || []).filter(u => u.username !== user.username)
                : [...(r.users || []), user],
            }
          : r,
      );
    };

    void editComment({
      commentId: comment.id,
      data: replyId
        ? {
            replies: (comment.replies || []).map(r =>
              r.id === replyId ? { ...r, reactions: getList(r.reactions) } : r,
            ),
          }
        : { reactions: getList(comment.reactions) },
    });
  };

  const toggleResolve = (id: string, value?: boolean) => {
    void editComment({
      commentId: comment.id,
      data: { resolved: value !== undefined ? value : !comment.resolved },
    });
  };

  const editContent = (content: string, isReply?: boolean) => {
    void editComment({
      commentId: comment.id,
      data: isReply
        ? {
            replies: (comment.replies || []).map(r =>
              r.id === comment.id
                ? { ...r, content, mentionUsers: getMentions(content) }
                : r,
            ),
          }
        : { content, mentionUsers: getMentions(content) },
    });
  };

  return {
    addReply,
    deleteItem,
    addReaction,
    onClickReaction,
    toggleResolve,
    isPendingEdit,
    isPendingDelete,
    editContent,
  };
};
