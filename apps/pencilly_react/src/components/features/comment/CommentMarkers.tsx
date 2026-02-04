import React, { type FC } from "react";

import { useShallow } from "zustand/react/shallow";

import type { Comment } from "@/components/features/comment/types";
import { useGetComments } from "@/components/features/comment/useGetComments";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import { cn } from "@/lib/utils";
import { setCurrentCommentId } from "@/stores/zustand/ui/actions";
import { useUiStore } from "@/stores/zustand/ui/ui-store";

interface ItemProps {
  comment: Comment;
  top: number;
  right: number;
  transform?: string;
  hide?: boolean;
}

const MakerItem: FC<ItemProps> = ({ comment, top, right, transform, hide }) => {
  const currentCommentId = useUiStore(
    useShallow(state => state.currentCommentId),
  );
  if (hide) return null;

  return (
    <div
      className="absolute z-30"
      style={{
        top: top + "px",
        right: right + "px",
        transform,
      }}
    >
      <div
        className="relative cursor-pointer group"
        onClick={() => setCurrentCommentId(comment.id)}
      >
        <AppIcon
          icon="iconoir:chat-bubble-xmark-solid"
          className={cn(
            "size-10 cursor-pointer text-primary-light  group-hover:text-primary transition-all duration-200 ",
            currentCommentId === comment.id && "text-primary",
          )}
        />
        <UserAvatar
          imageSrc={comment.user?.profile_image_url}
          name={comment.user?.username}
          className="size-7 absolute top-1.5 start-1.5 z-10"
          fallbackClassname="bg-background-light"
        />
      </div>
    </div>
  );
};

interface IProps {
  elements: DrawElements;
  drawAPI: DrawAPI;
}

const CommentMarkers = ({ drawAPI, elements }: IProps) => {
  const { data } = useGetComments();
  const hideComments = useUiStore(useShallow(state => state.hideComments));

  const comments = data?.map(c => {
    const item = elements.find(el => el.id === c.itemId);
    const appState = drawAPI?.getAppState();

    if (!item || !appState)
      return {
        ...c,
        top: -48,
        right: -48,
        transform: undefined,
      };

    const zoomLevel = appState.zoom.value || 1;
    const space = 8 / zoomLevel;
    const itemSize = 40 / zoomLevel + space;

    const { width: stageWidth = 0, scrollX = 0, scrollY = 0 } = appState;
    const { width = 0, height = 0, x = 0, y = 0 } = item;

    const elementRight = stageWidth - x + scrollX;
    const rightOffset = elementRight - width - itemSize;
    const rightFallback = elementRight + space;

    const elementTop = y + scrollY;
    const topOffset = elementTop - space;
    const topFallback = elementTop + height - itemSize;

    return {
      ...c,
      top: (topOffset < 0 ? topFallback : topOffset) * zoomLevel,
      right: (rightOffset < 0 ? rightFallback : rightOffset) * zoomLevel,
      transform: rightOffset < 0 ? "scaleX(-1)" : undefined,
    };
  });

  if (hideComments) return null;

  return (
    <>
      {comments && comments.length
        ? comments.map(c => (
            <MakerItem
              key={c.id}
              comment={c}
              top={c.top}
              right={c.right}
              transform={c.transform}
            />
          ))
        : null}
    </>
  );
};

export default CommentMarkers;
