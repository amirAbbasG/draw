import React, { useEffect, useState } from "react";

import { useShallow } from "zustand/react/shallow";

import CommentDetails from "@/components/features/comment/CommentDetails";
import CommentList from "@/components/features/comment/CommentList";
import { useGetComments } from "@/components/features/comment/useGetComments";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { setCurrentCommentId } from "@/stores/zustand/ui/actions";
import { useUiStore } from "@/stores/zustand/ui/ui-store";

interface IProps {
  Trigger: React.ReactNode;
}

const CommentPopup = ({ Trigger }: IProps) => {
  const { data, isPending } = useGetComments();
  const [isOpen, setIsOpen] = useState(false);
  const currentCommentId = useUiStore(
    useShallow(state => state.currentCommentId),
  );

  useEffect(() => {
    if (currentCommentId) {
      setIsOpen(true);
    }
  }, [currentCommentId]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentCommentId(undefined);
    }
  }, [isOpen]);

  const currentIndex = data?.findIndex(c => c.id == currentCommentId);
  const currentComment =
    currentIndex !== undefined && currentIndex > -1
      ? data?.[currentIndex]
      : undefined;

  if (!isPending && (!data || !data?.length)) return null;

  return (
    <Popover open={isOpen}>
      <PopoverTrigger onClick={() => setIsOpen(true)}>{Trigger}</PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden ">
        <div className="col max-h-[50vh] min-h-32 overflow-y-auto">
          {currentComment && currentCommentId ? (
            <CommentDetails
              comment={currentComment}
              currentIndex={currentIndex || 0}
              totalCount={data?.length || 0}
              getId={index => data?.[index]?.id}
              onClose={() => setIsOpen(false)}
            />
          ) : (
            <CommentList
              comments={data || []}
              onSelect={c => setCurrentCommentId(c.id)}
              onClose={() => setIsOpen(false)}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CommentPopup;
