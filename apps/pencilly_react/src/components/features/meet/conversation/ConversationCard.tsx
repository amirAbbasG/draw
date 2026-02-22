import React, { useMemo, useState, type FC } from "react";

import { ConversationAvatar } from "@/components/features/meet/conversation/ConversationAvatar";
import ConversationDeleteAlert from "@/components/features/meet/conversation/ConversationDeleteAlert";
import MoreDropdown, {
  MoreMenuIem,
} from "@/components/features/meet/MoreDropdown";
import { formatMessageTime } from "@/components/features/meet/utils";
import RenderIf from "@/components/shared/RenderIf";
import { Badge } from "@/components/ui/badge";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { CallType, Conversation } from "../types";

const MAX_DISPLAY_MEMBERS = 3;

interface ConversationCardProps {
  conversation: Conversation;
  onCall: (conversation: Conversation, type: CallType) => void;
  onLeave?: (conversation: Conversation) => void;
  onDelete?: (conversation: Conversation) => void;
  onMute?: (conversation: Conversation) => void;
  className?: string;
  onClick?: () => void;
}

const ConversationCard: FC<ConversationCardProps> = ({
  conversation,
  onCall,
  onLeave,
  onDelete,
  onMute,
  className,
  onClick,
}) => {
  const t = useTranslations("meet.conversation");
  const tMeet = useTranslations("meet");
  const [moreOpen, setMoreOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const {
    title,
    profile_image_url,
    members = [],
    last_message,
    unseenCount,
    isOnline,
    isGroup = false,
    muted = false,
      call_state
  } = conversation;

  const isOwner = conversation.role === "owner";
  const canStartCall = isOwner || call_state === "open";


  const displayTitle = useMemo(() => {
    if (title) return title;

    if (isGroup && members.length > 0) {
      const names = members.slice(0, MAX_DISPLAY_MEMBERS).map(m => m.name);
      const suffix = members.length > MAX_DISPLAY_MEMBERS ? ", ..." : "";
      return names.join(", ") + suffix;
    }

    if (members.length > 0) {
      return members[0]?.name ?? t("unknown");
    }

    return t("unknown");
  }, [title, isGroup, members, t]);

  const subtitle = useMemo(() => {
    if (!last_message) return t("no_messages_yet");

    const senderName = last_message.isCurrentUser
      ? t("you")
      : last_message.actor
        ? last_message.actor.name
        : last_message.payload?.agentType
          ? last_message.payload.agentType.replaceAll("-", " ")
          : t("unknown");
    return `${senderName}: ${last_message.body}`;
  }, [last_message, t]);

  const leaveOrDeleteLabel = isGroup ? t("leave") : t("delete");

  const moreOptions: MoreMenuIem[] = [
    {
      label: tMeet("audio_call"),
      icon: sharedIcons.call,
      onClick: () => onCall(conversation, "audio"),
      disabled: !canStartCall,
    },
    {
      label: tMeet("video_call"),
      icon: sharedIcons.video,
      onClick: () => onCall(conversation, "video"),
      disabled: !canStartCall,
    },
    {
      label: muted ? t("unmute") : t("mute"),
      icon: muted
        ? "hugeicons:notification-snooze-03"
        : "hugeicons:notification-off-03",
      onClick: () => onMute?.(conversation),
    },
    {
      label: leaveOrDeleteLabel,
      icon: isGroup ? sharedIcons.logout : sharedIcons.delete,
      className: "!text-danger",
      onClick: () => setOpenDelete(true),
      preventCloseOnClick: true,
    },
  ];

  return (
    <>
      <div
        className={cn(
          "row gap-2 p-2 transition-colors hover:bg-background cursor-pointer",
          className,
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === "Enter") onClick?.();
        }}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <ConversationAvatar
            isGroup={isGroup}
            avatarUrl={profile_image_url}
            members={members}
          />
          <RenderIf isTrue={isOnline}>
            <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
          </RenderIf>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 col gap-0.5">
          <AppTypo variant="headingXS" className="truncate">
            {displayTitle}
          </AppTypo>
          <div className="flex items-center gap-1 pe-2">
            <AppTypo variant="small" color="secondary" className="truncate first-letter:capitalize">
              {subtitle} .
            </AppTypo>
            {last_message?.createdAt && (
              <AppTypo variant="xs" color="secondary" className="shrink-0">
                {formatMessageTime(last_message.createdAt)}
              </AppTypo>
            )}
          </div>
        </div>

        {/* Unseen Message */}
        <RenderIf isTrue={unseenCount != null && unseenCount > 0}>
          <Badge
            className={cn(
              "size-4 p-0 text-[8px] centered-col shrink-0",
              muted && "!bg-muted !text-foreground",
            )}
          >
            {unseenCount! > 99 ? "99+" : unseenCount}
          </Badge>
        </RenderIf>

        {/* Audio call button */}
        {/*<AppIconButton*/}
        {/*  icon={sharedIcons.call}*/}
        {/*  size="xs"*/}
        {/*  variant="outline"*/}
        {/*  className="shrink-0 -me-0.5 "*/}
        {/*  iconClassName="!size-3.5"*/}
        {/*  onClick={e => {*/}
        {/*    e.stopPropagation();*/}
        {/*    onCall?.(conversation, "audio");*/}
        {/*  }}*/}
        {/*/>*/}
        <MoreDropdown
          items={moreOptions}
          open={moreOpen}
          setOpen={setMoreOpen}
        />
        {/* More popup (3-dot menu) */}
      </div>
      <ConversationDeleteAlert
        onLeaveGroup={() => {
          setMoreOpen(false);
          onLeave?.(conversation);
        }}
        onDeleteForEveryone={() => {
          setMoreOpen(false);
          onDelete?.(conversation);
        }}
        isOwner={isOwner}
        isGroup={isGroup}
        open={openDelete}
        setOpen={setOpenDelete}
      />
    </>
  );
};

export default ConversationCard;
