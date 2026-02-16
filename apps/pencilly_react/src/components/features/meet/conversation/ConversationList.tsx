import React, { type FC } from "react";

import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import ConversationCard from "./ConversationCard";
import type { Conversation } from "../types";

interface ConversationListProps {
  conversations: Conversation[];
  onCall?: (conversation: Conversation) => void;
  onVideoCall?: (conversation: Conversation) => void;
  onOpenChat?: (conversation: Conversation) => void;
  onLeave?: (conversation: Conversation) => void;
  onDelete?: (conversation: Conversation) => void;
  onMute?: (conversation: Conversation) => void;
  className?: string;
}

const ConversationList: FC<ConversationListProps> = ({
  conversations,
  onCall,
  onVideoCall,
  onOpenChat,
  onLeave,
  onDelete,
  onMute,
  className,
}) => {
  const t = useTranslations("meet");

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <AppTypo variant="small" color="muted">
          {t("no_conversations")}
        </AppTypo>
      </div>
    );
  }

  return (
    <div className={cn("col", className)}>
      {conversations.map(conversation => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
          onCall={onCall}
          onVideoCall={onVideoCall}
          onLeave={onLeave}
          onDelete={onDelete}
          onMute={onMute}
          onClick={() => onOpenChat?.(conversation)}
        />
      ))}
    </div>
  );
};

export default ConversationList;
