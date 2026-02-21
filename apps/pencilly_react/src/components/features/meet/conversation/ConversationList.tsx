import React, { type FC } from "react";

import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import type { CallType, Conversation } from "../types";
import ConversationCard from "./ConversationCard";

interface ConversationListProps {
  conversations: Conversation[];
  onCall: (conversation: Conversation, type: CallType) => void;
  onOpenChat?: (conversation: Conversation) => void;
  onLeave?: (conversation: Conversation) => void;
  onDelete?: (conversation: Conversation) => void;
  onMute?: (conversation: Conversation) => void;
  className?: string;
}

const ConversationList: FC<ConversationListProps> = ({
  conversations,
  onCall,
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
          onCall={onCall}
          key={conversation.id}
          conversation={conversation}
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
