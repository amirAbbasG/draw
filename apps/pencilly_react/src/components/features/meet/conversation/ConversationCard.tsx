import React, { useMemo, useState, type FC } from "react";

import { ConversationAvatar } from "@/components/features/meet/conversation/ConversationAvatar";
import ConversationDeleteAlert from "@/components/features/meet/conversation/ConversationDeleteAlert";
import RenderIf from "@/components/shared/RenderIf";
import { Badge } from "@/components/ui/badge";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { Conversation } from "../types";

const MAX_DISPLAY_MEMBERS = 3;

interface ConversationCardProps {
  conversation: Conversation;
  onCall?: (conversation: Conversation) => void;
  onVideoCall?: (conversation: Conversation) => void;
  onLeave?: (conversation: Conversation) => void;
  onDelete?: (conversation: Conversation) => void;
  onMute?: (conversation: Conversation) => void;
  className?: string;
  onClick?: () => void;
}

const ConversationCard: FC<ConversationCardProps> = ({
  conversation,
  onCall,
  onVideoCall,
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
    avatarUrl,
    members = [],
    lastMessage,
    unseenCount,
    isOnline,
    isGroup = false,
    isMuted = false,
  } = conversation;

  const isOwner = conversation.role === "owner";


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
    if (!lastMessage) return t("no_messages_yet");
    return `${lastMessage.senderName}: ${lastMessage.text}`;
  }, [lastMessage, t]);

  const timestamp = lastMessage?.timestamp;
  const leaveOrDeleteLabel = isGroup ? t("leave") : t("delete");

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
            avatarUrl={avatarUrl}
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
          <div className="flex items-center gap-1">
            <AppTypo variant="small" color="secondary" className="truncate">
              {subtitle}
            </AppTypo>
            {timestamp && (
              <>
                <AppTypo variant="small" color="secondary" className="shrink-0">
                  {"·"}
                </AppTypo>
                <AppTypo variant="small" color="secondary" className="shrink-0">
                  {timestamp}
                </AppTypo>
              </>
            )}
          </div>
        </div>

        {/* Unseen Message */}
        <RenderIf isTrue={unseenCount != null && unseenCount > 0}>
          <Badge className="size-4 p-0 text-[8px] centered-col shrink-0">
            {unseenCount! > 99 ? "99+" : unseenCount}
          </Badge>
        </RenderIf>

        {/* Audio call button */}
        <AppIconButton
          icon={sharedIcons.call}
          size="xs"
          className="shrink-0 -me-1"
          onClick={e => {
            e.stopPropagation();
            onCall?.(conversation);
          }}
        />

        {/* More popup (3-dot menu) */}
        <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
          <DropdownMenuTrigger
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <AppIconButton
              icon="hugeicons:more-vertical"
              size="xs"
              element="div"
              className="shrink-0"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            // portal={false}
            align="end"
            className="w-32 z-100"
            onClick={e => e.stopPropagation()}
          >
            {/* Video call */}
            <DropdownMenuItem
              icon={sharedIcons.video}
              onClick={() => {
                setMoreOpen(false);
                onVideoCall?.(conversation);
              }}
            >
              {tMeet("video_call")}
            </DropdownMenuItem>

            {/* Mute / Unmute */}
            <DropdownMenuItem
              icon={
                isMuted
                  ? "hugeicons:notification-snooze-03"
                  : "hugeicons:notification-off-03"
              }
              onClick={() => {
                setMoreOpen(false);
                onMute?.(conversation);
              }}
            >
              {isMuted ? t("unmute") : t("mute")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="!text-danger"
              icon={isGroup ? sharedIcons.logout : sharedIcons.delete}
                onClick={() => setOpenDelete(true)}
            >
              {leaveOrDeleteLabel}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
