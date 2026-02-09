import React, { useRef, useEffect, useState, type FC } from "react";

import { Show } from "@/components/shared/Show";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

import ChatBackground from "./ChatBackground";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import DateSeparator from "./DateSeparator";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import type { ChatMessage, ChatView as ChatViewType, Conversation } from "./types";

interface ChatViewProps {
  conversation: Conversation;
  messages: ChatMessage[];
  /** Users who are currently typing */
  typingUsers?: string[];
  /** Custom SVG pattern color for chat background */
  backgroundPatternColor?: string;
  onBack: () => void;
  onSendMessage: (text: string) => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onTitleEdit?: (newTitle: string) => void;
  className?: string;
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
  backgroundPatternColor,
  onBack,
  onSendMessage,
  onCall,
  onVideoCall,
  onTitleEdit,
  className,
}) => {
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
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Header */}
      <ChatHeader
        conversation={conversation}
        activeView={activeView}
        onBack={onBack}
        onViewChange={setActiveView}
        onCall={onCall}
        onVideoCall={onVideoCall}
        onTitleEdit={onTitleEdit}
      />

      <Show>
        {/* Info view placeholder */}
        <Show.When isTrue={activeView === "info"}>
          <div className="flex-1 flex items-center justify-center p-6">
            <AppTypo variant="small" color="muted">
              Info page coming soon.
            </AppTypo>
          </div>
        </Show.When>

        {/* Chat view */}
        <Show.Else>
          <ChatBackground
            color={backgroundPatternColor}
            className="flex-1 min-h-0"
          >
            {/* Scrollable message area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-2"
            >
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <AppTypo variant="small" color="muted">
                    No messages yet. Start the conversation!
                  </AppTypo>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
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
            <ChatInput
              members={conversation.members}
              onSend={onSendMessage}
              disabled={false}
            />
          </ChatBackground>
        </Show.Else>
      </Show>
    </div>
  );
};

export default ChatView;

/* ---------- Helpers ---------- */

interface MessageGroup {
  dateLabel?: string;
  messages: ChatMessage[];
}

/**
 * Group messages by date label for rendering date separators.
 * Simple implementation - groups consecutive messages that share the same date.
 */
function groupMessagesByDate(messages: ChatMessage[]): MessageGroup[] {
  if (messages.length === 0) return [];

  const groups: MessageGroup[] = [];
  let currentDate = "";

  for (const msg of messages) {
    // Extract the date portion from timestamp (e.g., "Yesterday", "02/09", etc.)
    const dateLabel = extractDateLabel(msg.timestamp);

    if (dateLabel !== currentDate) {
      groups.push({ dateLabel, messages: [msg] });
      currentDate = dateLabel;
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }

  return groups;
}

/**
 * Extracts a date label from a timestamp string.
 * In a real app, this would parse the date and return "Today", "Yesterday", etc.
 * For now, we return undefined (no separator) for simple time-only strings.
 */
function extractDateLabel(timestamp: string): string {
  // If timestamp looks like a date ("Yesterday", "02/09/2026", etc.)
  if (
    timestamp.toLowerCase().includes("yesterday") ||
    timestamp.toLowerCase().includes("today") ||
    /\d{2}\/\d{2}/.test(timestamp)
  ) {
    return timestamp;
  }
  return "";
}
