import React, { type FC } from "react";

import { CallStatusBadge } from "@/components/features/call/CallStatusBadge";
import type { ConnectionState } from "@/components/features/call/types";
import DynamicButton from "@/components/shared/DynamicButton";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";

import ConversationList from "./ConversationList";
import type { Conversation } from "./types";

interface MeetDrawerContentProps {
  conversations: Conversation[];
  connectionState?: ConnectionState;
  onCall?: (conversation: Conversation) => void;
  onOpenChat?: (conversation: Conversation) => void;
  onStartNewCall?: () => void;
  className?: string;
}

const MeetDrawerContent: FC<MeetDrawerContentProps> = ({
  conversations,
  connectionState = "idle",
  onCall,
  onOpenChat,
  onStartNewCall,
  className,
}) => {
  return (
    <div className={cn("col h-full", className)}>
      {/* Header actions */}
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <DynamicButton
          icon="hugeicons:call-add"
          title="Start New Call"
          variant="outline"
          className="!h-7 !text-xs"
          onClick={onStartNewCall}
        />
        <div className="ms-auto">
          <CallStatusBadge status={connectionState} />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        <ConversationList
          conversations={conversations}
          onCall={onCall}
          onOpenChat={onOpenChat}
          emptyMessage="No conversations yet."
        />
      </div>
    </div>
  );
};

export default MeetDrawerContent;
