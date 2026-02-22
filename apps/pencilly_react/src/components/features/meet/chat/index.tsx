import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
} from "react";

import ChatInfo from "@/components/features/meet/chat/ChatInfo";
import ChatSettings from "@/components/features/meet/chat/ChatSettings";
import { useConversationActivities } from "@/components/features/meet/hooks/useConversationActivities";
import { groupMessagesByDate } from "@/components/features/meet/utils";
import { Show } from "@/components/shared/Show";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn, isEmpty } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import type {
  CallType,
  ChatMessage,
  ChatView as ChatViewType,
  Conversation,
  MeetUser,
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
  typingUsers?: string[];
  onBack: () => void;
  onSendMessage: (text: string, replyToId?: string) => void;
  /** Edit a message via REST */
  onEditMessage?: (eventId: string, newText: string) => void;
  /** Delete a message via REST */
  onDeleteMessage?: (eventId: string) => void;
  onCall: (type: CallType) => void;
  onJoinCall: (sessionId: string) => void;
  className?: string;
  onMuteToggle: (conversation: Conversation) => void;
  onLeaveGroup?: () => void;
  handeInviteUser: (
    user: MeetUser,
    inviteToCal?: boolean,
    conversationId?: string,
    includeChat?: number,
  ) => void;
  onDeleteMember: (memberId: string) => void;
  /** Whether messages are loading */
  isLoadingMessages?: boolean;
  /** Leave group callback */
  onDeleteForEveryone?: () => void;
  /** API-resolved members for ChatInfo and mention */
  apiMembers?: MeetUser[];
  onMarkAsRead: (seq: number) => void;
  isTemp?: boolean;
  chatWithMember: (user: MeetUser, me?: MeetUser) => void;
  isInCall?: boolean;
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
  className,
  handeInviteUser,
  isInCall,
  onLeaveGroup,
  onMuteToggle,
  onDeleteMember,
  isLoadingMessages,
  onDeleteForEveryone,
  apiMembers,
  onMarkAsRead,
  chatWithMember,
  isTemp,
  onJoinCall,
}) => {
  const t = useTranslations("meet.chat");
  const tMeet = useTranslations("meet");
  const [chatBg, setChatBg] = useState("#6F5CC6");
  const [activeView, setActiveView] = useState<ChatViewType>("chat");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const isGroup = conversation.isGroup ?? false;

  const { activeCall } = useConversationActivities(
    {
      conversation_id: conversation?.id,
      kind: "call",
      status: "active",
    },
    !!conversation && isGroup,
  );

  useEffect(() => {
    onMarkAsRead(conversation.next_seq);
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

  const handleSend = useCallback(
    (text: string, replyToId?: string) => {
      onSendMessage(text, replyToId);
      setReplyTo(null);
    },
    [onSendMessage],
  );

  const handleEditSubmit = useCallback(
    (eventId: string, newText: string) => {
      onEditMessage?.(eventId, newText);
      setEditingMessage(null);
    },
    [onEditMessage],
  );

  return (
    <div className={cn("col h-full overflow-hidden", className)}>
      <Show>
        {/* Settings view (owner only) */}
        <Show.When isTrue={activeView === "settings"}>
          <ChatSettings
            onBack={() => setActiveView("info")}
            chatBg={chatBg}
            onChatBgChange={setChatBg}
            conversation={conversation}
          />
        </Show.When>

        {/* Info view */}
        <Show.When isTrue={activeView === "info"}>
          <ChatInfo
            onDeleteMember={onDeleteMember}
            conversation={conversation}
            onBack={() => setActiveView("chat")}
            onCall={() => onCall("audio")}
            onMuteToggle={() => onMuteToggle(conversation)}
            onSettings={() => setActiveView("settings")}
            onLeaveGroup={onLeaveGroup}
            onDeleteForEveryone={onDeleteForEveryone}
            handeInviteUser={handeInviteUser}
            isInCall={isInCall}
            apiMembers={apiMembers}
            chatWithMember={chatWithMember}
          />
        </Show.When>

        {/* Chat view */}
        <Show.Else>
          <ChatHeader
            chatWithMember={chatWithMember}
            members={apiMembers ?? conversation.members}
            conversation={conversation}
            activeView={activeView}
            onBack={onBack}
            onViewChange={setActiveView}
            onCall={onCall}
            onJoinCall={() => {
              if (activeCall?.payload?.sessionId) {
                onJoinCall(activeCall.payload.sessionId);
              }
            }}
            isActiveCall={!!activeCall && !!activeCall?.payload?.sessionId}
          />
          <ChatBackground color={chatBg} className="flex-1 min-h-0">
            {/* Scrollable message area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-2">
              <Show>
                <Show.When
                  isTrue={
                    conversation.chat_state === "closed" &&
                    isGroup &&
                    conversation.role !== "owner"
                  }
                >
                  <div className="centered-col h-full gap-4">
                    <AppTypo color="secondary">{t("chat_closed")}</AppTypo>
                  </div>
                </Show.When>
                <Show.When isTrue={isLoadingMessages}>
                  <div className="centered-col h-full">
                    <AppTypo color="secondary">
                      {tMeet("loading_messages")}
                    </AppTypo>
                  </div>
                </Show.When>
                <Show.When isTrue={!isLoadingMessages && isEmpty(messages)}>
                  <div className="centered-col h-full">
                    <AppTypo color="secondary">{t("no_messages")}</AppTypo>
                  </div>
                </Show.When>
                <Show.Else>
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
                            onDelete={message => onDeleteMessage?.(message.id)}
                            replyToSenderName={
                              msg.replyTo
                                ? msg.replyTo?.sender?.name
                                  ? msg.replyTo?.sender?.name
                                  : messages.find(m => m.id === msg.replyTo?.id)
                                      ?.actor?.name
                                : undefined
                            }
                          />
                        ))}
                      </React.Fragment>
                    ))}
                    {isTyping && <TypingIndicator names={typingUsers} />}
                  </div>
                </Show.Else>
              </Show>
            </div>

            {/* Input */}
            <div className="p-2">
              <ChatInput
                members={apiMembers}
                onSend={handleSend}
                replyTo={replyTo}
                editingMessage={editingMessage}
                onCancelReply={() => setReplyTo(null)}
                onCancelEdit={() => setEditingMessage(null)}
                onEditSubmit={handleEditSubmit}
                disabled={
                  isTemp ||
                  (conversation.role !== "owner" &&
                    conversation.chat_state !== "open")
                }
              />
            </div>
          </ChatBackground>
        </Show.Else>
      </Show>
    </div>
  );
};

export default ChatView;
