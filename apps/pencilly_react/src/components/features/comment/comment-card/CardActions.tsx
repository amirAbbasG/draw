import React, { useState, type FC } from "react";

import { useTranslations } from "@/i18n";
import { toast } from "sonner";

import ConfirmAlert from "@/components/shared/ConfirmAlert";
import RenderIf from "@/components/shared/RenderIf";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sharedIcons } from "@/constants/icons";

interface IProps {
  toggleResolve: (value?: boolean) => void;
  onDelete: () => void;
  onEdit: () => void;
  isReply?: boolean;
  isResolve?: boolean;
}

const CardActions: FC<IProps> = ({
  onDelete,
  onEdit,
  toggleResolve,
  isReply,
  isResolve,
}) => {
  const t = useTranslations("comment");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);

  const onClickResolve = () => {
    toggleResolve();

    toast(isResolve ? t("comment_restored") : t("comment_resolved"), {
      position: "top-center",
      action: isResolve
        ? undefined
        : {
            label: t("undo"),
            onClick: () => toggleResolve(false),
          },
    });
  };

  return (
    <div
      data-state={isOpen ? "open" : "close"}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="bg-background-lighter border rounded shadow-md row absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-all duration-200 data-[state=open]:!opacity-100 p-0.5"
    >
      <RenderIf isTrue={!isReply}>
        <AppIconButton
          icon={isResolve ? sharedIcons.restore : sharedIcons.check}
          title={t(isResolve ? "restore" : "resolve")}
          size="xs"
          onClick={onClickResolve}
        />
      </RenderIf>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <span>
            <AppIconButton
              icon={sharedIcons.more_horizontal}
              size="xs"
              className="data-[state=open]:bg-primary-lighter"
            />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={6}>
          <DropdownMenuItem icon={sharedIcons.edit} onClick={onEdit}>
            {t("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={sharedIcons.delete}
            onClick={() => setIsOpenDelete(true)}
          >
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmAlert
        isDanger
        title={t(isReply ? "delete_reply_title" : "delete_comment_title")}
        message={t(isReply ? "delete_reply_message" : "delete_comment_message")}
        onAccept={onDelete}
        btnTitle={t("delete")}
        open={isOpenDelete}
        setOpen={setIsOpenDelete}
      />
    </div>
  );
};

export default CardActions;
