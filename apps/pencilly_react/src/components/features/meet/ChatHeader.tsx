import React, { useState, useRef, useEffect, useMemo, type FC } from "react";

import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { inputVariant } from "@/components/ui/variants";

import type { Conversation, ChatView } from "./types";

interface ChatHeaderProps {
  conversation: Conversation;
  activeView: ChatView;
  onBack: () => void;
  onViewChange: (view: ChatView) => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onTitleEdit?: (newTitle: string) => void;
  className?: string;
}

const ChatHeader: FC<ChatHeaderProps> = ({
  conversation,
  activeView,
  onBack,
  onViewChange,
  onCall,
  onVideoCall,
  onTitleEdit,
  className,
}) => {
  const { isGroup, title, members } = conversation;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const displayTitle = useMemo(() => {
    if (title) return title;

    if (!isGroup) return members[0]?.name ?? "Unknown";

    // For groups without a title: show first 1-3 names + remaining count
    const maxVisible = Math.min(members.length, 3);
    const visibleNames = members.slice(0, maxVisible).map(m => m.name);
    const remaining = members.length - maxVisible;

    return remaining > 0
      ? `${visibleNames.join(", ")} +${remaining}`
      : visibleNames.join(", ");
  }, [title, isGroup, members]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!isGroup) return;
    setEditValue(title || "");
    setIsEditing(true);
  };

  const handleConfirmEdit = () => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      onTitleEdit?.(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConfirmEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-2 border-b bg-popover",
        className,
      )}
    >
      {/* Back button */}
      <AppIconButton
        icon={sharedIcons.arrow_left}
        size="sm"
        onClick={onBack}
        title="Back"
      />

      {/* Title / Editable title */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={handleConfirmEdit}
            onKeyDown={handleKeyDown}
            className={cn(
              inputVariant({
                size: "default",
                color: "input",
                variant: "input",
              }),
              "!h-7 text-sm flex-1 min-w-0",
            )}
            placeholder="Group name..."
          />
        ) : (
          <>
            <AppTypo
              variant="headingXXS"
              className="truncate cursor-default"
            >
              {displayTitle}
            </AppTypo>
            {isGroup && (
              <AppIconButton
                icon={sharedIcons.edit}
                size="xs"
                onClick={handleStartEdit}
                title="Edit group name"
              />
            )}
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        <AppIconButton
          icon={sharedIcons.call}
          size="sm"
          onClick={onCall}
          title="Voice call"
        />
        <AppIconButton
          icon={sharedIcons.video}
          size="sm"
          onClick={onVideoCall}
          title="Video call"
        />
        <AppIconButton
          icon="hugeicons:information-circle"
          size="sm"
          onClick={() =>
            onViewChange(activeView === "info" ? "chat" : "info")
          }
          title="Info"
          iconClassName={activeView === "info" ? "text-primary" : ""}
        />
      </div>
    </div>
  );
};

export default ChatHeader;
