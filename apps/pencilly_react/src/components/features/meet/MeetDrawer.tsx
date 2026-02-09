import React, { useState, type FC } from "react";

import AppDrawer from "@/components/shared/AppDrawer";
import DynamicButton from "@/components/shared/DynamicButton";
import { sharedIcons } from "@/constants/icons";

import ChatView from "./ChatView";
import MeetDrawerContent from "./MeetDrawerContent";
import type { ChatMessage, Conversation } from "./types";

/** Example demo data to showcase ConversationCard and ConversationList usage. */
const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    isGroup: true,
    title: "Collaborate Group",
    members: [
      { id: "u1", name: "Ahmad Reza", avatarUrl: "" },
      { id: "u2", name: "Ali Reza", avatarUrl: "" },
      { id: "u3", name: "Fati", avatarUrl: "" },
    ],
    lastMessage: {
      text: "What's Man!",
      senderName: "You",
      timestamp: "9:40 AM",
    },
  },
  {
    id: "2",
    isGroup: false,
    members: [{ id: "u1", name: "Ahmad Reza", avatarUrl: "" }],
    lastMessage: {
      text: "What's Man!",
      senderName: "You",
      timestamp: "9:40 AM",
    },
  },
  {
    id: "3",
    isGroup: false,
    members: [{ id: "u2", name: "Ali Reza", avatarUrl: "" }],
    unseenCount: 8,
    isOnline: true,
  },
  {
    id: "4",
    isGroup: false,
    members: [{ id: "u4", name: "Fati", avatarUrl: "" }],
  },
  {
    id: "5",
    isGroup: false,
    members: [{ id: "u5", name: "Ali", avatarUrl: "" }],
  },
  {
    id: "6",
    isGroup: false,
    members: [{ id: "u6", name: "Heli", avatarUrl: "" }],
  },
  {
    id: "7",
    isGroup: true,
    members: [
      { id: "u1", name: "Ahmad Reza" },
      { id: "u2", name: "Ali Reza" },
      { id: "u4", name: "Fati" },
      { id: "u5", name: "Ali" },
    ],
    lastMessage: {
      text: "See you tomorrow!",
      senderName: "Ali",
      timestamp: "8:15 AM",
    },
    unseenCount: 3,
  },
];

/** Demo chat messages to showcase the ChatView component */
const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    text: "Did You Finish Checking The Document?",
    senderId: "current",
    senderName: "You",
    timestamp: "Yesterday",
    status: "read",
    isCurrentUser: true,
  },
  {
    id: "m2",
    text: "I Will Review The Full Document Tonight And Send You A Clear Summary With All Required Changes Today",
    senderId: "u1",
    senderName: "Ahmad Reza",
    senderAvatarUrl: "",
    timestamp: "12.00",
    isCurrentUser: false,
  },
  {
    id: "m3",
    text: "Hey @ai can you summarize the doc for us?",
    senderId: "current",
    senderName: "You",
    timestamp: "12.05",
    status: "delivered",
    isCurrentUser: true,
  },
];

interface MeetDrawerProps {
  Trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MeetDrawer: FC<MeetDrawerProps> = ({
  Trigger,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const handleCall = (conversation: Conversation) => {
    // Placeholder - integrate with actual call logic
  };

  const handleStartNewCall = () => {
    // Placeholder - integrate with actual call creation flow
  };

  const handleOpenChat = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };

  const handleBackToList = () => {
    setActiveConversation(null);
  };

  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      text,
      senderId: "current",
      senderName: "You",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
      isCurrentUser: true,
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const handleTitleEdit = (newTitle: string) => {
    if (activeConversation) {
      setActiveConversation({ ...activeConversation, title: newTitle });
    }
  };

  const defaultTrigger = (
    <DynamicButton
      icon={sharedIcons.call}
      title="Meet"
      variant="outline"
      hideLabel
    />
  );

  return (
    <AppDrawer
      open={isOpen}
      setOpen={setIsOpen}
      title="Call"
      Trigger={Trigger ?? defaultTrigger}
      needsAuth
      contentClassName="overflow-x-hidden"
      modal={false}
    >
      {activeConversation ? (
        <ChatView
          conversation={activeConversation}
          messages={messages}
          typingUsers={["Ahmad Reza"]}
          onBack={handleBackToList}
          onSendMessage={handleSendMessage}
          onCall={() => handleCall(activeConversation)}
          onVideoCall={() => {}}
          onTitleEdit={handleTitleEdit}
          className="flex-1 overflow-hidden"
        />
      ) : (
        <MeetDrawerContent
          conversations={DEMO_CONVERSATIONS}
          connectionState="connected"
          onCall={handleCall}
          onOpenChat={handleOpenChat}
          onStartNewCall={handleStartNewCall}
          className="flex-1 overflow-x-hidden"
        />
      )}
    </AppDrawer>
  );
};

export default MeetDrawer;
