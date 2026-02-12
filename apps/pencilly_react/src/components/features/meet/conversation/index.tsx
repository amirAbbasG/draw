import React, { type FC } from "react";

import type { ConnectionState } from "@/components/features/call/types";
import { cn } from "@/lib/utils";

import type { Conversation } from "../types";
import ConversationList from "./ConversationList";

interface MeetDrawerContentProps {
  conversations: Conversation[];
  connectionState?: ConnectionState;
  onCall?: (conversation: Conversation) => void;
  onOpenChat?: (conversation: Conversation) => void;
  className?: string;
}

const Conversation: FC<MeetDrawerContentProps> = ({
  conversations,
  onCall,
  onOpenChat,
  className,
}) => {
  return (
    <div className={cn("flex-1 overflow-y-auto", className)}>
      <ConversationList
        conversations={conversations}
        onCall={onCall}
        onOpenChat={onOpenChat}
        emptyMessage="No conversations yet."
      />
    </div>
  );
};

export default Conversation;
