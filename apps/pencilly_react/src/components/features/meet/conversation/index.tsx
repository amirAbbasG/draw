import React, { type FC } from "react";

import { cn } from "@/lib/utils";
import AppTypo from "@/components/ui/custom/app-typo";
import { useTranslations } from "@/i18n";

import type { Conversation } from "../types";
import ConversationList from "./ConversationList";

interface ConversationPageProps {
  conversations: Conversation[];
  isLoading?: boolean;
  onCall?: (conversation: Conversation) => void;
  onVideoCall?: (conversation: Conversation) => void;
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
  onVideoCall,
  onOpenChat,
  onLeave,
  onDelete,
  onMute,
  className,
}) => {
  const t = useTranslations("meet");

  return (
    <div className={cn("flex-1 overflow-y-auto", className)}>
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <AppTypo variant="small" color="muted">
            {t("loading_conversations")}
          </AppTypo>
        </div>
      ) : (
        <ConversationList
          conversations={conversations}
          onCall={onCall}
          onVideoCall={onVideoCall}
          onOpenChat={onOpenChat}
          onLeave={onLeave}
          onDelete={onDelete}
          onMute={onMute}
        />
      )}
    </div>
  );
};

export default ConversationPage;
