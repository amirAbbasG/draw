import React, { useState, type FC } from "react";

import { useTranslations } from "@/i18n";

import CommentTextField from "@/components/features/comment/CommentTextField";
import { useCommentActions } from "@/components/features/comment/useCommentActions";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { sharedIcons } from "@/constants/icons";

interface IProps {
  itemId: string;
  isStage?: boolean;
}

const AddCommentPopup: FC<IProps> = ({ itemId, isStage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { addComment, isPendingAdd, showAdd } = useCommentActions();
  const t = useTranslations("comment");

  const onSubmit = (content: string) => {
    addComment(content, itemId, !!isStage);
    setIsOpen(false);
  };

  if (!showAdd) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <AppIconButton
          element="div"
          size={isStage ? "xs" : "default"}
          icon={sharedIcons.add_comment}
          title={t("add_comment")}
        />
      </PopoverTrigger>
      <PopoverContent className="w-72 !shadow-lg  pb-0 pt-1" sideOffset={8}>
        <CommentTextField onSubmit={onSubmit} isPending={isPendingAdd} />
      </PopoverContent>
    </Popover>
  );
};

export default AddCommentPopup;
