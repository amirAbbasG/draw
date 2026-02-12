import React, { useEffect, useRef, useState, type FC } from "react";

import ChatInfo from "@/components/features/meet/chat/ChatInfo";
import ChatSettings from "@/components/features/meet/chat/ChatSettings";
import { DEFAULT_GROUP_SETTINGS } from "@/components/features/meet/constants";
import { groupMessagesByDate } from "@/components/features/meet/utils";
import { Show } from "@/components/shared/Show";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import type {
  ChatGroupSettings,
  ChatMessage,
  ChatView as ChatViewType,
  Conversation,
} from "../types";
import ChatBackground from "./ChatBackground";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import DateSeparator from "./DateSeparator";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface ChatViewProps {
  conversation: Conversation;
  messages: ChatMessage[];
  /** Users who are currently typing */
  typingUsers?: string[];
  /** Custom SVG pattern color for chat background */
  onBack: () => void;
  onSendMessage: (text: string) => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onTitleEdit?: (newTitle: string) => void;
  className?: string;
  /** Whether the current user is the group owner (shows settings) */
  isOwner?: boolean;
  /** Whether notifications are muted */
  isMuted?: boolean;
  /** Initial settings for the group (owner only) */
  groupSettings?: ChatGroupSettings;
  onMuteToggle?: () => void;
  onLeaveGroup?: () => void;
  onAvatarChange?: (file: File) => void;
  onCallMember?: (memberId: string) => void;
  onDeleteMember: (memberId: string) => void;
  onSettingsChange?: (settings: ChatGroupSettings) => void;
}

/**
 * The main chat page component that composes:
 * - ChatHeader (back, title, action buttons, editable group name)
 * - ChatBackground with SVG pattern
 * - MessageBubble list with DateSeparator
 * - TypingIndicator
 * - ChatInput with mentions, emoji picker, and speech-to-text
 *
 * Supports switching between "chat" and "info" views via the info button in the header.
 */
const ChatView: FC<ChatViewProps> = ({
  conversation,
  messages,
  typingUsers,
  onBack,
  onSendMessage,
  onCall,
  onVideoCall,
  onTitleEdit,
  className,
  groupSettings,
  isMuted,
  isOwner,
  onAvatarChange,
  onCallMember,
  onLeaveGroup,
  onMuteToggle,
  onSettingsChange,
  onDeleteMember,
}) => {
  const t = useTranslations("meet.chat");
  const [chatBg, setChatBg] = useState("#6F5CC6")
  const [activeView, setActiveView] = useState<ChatViewType>("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const isTyping = typingUsers && typingUsers.length > 0;

  /**
   * Group messages by date for date separators.
   * In a real app this would parse actual dates; here we use
   * a simple heuristic based on the timestamp string.
   */
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className={cn("col h-full overflow-hidden", className)}>
      <Show>
        {/* Settings view (owner only) */}
        <Show.When isTrue={activeView === "settings"}>
          <ChatSettings
            defaultValues={groupSettings ?? DEFAULT_GROUP_SETTINGS}
            onBack={() => setActiveView("info")}
            onSettingsChange={onSettingsChange}
            chatBg={chatBg}
            onChatBgChange={setChatBg}
          />
        </Show.When>

        {/* Info view */}
        <Show.When isTrue={activeView === "info"}>
          <ChatInfo
            onDeleteMember={onDeleteMember}
            conversation={conversation}
            isOwner={isOwner}
            isMuted={isMuted}
            onBack={() => setActiveView("chat")}
            onCall={onCall}
            onMuteToggle={onMuteToggle}
            onSettings={() => setActiveView("settings")}
            onLeaveGroup={onLeaveGroup}
            onAvatarChange={onAvatarChange}
            onNameChange={onTitleEdit}
            onCallMember={onCallMember}
            isGroup={conversation.isGroup}
          />
        </Show.When>

        {/* Chat view */}
        <Show.Else>
          {/* Header */}
          <ChatHeader
            conversation={conversation}
            activeView={activeView}
            onBack={onBack}
            onViewChange={setActiveView}
            onCall={onCall}
            onVideoCall={onVideoCall}
          />
          <ChatBackground
            color={chatBg}
            className="flex-1 min-h-0"
          >
            {/* Scrollable message area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-2">
              {messages.length === 0 ? (
                <div className="centered-col h-full ">
                  <AppTypo color="secondary">{t("no_messages")}</AppTypo>
                </div>
              ) : (
                <div className="col gap-3">
                  {groupedMessages.map((group, groupIdx) => (
                    <React.Fragment key={groupIdx}>
                      {group.dateLabel && (
                        <DateSeparator label={group.dateLabel} />
                      )}
                      {group.messages.map(msg => (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          isGroup={conversation.isGroup}
                          highlightMentions
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Typing indicator */}
              {isTyping && <TypingIndicator names={typingUsers} />}
            </div>

            {/* Input */}
            <div className=" p-2">
              <ChatInput
                members={conversation.members}
                onSend={onSendMessage}
                disabled={false}
              />
            </div>
          </ChatBackground>
        </Show.Else>
      </Show>
    </div>
  );
};

export default ChatView;
