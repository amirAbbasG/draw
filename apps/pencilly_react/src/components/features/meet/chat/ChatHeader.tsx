import React, { useMemo, type FC } from "react";

import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { ChatView, Conversation } from "../types";

interface ChatHeaderProps {
  conversation: Conversation;
  activeView: ChatView;
  onBack: () => void;
  onViewChange: (view: ChatView) => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  className?: string;
}

const ChatHeader: FC<ChatHeaderProps> = ({
  conversation,
  activeView,
  onBack,
  onViewChange,
  onCall,
  onVideoCall,
  className,
}) => {
  const t = useTranslations("meet.chat");
  const { isGroup = false, title, members = [] } = conversation;

  const displayTitle = useMemo(() => {
    if (title) return title;

    if (!isGroup && members.length > 0) return members[0]?.name ?? "Unknown";

    if (members.length > 0) {
      // For groups without a title: show first 1-3 names + remaining count
      const maxVisible = Math.min(members.length, 3);
      const visibleNames = members.slice(0, maxVisible).map(m => m.name);
      const remaining = members.length - maxVisible;

      return remaining > 0
        ? `${visibleNames.join(", ")} +${remaining}`
        : visibleNames.join(", ");
    }

    return "Conversation";
  }, [title, isGroup, members]);

  return (
    <div
      className={cn(
        "row gap-2  px-2.5 py-2 bg-popover  z-20",
        className,
      )}
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
      <AppTypo variant="headingXXS" className="truncate cursor-default flex-1">
        {displayTitle}
      </AppTypo>

      {/* Action buttons */}
      <div className="row gap-2 shrink-0 ">
        <AppIconButton
          icon={sharedIcons.call}
          size="sm"
          onClick={onCall}
          title={t("voice_call")}
          className="bg-background-light"
        />
        <AppIconButton
          icon={sharedIcons.video}
          size="sm"
          onClick={onVideoCall}
          title={t("video_call")}
          className="bg-background-light"
        />
          <AppIconButton
            icon="hugeicons:information-circle"
            className="bg-background-light"
            size="sm"
            onClick={() =>
              onViewChange(activeView === "info" ? "chat" : "info")
            }
            title={t("info.title")}
            selected={activeView === "info"}
          />
      </div>
    </div>
  );
};

export default ChatHeader;
