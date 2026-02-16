import React, { useCallback, useEffect, useRef, useState, type FC } from "react";

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
  ConversationMember,
  MeetUser,
} from "../types";
import ChatBackground from "./ChatBackground";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import DateSeparator from "./DateSeparator";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import {useConversationApi} from "@/components/features/meet/hooks";

interface ChatViewProps {
  conversation: Conversation;
  messages: ChatMessage[];
  typingUsers?: string[];
  onBack: () => void;
  onSendMessage: (text: string, replyToId?: string) => void;
  /** Edit a message via REST */
  onEditMessage?: (eventId: string, newText: string) => void;
  /** Delete a message via REST */
  onDeleteMessage?: (eventId: string) => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onTitleEdit?: (newTitle: string) => void;
  className?: string;
  groupSettings?: ChatGroupSettings;
  onMuteToggle?: () => void;
  onLeaveGroup?: () => void;
  onAvatarChange?: (file: File) => void;
  onCallMember?: (memberId: string) => void;
  onDeleteMember: (memberId: string) => void;
  onSettingsChange?: (settings: ChatGroupSettings) => void;
  /** Whether messages are loading */
  isLoadingMessages?: boolean;
  /** Leave group callback */
  onDeleteForEveryone?: () => void;
  /** API-resolved members for ChatInfo and mention */
  apiMembers?: MeetUser[];
  /** Username-based mention members */
  mentionMembers?: Array<{ username: string; displayName: string; avatarUrl?: string }>;
}

/**
 * The main chat page component with reply, edit, and delete support.
 * Composes ChatHeader, MessageBubble list, TypingIndicator, and ChatInput.
 */
const ChatView: FC<ChatViewProps> = ({
  conversation,
  messages,
  typingUsers,
  onBack,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onCall,
  onVideoCall,
  onTitleEdit,
  className,
  groupSettings,
  onAvatarChange,
  onCallMember,
  onLeaveGroup,
  onMuteToggle,
  onSettingsChange,
  onDeleteMember,
  isLoadingMessages,
  onDeleteForEveryone,
  apiMembers,
  mentionMembers,
}) => {
  const t = useTranslations("meet.chat");
  const tMeet = useTranslations("meet");
  const [chatBg, setChatBg] = useState("#6F5CC6");
  const [activeView, setActiveView] = useState<ChatViewType>("chat");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const api = useConversationApi();

  useEffect(() => {
    void api.markRead(conversation.id);
  }, [conversation.id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const isTyping = typingUsers && typingUsers.length > 0;
  const groupedMessages = groupMessagesByDate(messages);

  const handleReply = useCallback((message: ChatMessage) => {
    setReplyTo(message);
    setEditingMessage(null);
  }, []);

  const handleEdit = useCallback((message: ChatMessage) => {
    setEditingMessage(message);
    setReplyTo(null);
  }, []);


  const handleSend = useCallback((text: string, replyToId?: string) => {
    onSendMessage(text, replyToId);
    setReplyTo(null);
  }, [onSendMessage]);

  const handleEditSubmit = useCallback((eventId: string, newText: string) => {
    onEditMessage?.(eventId, newText);
    setEditingMessage(null);
  }, [onEditMessage]);

  const isGroup = conversation.isGroup ?? false;
  const isMuted = conversation.isMuted ?? false;
  const isOwner = conversation.role === "owner";
  const members = conversation.members ?? [];

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
            onDeleteForEveryone={onDeleteForEveryone}
            onAvatarChange={onAvatarChange}
            onNameChange={onTitleEdit}
            onCallMember={onCallMember}
            isGroup={isGroup}
            apiMembers={apiMembers}
          />
        </Show.When>

        {/* Chat view */}
        <Show.Else>
          <ChatHeader
            conversation={conversation}
            activeView={activeView}
            onBack={onBack}
            onViewChange={setActiveView}
            onCall={onCall}
            onVideoCall={onVideoCall}
          />
          <ChatBackground color={chatBg} className="flex-1 min-h-0">
            {/* Scrollable message area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-2">
              {isLoadingMessages ? (
                <div className="centered-col h-full">
                  <AppTypo color="secondary">{tMeet("loading_messages")}</AppTypo>
                </div>
              ) : messages.length === 0 ? (
                <div className="centered-col h-full">
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
                          isGroup={isGroup}
                          highlightMentions
                          onReply={handleReply}
                          onEdit={handleEdit}
                          onDelete={message =>  onDeleteMessage?.(message.id)}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {isTyping && <TypingIndicator names={typingUsers} />}
            </div>

            {/* Input */}
            <div className="p-2">
              <ChatInput
                members={members}
                mentionMembers={mentionMembers}
                onSend={handleSend}
                replyTo={replyTo}
                editingMessage={editingMessage}
                onCancelReply={() => setReplyTo(null)}
                onCancelEdit={() => setEditingMessage(null)}
                onEditSubmit={handleEditSubmit}
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
