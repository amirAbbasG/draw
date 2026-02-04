import React, { useState, type FC } from "react";

import { useTranslations } from "@/i18n";


import CardActions from "@/components/features/comment/comment-card/CardActions";
import Reactions from "@/components/features/comment/comment-card/Reactions";
import { renderContent } from "@/components/features/comment/comment-card/render-content";
import CommentTextField from "@/components/features/comment/CommentTextField";
import { useCommentDetailsActions } from "@/components/features/comment/useCommentDetailsActions";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import RenderIf from "@/components/shared/RenderIf";
import AppTypo from "@/components/ui/custom/app-typo";
import { timePassedSince } from "@/lib/date-transform";
import { cn } from "@/lib/utils";

import type { Comment } from "../types";

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  comment: Comment;
  showReaction?: boolean;
  parent?: Comment;
  editClassName?: string;
}

const CommentCard: FC<IProps> = ({
  comment,
  className,
  showReaction,
  parent,
  editClassName,
  ...otherProps
}) => {
  const dataT = useTranslations("date");
  const t = useTranslations("comment");
  const user = comment.user;
  const {
    addReaction,
    onClickReaction,
    toggleResolve,
    deleteItem,
    editContent,
  } = useCommentDetailsActions(parent || comment);
  const [showEdit, setShowEdit] = useState(false);

  const replyLength = comment.replies?.length || 0;

  if (showEdit) {
    return (
      <div className={editClassName}>
        <CommentTextField
          rootClassName="rounded border focus-within:border-primary"
          onSubmit={content => editContent(content, !!parent)}
          actions="edit"
          onClose={() => setShowEdit(false)}
          defaultValue={comment.content.replace(
            /\{\{(.*?)\}\}/g,
            (_match, val) => `@${val}`,
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded border p-3 col  gap-3 cursor-pointer hover:bg-background-light transition-all duration-200 relative group",
        className,
      )}
      {...otherProps}
    >
      <CardActions
        onEdit={() => setShowEdit(true)}
        isReply={!!parent}
        onDelete={() => deleteItem(comment.id, !!parent)}
        isResolve={comment.resolved}
        toggleResolve={value => toggleResolve(comment.id, value)}
      />

      <div className="row gap-2">
        <UserAvatar
          imageSrc={user.profile_image_url}
          name={user.username}
          className="w-9 h-9 border-2 border-primary"
        />
        <div className="col">
          <AppTypo>
            {user.first_name
              ? `${user.first_name} ${user.last_name || ""}`
              : user.username}
          </AppTypo>
          <AppTypo variant="small" color="secondary">
            {timePassedSince(comment.createdAt, true, key => dataT(key))}
          </AppTypo>
        </div>
      </div>

      <AppTypo className=" line-clamp-1 text-wrap truncate " variant="small">
        {renderContent(comment.content, comment.mentionUsers)}
      </AppTypo>
      <RenderIf isTrue={replyLength > 0}>
        <div className="row gap-2 ">
          <div className=" flex -space-x-2 ">
            {comment?.replies?.map(reply => (
              <UserAvatar
                key={reply.id}
                imageSrc={user.profile_image_url}
                name={user.username}
                className="w-5 h-5 ring-1  ring-background-lighter border border-background-dark "
              />
            ))}
          </div>
          <AppTypo variant="small" color="secondary">
            {replyLength} {t(replyLength > 1 ? "replies" : "reply")}
          </AppTypo>
        </div>
      </RenderIf>

      <RenderIf isTrue={!!showReaction}>
        <Reactions
          reactions={comment.reactions || []}
          onAddReaction={content =>
            addReaction(content, parent ? comment.id : undefined)
          }
          onClickReaction={onClickReaction}
        />
      </RenderIf>
    </div>
  );
};

export default CommentCard;
