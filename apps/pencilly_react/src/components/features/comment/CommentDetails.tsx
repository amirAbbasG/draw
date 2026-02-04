import React, { type FC } from "react";

import { useTranslations } from "@/i18n";

import CommentCard from "@/components/features/comment/comment-card";
import CommentTextField from "@/components/features/comment/CommentTextField";
import { useCommentDetailsActions } from "@/components/features/comment/useCommentDetailsActions";
import RenderIf from "@/components/shared/RenderIf";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { setCurrentCommentId } from "@/stores/zustand/ui/actions";
import { sharedIcons } from "@/constants/icons";

import type { Comment } from "./types";

interface IProps {
  comment: Comment;
  onClose?: () => void;
  currentIndex: number;
  totalCount: number;
  getId: (index: number) => string | undefined;
}

const CommentDetails: FC<IProps> = ({
  comment,
  onClose,
  currentIndex = 0,
  getId,
  totalCount = 0,
}) => {
  const t = useTranslations("comment");
  const replyLength = comment.replies?.length || 0;
  const { addReply, isPendingEdit } = useCommentDetailsActions(comment);

  return (
    <>
      <div className="row p-3 pb-0 ">
        <AppIconButton
          icon={sharedIcons.arrow_left}
          onClick={() => setCurrentCommentId(undefined)}
        />
        <div className="row gap-1 mx-auto">
          <AppIconButton
            icon={sharedIcons.chevron_left}
            size="xs"
            title={t("previous_comment")}
            disabled={currentIndex === 0}
            onClick={() => setCurrentCommentId(getId(currentIndex! - 1))}
          />
          <AppTypo variant="small">
            {(currentIndex || 0) + 1} / {totalCount}
          </AppTypo>
          <AppIconButton
            icon={sharedIcons.chevron_right}
            size="xs"
            title={t("next_comment")}
            disabled={
              currentIndex === undefined || currentIndex >= totalCount - 1
            }
            onClick={() => setCurrentCommentId(getId(currentIndex! + 1))}
          />
        </div>

        <AppIconButton
          element="div"
          icon={sharedIcons.close}
          size="xs"
          onClick={onClose}
        />
      </div>

      <div className="col ">
        <CommentCard
          comment={{
            ...comment,
            replies: [],
          }}
          className="border-transparent rounded-none"
          showReaction
          editClassName="p-3"
        />
        <RenderIf isTrue={!!comment.replies.length}>
          <AppTypo className="row gap-1 px-3 my-2">
            {replyLength} {t(replyLength > 1 ? "replies" : "reply")}
            <span className="flex-1 h-[1px] bg-background-dark" />
          </AppTypo>
          {comment.replies.map(r => (
            <CommentCard
              key={r.id}
              comment={r as Comment}
              className="border-transparent rounded-none "
              editClassName="p-3"
              showReaction
              parent={comment}
            />
          ))}
        </RenderIf>
        <CommentTextField
          rootClassName="border-t"
          onSubmit={addReply}
          isPending={isPendingEdit}
        />
      </div>
    </>
  );
};

export default CommentDetails;
