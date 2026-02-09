import React, { type FC } from "react";

import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

import ConversationCard from "./ConversationCard";
import type { Conversation } from "./types";

interface ConversationListProps {
  conversations: Conversation[];
  onCall?: (conversation: Conversation) => void;
  onOpenChat?: (conversation: Conversation) => void;
  emptyMessage?: string;
  className?: string;
}

const ConversationList: FC<ConversationListProps> = ({
  conversations,
  onCall,
  onOpenChat,
  emptyMessage = "No conversations yet.",
  className,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <AppTypo variant="small" color="muted">
          {emptyMessage}
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
          onClick={() => onOpenChat?.(conversation)}
        />
      ))}
    </div>
  );
};

export default ConversationList;
