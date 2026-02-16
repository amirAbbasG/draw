import React, { useState, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import ConfirmAlert from "@/components/shared/ConfirmAlert";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import type { ChatMessage, MessageStatus } from "../types";
import { formatMessageTime } from "../utils";

interface MessageBubbleProps {
  message: ChatMessage;
  /** Whether this conversation is a group (shows avatar + sender name) */
  isGroup?: boolean;
  /** Highlight @mentions in the message text */
  highlightMentions?: boolean;
  /** Called when user wants to reply to this message */
  onReply?: (message: ChatMessage) => void;
  /** Called when user wants to edit this message */
  onEdit?: (message: ChatMessage) => void;
  /** Called when user wants to delete this message */
  onDelete?: (message: ChatMessage) => void;
  className?: string;
}

const MessageBubble: FC<MessageBubbleProps> = ({
  message,
  isGroup = false,
  highlightMentions = true,
  onReply,
  onEdit,
  onDelete,
  className,
}) => {
  const t = useTranslations("meet");
  const [showActions, setShowActions] = useState(false);
  const {
    isCurrentUser,
    body,
    actor,
    createdAt,
    displayStatus,
    editedAt,
    deletedAt,
    replyTo,
  } = message;

  const senderName = actor?.name ?? "Unknown";
  const senderAvatarUrl = actor?.profileImageUrl ?? undefined;
  const timeString = formatMessageTime(createdAt);
  const isDeleted = !!deletedAt;
  const isEdited = !!editedAt && !isDeleted;

  return (
    <div
      className={cn(
        "flex gap-1 max-w-[85%] group relative",
        isCurrentUser ? "ms-auto flex-row-reverse" : "me-auto",
        className,
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar for group + other users */}
      {isGroup && !isCurrentUser && (
        <UserAvatar
          imageSrc={senderAvatarUrl}
          name={senderName}
          className="size-7 border text-xs shrink-0 mt-auto"
        />
      )}

      {/* Bubble */}
      <div
        className={cn(
          "col gap-1 rounded-lg px-3 py-2 relative",
          isCurrentUser
            ? "bg-primary-dark text-primary-foreground rounded-br-none"
            : "bg-background-lighter border rounded-bl-none",
          isDeleted && "opacity-60 italic",
        )}
      >
        {/* Reply reference */}
        {replyTo && !isDeleted && (
          <div className="rounded px-2 py-1 mb-1 text-xs border-l-2 bg-muted border-primary">
            <AppTypo
              variant="xs"
              color="primary"
              className="font-medium text-primary truncate"
            >
              {replyTo.sender?.name ?? "Unknown"}
            </AppTypo>
            <AppTypo
              variant="xs"
              className={cn(
                "truncate",
                isCurrentUser
                  ? "text-primary-foreground/80"
                  : "text-foreground-light",
              )}
            >
              {replyTo.body}
            </AppTypo>
          </div>
        )}

        {/* Sender name in group conversations */}
        {isGroup && !isCurrentUser && !isDeleted && (
          <AppTypo variant="xs" className="font-semibold text-primary">
            {senderName}
          </AppTypo>
        )}

        {/* Message text */}
        <div
          className={cn(
            "text-sm leading-relaxed break-words whitespace-pre-wrap",
            isCurrentUser ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {isDeleted
            ? t("message_deleted")
            : highlightMentions
              ? renderWithMentions(body, isCurrentUser)
              : body}
        </div>

        {/* Timestamp, edited label, and status */}
        <div
          className={cn(
            "flex items-center gap-1 self-end",
            isCurrentUser
              ? "text-primary-foreground/70"
              : "text-foreground-lighter",
          )}
        >
          {isEdited && (
            <AppTypo
              variant="xs"
              className={cn(
                "italic",
                isCurrentUser ? "text-white/60" : "text-foreground-light",
              )}
            >
              {t("message_edited")}
            </AppTypo>
          )}
          <AppTypo
            variant="xs"
            className={cn(
              isCurrentUser ? "text-white" : "text-foreground-light",
            )}
          >
            {timeString}
          </AppTypo>
          {isCurrentUser && displayStatus && (
            <MessageStatusIcon status={displayStatus} />
          )}
        </div>
      </div>

      {/* Action buttons on hover - always on the outer side of the bubble */}
      {showActions && !isDeleted && (
        <div className="row gap-0.5 ">
          <ActionButton
            icon="hugeicons:message-incoming-01"
            title={t("reply")}
            onClick={() => onReply?.(message)}
          />
          {isCurrentUser && (
            <>
              <ActionButton
                icon="hugeicons:edit-02"
                title={t("edit_message")}
                onClick={() => onEdit?.(message)}
              />
              <div>
                <ConfirmAlert
                  title={t("delete_message")}
                  btnTitle={t("delete_message")}
                  message={t("delete_message_confirm")}
                  isDanger
                  onAccept={() => onDelete?.(message)}
                >
                  <ActionButton
                    icon="hugeicons:delete-02"
                    title={t("delete_message")}
                    iconClassName="text-danger hover:text-danger"
                  />
                </ConfirmAlert>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;

/* ---------- Sub-components ---------- */

const ActionButton: FC<{
  icon: string;
  title: string;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
}> = ({ icon, title, onClick, className, iconClassName }) => (
  <AppIconButton
    size="xs"
    element="div"
    variant="fill"
    color="background"
    onClick={onClick}
    title={title}
    icon={icon}
    className={cn(" rounded-full bg-background-lighter shadow-sm", className)}
    iconClassName={iconClassName}
  />
);

const MessageStatusIcon: FC<{ status: MessageStatus }> = ({ status }) => {
  if (status === "pending") {
    return <AppIcon icon="hugeicons:clock-02" className="size-3 opacity-90" />;
  }
  if (status === "sent") {
    return <AppIcon icon="hugeicons:tick-01" className="size-3 opacity-70" />;
  }
  return (
    <AppIcon
      icon="hugeicons:tick-double-02"
      className={cn("size-3.5", status === "read" ? "text-info" : "opacity-90")}
    />
  );
};

/**
 * Parses message text and highlights @mentions with primary color styling.
 */
function renderWithMentions(text: string, isCurrentUser: boolean) {
  if (!text) return text;
  const mentionRegex = /@(\w+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span
        key={match.index}
        className={cn(
          "font-semibold",
          isCurrentUser
            ? "text-primary-lighter underline underline-offset-2 mx-[1px]"
            : "text-primary",
        )}
      >
        {match[0]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
