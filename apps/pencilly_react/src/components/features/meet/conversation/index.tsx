import React, { type FC } from "react";

import { Show } from "@/components/shared/Show";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { CallType, Conversation } from "../types";
import ConversationList from "./ConversationList";

interface ConversationPageProps {
  conversations: Conversation[];
  isLoading?: boolean;
  onCall: (conversation: Conversation, type: CallType) => void;
  onOpenChat?: (conversation: Conversation) => void;
  onLeave?: (conversation: Conversation) => void;
  onDelete?: (conversation: Conversation) => void;
  onMute?: (conversation: Conversation) => void;
  className?: string;
}

const ConversationPage: FC<ConversationPageProps> = ({
  conversations,
  isLoading,
  onCall,
  onOpenChat,
  onLeave,
  onDelete,
  onMute,
  className,
}) => {
  return (
    <div className={cn("flex-1 overflow-y-auto", className)}>
      <Show>
        <Show.When isTrue={isLoading}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="row gap-2 p-2">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-3 w-1/3 rounded" />
                <Skeleton className="h-2 w-1/2 rounded" />
              </div>
              <Skeleton className="size-6 rounded -me-0.5" />
              <Skeleton className="size-6 rounded" />
            </div>
          ))}
        </Show.When>
        <Show.Else>
          <ConversationList
            conversations={conversations}
            onCall={onCall}
            onOpenChat={onOpenChat}
            onLeave={onLeave}
            onDelete={onDelete}
            onMute={onMute}
          />
        </Show.Else>
      </Show>
    </div>
  );
};

export default ConversationPage;
