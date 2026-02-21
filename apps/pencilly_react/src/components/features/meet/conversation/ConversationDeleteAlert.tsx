import React, { type FC } from "react";

import ConfirmAlert from "@/components/shared/ConfirmAlert";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";

interface IProps {
  renderTrigger?: (label: string) => React.ReactNode;
  isOwner?: boolean;
  isGroup?: boolean;
  onLeaveGroup: () => void;
  onDeleteForEveryone?: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const ConversationDeleteAlert: FC<IProps> = ({
  isOwner,
  onDeleteForEveryone,
  onLeaveGroup,
  renderTrigger,
  isGroup,
  open,
  setOpen,
}) => {
  const t = useTranslations("meet.conversation");

  // For groups: "Leave", for 2-person: "Delete"
  const leaveOrDeleteLabel = isGroup ? t("leave") : t("delete");
  const leaveOrDeleteConfirmMessage = isGroup
    ? t("leave_confirm")
    : t("delete_confirm");

  return (
    <ConfirmAlert
      title={leaveOrDeleteLabel}
      btnTitle={leaveOrDeleteLabel}
      message={leaveOrDeleteConfirmMessage}
      onAccept={onLeaveGroup}
      contentClassName="z-100"
      isDanger
      open={open}
      setOpen={setOpen}
      Action={
        isOwner ? (
          <Button
            color="danger"
            className="border-danger text-danger"
            variant="outline"
            onClick={() => onDeleteForEveryone?.()}
          >
            {t("delete_for_everyone")}
          </Button>
        ) : undefined
      }
    >
      {renderTrigger?.(leaveOrDeleteLabel)}
    </ConfirmAlert>
  );
};

export default ConversationDeleteAlert;
