import React, { useState, type FC } from "react";

import type { MeetUser } from "@/components/features/meet/types";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import ConfirmAlert from "@/components/shared/ConfirmAlert";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  member: MeetUser;
  onAddToCall?: (user: MeetUser) => void;
  isOwner: boolean;
  onDeleteMember?: (memberId: string) => void;
  onClick?: () => void;
}

const MemberCard: FC<IProps> = ({
  member,
  isOwner,
  onAddToCall,
  onDeleteMember,
  onClick,
}) => {
  const t = useTranslations("meet.chat.info");
  const [isOpeDelete, setIsOpeDelete] = useState(false);

  return (
    <>
      <div
        className={cn(
          "row p-2 gap-2 hover:bg-background transition-colors",
          onClick && "cursor-pointer",
        )}
        onClick={onClick}
      >
        <UserAvatar
          imageSrc={member.avatarUrl}
          name={member.name}
          className="size-12"
        />
        <AppTypo variant="headingXS" className="flex-1 truncate font-medium">
          {member.name}
        </AppTypo>

        {(onAddToCall && !member.isCurrentUser) && (
          <AppIconButton
            icon={sharedIcons.call}
            size="xs"
            variant="outline"
            title={t("call")}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              onAddToCall(member);
            }}
          />
        )}

        {(isOwner&& !member.isCurrentUser) && (
          <AppIconButton
            icon={sharedIcons.delete}
            size="xs"
            variant="outline"
            color="danger"
            title={t("delete_member")}
            onClick={e => {
              e.stopPropagation();
              setIsOpeDelete(prev => !prev);
            }}
          />
        )}
      </div>
      {isOwner && (
        <ConfirmAlert
          open={isOpeDelete}
          setOpen={setIsOpeDelete}
          title={t("delete_member")}
          btnTitle={t("delete")}
          message={t("delete_member_confirm")}
          onAccept={() => onDeleteMember(member.id)}
          contentClassName="z-100"
          isDanger
        />
      )}
    </>
  );
};

export default MemberCard;
