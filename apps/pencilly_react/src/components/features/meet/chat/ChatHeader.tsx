import React, { useMemo, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import { Show } from "@/components/shared/Show";
import { Button } from "@/components/ui/button";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { AppTooltip } from "@/components/ui/custom/app-tooltip";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn, isEmpty } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { CallType, ChatView, Conversation, MeetUser } from "../types";

interface ChatHeaderProps {
  conversation: Conversation;
  activeView: ChatView;
  onBack: () => void;
  onViewChange: (view: ChatView) => void;
  onCall: (type: CallType) => void;
  className?: string;
  isActiveCall: boolean;
  onJoinCall: () => void;
  members: MeetUser[];
  chatWithMember: (user: MeetUser, me?: MeetUser) => void;
}

const ChatHeader: FC<ChatHeaderProps> = ({
  conversation,
  activeView,
  onBack,
  onViewChange,
  onCall,
  className,
  isActiveCall,
  onJoinCall,
  members,
  chatWithMember,
}) => {
  const t = useTranslations("meet.chat");
  const { isGroup = false, title, role, call_state } = conversation;

  const canStartCall = role === "owner" || call_state === "open";
  const canJoinCall = role === "owner" || call_state !== "closed";

  const headerMembers = useMemo(() => {
    if (!isGroup) return [];
    return members.filter(m => !m.isCurrentUser).slice(0, 6);
  }, [members, isGroup]);

  return (
    <div
      className={cn("row gap-2  px-2.5 py-2 bg-popover  z-20", className)}
      style={{
        boxShadow:
          "0 0 1px 0 rgba(9, 30, 66, 0.31), 0 3px 5px 0 rgba(9, 30, 66, 0.20)",
      }}
    >
      {/* Back button */}
      <AppIconButton
        icon={sharedIcons.arrow_left}
        size="sm"
        onClick={onBack}
        title={t("back")}
        className="bg-background-light"
      />

      {/* Title */}
      <Show>
        <Show.When isTrue={isGroup && !isEmpty(members)}>
          <div className=" flex -space-x-2 me-auto">
            {headerMembers?.map(member => (
              <AppTooltip title={member.username} key={member.id}>
                <span
                  onClick={() => chatWithMember(member)}
                  className="cursor-pointer"
                >
                  <UserAvatar
                    name={member.name}
                    imageSrc={member.avatarUrl}
                    className="size-6 shadow-sm"
                  />
                </span>
              </AppTooltip>
            ))}
          </div>
        </Show.When>
        <Show.Else>
          <AppTypo
            variant="headingXXS"
            className="truncate cursor-default flex-1"
          >
            {title}
          </AppTypo>
        </Show.Else>
      </Show>

      {/* Action buttons */}
      <div className="row gap-2 shrink-0 ">
        <Show>
          <Show.When isTrue={isActiveCall && isGroup}>
            <Button
              size="sm"
              className="!h-7"
              onClick={onJoinCall}
              disabled={!canJoinCall}
            >
              {t("join_meet")}
            </Button>
          </Show.When>
          <Show.Else>
            <AppIconButton
              icon={sharedIcons.call}
              size="sm"
              onClick={() => onCall("audio")}
              title={t("voice_call")}
              className="bg-background-light"
              disabled={!canStartCall}
            />
            <AppIconButton
              icon={sharedIcons.video}
              size="sm"
              onClick={() => onCall("video")}
              title={t("video_call")}
              className="bg-background-light"
              disabled={!canStartCall}
            />
          </Show.Else>
        </Show>

        <AppIconButton
          icon="hugeicons:information-circle"
          className="bg-background-light"
          size="sm"
          onClick={() => onViewChange(activeView === "info" ? "chat" : "info")}
          title={t("info.title")}
          selected={activeView === "info"}
        />
      </div>
    </div>
  );
};

export default ChatHeader;
