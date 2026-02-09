import React, { type FC, useMemo } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import { Badge } from "@/components/ui/badge";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";

import type { Conversation } from "./types";

const MAX_DISPLAY_MEMBERS = 3;

interface ConversationCardProps {
  conversation: Conversation;
  onCall?: (conversation: Conversation) => void;
  className?: string;
}

const ConversationCard: FC<ConversationCardProps> = ({
  conversation,
  onCall,
  className,
}) => {
  const { isGroup, title, avatarUrl, members, lastMessage, unseenCount, isOnline } =
    conversation;

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
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-background cursor-pointer",
        className,
      )}
    >
      {/* Avatar */}
      <ConversationAvatar
        isGroup={isGroup}
        avatarUrl={avatarUrl}
        members={members}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 col gap-0.5">
        <AppTypo variant="small" className="font-semibold truncate">
          {displayTitle}
        </AppTypo>
        <div className="flex items-center gap-1">
          <AppTypo variant="xs" color="secondary" className="truncate">
            {subtitle}
          </AppTypo>
          {timestamp && (
            <>
              <AppTypo variant="xs" color="muted" className="shrink-0">
                {"·"}
              </AppTypo>
              <AppTypo variant="xs" color="muted" className="shrink-0">
                {timestamp}
              </AppTypo>
            </>
          )}
        </div>
      </div>

      {/* Online indicator */}
      {isOnline && (
        <span className="size-3 rounded-full bg-primary shrink-0" />
      )}

      {/* Call button with badge */}
      <div className="relative shrink-0">
        <AppIconButton
          icon={sharedIcons.call}
          size="default"
          variant="outline"
          className="rounded-lg border-border"
          onClick={e => {
            e.stopPropagation();
            onCall?.(conversation);
          }}
        />
        {unseenCount != null && unseenCount > 0 && (
          <Badge className="absolute -top-1.5 -end-1.5 size-5 p-0 text-[10px] items-center justify-center">
            {unseenCount > 99 ? "99+" : unseenCount}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ConversationCard;

/* ---------- Sub-components ---------- */

interface ConversationAvatarProps {
  isGroup: boolean;
  avatarUrl?: string;
  members: Conversation["members"];
}

const ConversationAvatar: FC<ConversationAvatarProps> = ({
  isGroup,
  avatarUrl,
  members,
}) => {
  if (isGroup) {
    if (avatarUrl) {
      return (
        <UserAvatar
          imageSrc={avatarUrl}
          name="Group"
          className="size-11 text-xs"
        />
      );
    }

    return (
      <div className="size-11 rounded-full bg-primary-lighter flex items-center justify-center shrink-0">
        <AppIcon
          icon={sharedIcons.user_group}
          className="size-5 text-primary"
        />
      </div>
    );
  }

  const member = members[0];
  return (
    <UserAvatar
      imageSrc={member?.avatarUrl}
      name={member?.name ?? "Unknown"}
      className="size-11 text-sm"
    />
  );
};
