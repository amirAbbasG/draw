import React, { type FC } from "react";

import { DotLoading } from "@/components/features/meet/chat/TypingIndicator";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import ConfirmAlert from "@/components/shared/ConfirmAlert";
import RenderIf from "@/components/shared/RenderIf";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import type { ChatMessage, MessageStatus } from "../types";
import { formatMessageTime } from "../utils";
import AudioMessageBubble from "./AudioMessageBubble";

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
  replyToSenderName?: string;
}

const MessageBubble: FC<MessageBubbleProps> = ({
  message,
  highlightMentions = true,
  onReply,
  onEdit,
  onDelete,
  replyToSenderName,
  className,
}) => {
  const t = useTranslations("meet");
  const {
    isCurrentUser,
    body,
    actor,
    createdAt,
    displayStatus,
    editedAt,
    deletedAt,
    replyTo,
    agentType,
    type,
      updatedAt
  } = message;

  const isAudioMessage = message.subtype === "audio" && !!message.payload?.audioUrl;
  const isAgentMessage = type === "agent" && !!agentType;
  const senderName = isAgentMessage
    ? agentType.replaceAll("-", " ")
    : (actor?.name ?? "Unknown");
  const senderAvatarUrl = actor?.profileImageUrl ?? undefined;
  const timeString = formatMessageTime(createdAt);
  const isDeleted = !!deletedAt;
  const isEdited = !!editedAt && !isDeleted;
  const isRecentlyUpdated =
      !!updatedAt && Date.now() - new Date(updatedAt).getTime() < 5 * 60 * 1000; // Consider messages updated within the last 5 minutes as "recently updated"

const onClickReply = () => {
  const el = document.getElementById(`message-${replyTo.id}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const bubble = el.querySelector(".bubble");
    bubble?.classList.add("ring-2", "ring-primary/50");
    setTimeout(() => {
      bubble?.classList.remove("ring-2", "ring-primary/50");
    }, 2000);
  }
}

  return (
    <div
        id={`message-${message.id}`}
      className={cn(
        "flex gap-1 max-w-[95%] group relative",
        isCurrentUser ? "ms-auto flex-row-reverse" : "me-auto",
        className,
      )}
    >
      {/* Avatar for group + other users */}
      <RenderIf isTrue={!isCurrentUser}>
        <UserAvatar
          imageSrc={senderAvatarUrl}
          name={senderName}
          className="size-7 border text-xs shrink-0 mt-auto"
        />
      </RenderIf>

      {/* Bubble */}
      <div
        className={cn(
          "col gap-1 rounded-lg px-3 py-2 relative bubble",
          isCurrentUser
            ? "bg-primary-dark text-primary-foreground rounded-br-none"
            : "bg-background-lighter border rounded-bl-none",
          isDeleted && "opacity-60 italic",
        )}
      >
        {/* Reply reference */}
        {replyTo && !isDeleted && (
          <div className="rounded-md  mb-1 text-xs   overflow-hidden cursor-pointer hover:bg-muted/50" onClick={onClickReply}>
            <div className="col gap-[1px] border-primary border-l-[3px] px-2 py-1 bg-muted">
              <AppTypo
                variant="xs"
                color="primary"
                className="font-medium truncate first-letter:!capitalize"
              >
                {replyTo.sender?.name ?? replyToSenderName ?? "Unknown"}
              </AppTypo>
              <AppTypo variant="xs" color="secondary" className="truncate">
                {replyTo.body}
              </AppTypo>
            </div>
          </div>
        )}

        {/* Sender name in group conversations */}

        <RenderIf isTrue={!isCurrentUser && !isDeleted}>
          <AppTypo
            variant="xs"
            className="font-semibold text-primary first-letter:capitalize"
          >
            {senderName}
          </AppTypo>
        </RenderIf>

        {/* Audio message */}
        {isAudioMessage && !isDeleted ? (
          <AudioMessageBubble
            audioUrl={message.payload!.audioUrl}
            durationMs={message.payload!.durationMs ?? 0}
            fileSizeBytes={message.payload!.fileSizeBytes ?? 0}
            mimeType={message.payload!.mimeType}
            isCurrentUser={isCurrentUser}
          />
        ) : (
          <>
            {/* Message text */}
            <RenderIf isTrue={isAgentMessage && message.status === "pending" && isRecentlyUpdated}>
              <div className="row gap-1 py-1">
                <DotLoading className="px-0 py-0" />
                <AppTypo variant="xs" color="secondary">
                  {t("agent_thinking")}
                </AppTypo>
              </div>
            </RenderIf>
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
          </>
        )}

        {/* Timestamp, edited label, and status */}
        <div
          className={cn(
            "flex items-center gap-1 self-end",
            isCurrentUser
              ? "text-primary-foreground/70"
              : "text-foreground-lighter",
          )}
        >
          <RenderIf isTrue={isEdited}>
            <AppTypo
              variant="xs"
              className={cn(
                "italic",
                isCurrentUser ? "text-white/60" : "text-foreground-light",
              )}
            >
              {t("message_edited")}
            </AppTypo>
          </RenderIf>

          <AppTypo
            variant="xs"
            className={cn(
              isCurrentUser ? "text-white" : "text-foreground-light",
            )}
          >
            {timeString}
          </AppTypo>
          <RenderIf
            isTrue={
              (isCurrentUser && !!displayStatus) ||
              (!isCurrentUser && displayStatus && type === "agent")
            }
          >
            <MessageStatusIcon status={displayStatus as any} />
          </RenderIf>
        </div>
      </div>

      {/* Action buttons on hover - always on the outer side of the bubble */}
      {!isDeleted && (
        <div className="row gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
  // Change: Added \. to the character class
  const mentionRegex = /@([\w.]+)/g;
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
