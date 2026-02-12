import React, { useMemo, type FC } from "react";

import { ConversationAvatar } from "@/components/features/meet/conversation/ConversationAvatar";
import RenderIf from "@/components/shared/RenderIf";
import { Badge } from "@/components/ui/badge";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";

import type { Conversation } from "../types";

const MAX_DISPLAY_MEMBERS = 3;

interface ConversationCardProps {
  conversation: Conversation;
  onCall?: (conversation: Conversation) => void;
  className?: string;
  onClick?: () => void;
}

const ConversationCard: FC<ConversationCardProps> = ({
  conversation,
  onCall,
  className,
  onClick,
}) => {
  const {
    isGroup,
    title,
    avatarUrl,
    members,
    lastMessage,
    unseenCount,
    isOnline,
  } = conversation;

  const displayTitle = useMemo(() => {
    if (title) return title;

    if (isGroup) {
      const names = members.slice(0, MAX_DISPLAY_MEMBERS).map(m => m.name);
      const suffix = members.length > MAX_DISPLAY_MEMBERS ? ", ..." : "";
      return names.join(", ") + suffix;
    }

    return members[0]?.name ?? "Unknown";
  }, [title, isGroup, members]);

  const subtitle = useMemo(() => {
    if (!lastMessage) return "No Messages Yet.";
    return `${lastMessage.senderName}: ${lastMessage.text}`;
  }, [lastMessage]);

  const timestamp = lastMessage?.timestamp;

  return (
    <div
      className={cn(
        "row gap-2 p-2  transition-colors hover:bg-background cursor-pointer",
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
        {/*Online Status*/}
        <RenderIf isTrue={isOnline}>
          <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
        </RenderIf>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 col gap-0.5">
        <AppTypo variant="headingXS" className=" truncate">
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

      {/*Unseen Message*/}
      <RenderIf isTrue={unseenCount != null && unseenCount > 0}>
        <Badge className=" size-4 p-0 text-[8px] centered-col shrink-0">
          {unseenCount > 99 ? "99+" : unseenCount}
        </Badge>
      </RenderIf>

      <AppIconButton
        icon={sharedIcons.call}
        variant="outline"
        className="shrink-0"
        onClick={e => {
          e.stopPropagation();
          onCall?.(conversation);
        }}
      />
    </div>
  );
};

export default ConversationCard;
