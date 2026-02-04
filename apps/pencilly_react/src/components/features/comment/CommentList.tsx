import React, { useState, type FC } from "react";

import { useTranslations } from "@/i18n";


import CommentCard from "@/components/features/comment/comment-card";
import RenderIf from "@/components/shared/RenderIf";
import { Show } from "@/components/shared/Show";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { sharedIcons } from "@/constants/icons";
import { useGetMe } from "@/services/user";

import type { Comment } from "./types";

type Filter = "all" | "resolved" | "your_comment" | "for_you";

const filters: Filter[] = ["all", "resolved", "your_comment", "for_you"];

interface IProps {
  comments: Comment[];
  onSelect: (comment: Comment) => void;
  onClose?: () => void;
}

const CommentList: FC<IProps> = ({ comments, onSelect, onClose }) => {
  const t = useTranslations("comment");

  const [filter, setFilter] = useState<Filter>("all");
  const { data } = useGetMe();

  const filteredComments = comments.filter(comment => {
    const {
      user: { username },
    } = comment;

    switch (filter) {
      case "all":
        return !comment.resolved;
      case "resolved":
        return comment.resolved;
      case "your_comment":
        return data ? username === data.username && !comment.resolved : true;
      case "for_you":
        return data
          ? comment.mentionUsers.some(u => u.username === data.username) &&
              !comment.resolved
          : true;
    }
  });

  const onChange = (val: string) => {
    setFilter(val as Filter);
  };

  return (
    <>
      <div className="row p-3 pb-0 ">
        <Select value={filter} onValueChange={onChange}>
          <SelectTrigger className="mb-2 w-fit bg-transparent border-none hover:bg-background-light row gap-1.5">
            <AppIcon icon={sharedIcons.filter} className="size-3.5" />
            {t(filter)}
          </SelectTrigger>
          <SelectContent>
            {filters.map(f => (
              <SelectItem
                key={f}
                value={f}
                data-state={filter === f ? "checked" : undefined}
              >
                {t(f)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AppIconButton
          className="ms-auto"
          element="div"
          icon={sharedIcons.close}
          size="xs"
          onClick={onClose}
        />
      </div>
      <div className="col gap-2 p-3">
        <Show>
          <Show.When isTrue={!filteredComments.length}>
            <AppTypo color="secondary" className="text-center ">
              {t(`${filter}_empty`)}
            </AppTypo>
            <RenderIf isTrue={filter !== "all"}>
              <Button
                variant="ghost"
                onClick={() => setFilter("all")}
                className="text-primary hover:text-primary-dark"
              >
                {t("clear_filter")}
              </Button>
            </RenderIf>
          </Show.When>
          <Show.Else>
            {filteredComments.map(c => (
              <CommentCard comment={c} key={c.id} onClick={() => onSelect(c)} />
            ))}
          </Show.Else>
        </Show>
      </div>
    </>
  );
};

export default CommentList;
