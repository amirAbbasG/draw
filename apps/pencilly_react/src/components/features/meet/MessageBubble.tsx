import React, { type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

import type { ChatMessage, MessageStatus } from "./types";

interface MessageBubbleProps {
  message: ChatMessage;
  /** Whether this conversation is a group (shows avatar + sender name) */
  isGroup?: boolean;
  /** Highlight @mentions in the message text */
  highlightMentions?: boolean;
  className?: string;
}

const MessageBubble: FC<MessageBubbleProps> = ({
  message,
  isGroup = false,
  highlightMentions = true,
  className,
}) => {
  const { isCurrentUser, text, senderName, senderAvatarUrl, timestamp, status } =
    message;

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[85%]",
        isCurrentUser ? "ms-auto flex-row-reverse" : "me-auto",
        className,
      )}
    >
      {/* Avatar for group + other users */}
      {isGroup && !isCurrentUser && (
        <UserAvatar
          imageSrc={senderAvatarUrl}
          name={senderName}
          className="size-7 text-[10px] shrink-0 mt-auto"
        />
      )}

      {/* Bubble */}
      <div
        className={cn(
          "flex flex-col gap-1 rounded-xl px-3 py-2",
          isCurrentUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-background border rounded-bl-sm",
        )}
      >
        {/* Sender name in group conversations */}
        {isGroup && !isCurrentUser && (
          <AppTypo variant="xs" className="font-semibold text-primary">
            {senderName}
          </AppTypo>
        )}

        {/* Message text with mention highlights */}
        <div
          className={cn(
            "text-sm leading-relaxed break-words whitespace-pre-wrap",
            isCurrentUser ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {highlightMentions ? renderWithMentions(text, isCurrentUser) : text}
        </div>

        {/* Timestamp and status */}
        <div
          className={cn(
            "flex items-center gap-1 self-end",
            isCurrentUser ? "text-primary-foreground/70" : "text-foreground-lighter",
          )}
        >
          <AppTypo variant="xs" className="text-[10px]">
            {timestamp}
          </AppTypo>
          {isCurrentUser && status && <MessageStatusIcon status={status} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

/* ---------- Sub-components ---------- */

/** Renders double check marks (read receipts) */
const MessageStatusIcon: FC<{ status: MessageStatus }> = ({ status }) => {
  if (status === "pending") {
    return (
      <AppIcon
        icon="hugeicons:clock-02"
        className="size-3 opacity-70"
      />
    );
  }

  if (status === "sent") {
    return <AppIcon icon="hugeicons:tick-01" className="size-3 opacity-70" />;
  }

  // delivered or read: double tick
  return (
    <AppIcon
      icon="hugeicons:tick-double-02"
      className={cn(
        "size-3.5",
        status === "read" ? "text-info" : "opacity-70",
      )}
    />
  );
};

/**
 * Parses message text and highlights @mentions with primary color styling.
 * Supports `@username` and `@ai` patterns.
 */
function renderWithMentions(text: string, isCurrentUser: boolean) {
  const mentionRegex = /@(\w+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Text before mention
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Mention
    parts.push(
      <span
        key={match.index}
        className={cn(
          "font-semibold",
          isCurrentUser
            ? "text-primary-foreground underline underline-offset-2"
            : "text-primary",
        )}
      >
        {match[0]}
      </span>,
    );

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
