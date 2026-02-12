import React, { useState, type FC } from "react";

import { createPortal } from "react-dom";

import {
  CallOwner,
  CallParticipant,
  CallRoom,
  CallView,
} from "@/components/features/meet/call";
import { CallNotificationData } from "@/components/features/meet/notification/CallNotificationToast";
import { MessageNotificationData } from "@/components/features/meet/notification/MessageNotificationToast";
import StartCall from "@/components/features/meet/start";
import AppDrawer from "@/components/shared/AppDrawer";
import DynamicButton from "@/components/shared/DynamicButton";
import RenderIf from "@/components/shared/RenderIf";
import { Show } from "@/components/shared/Show";
import { isEmpty } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import Chat from "./chat";
import ConversationPage from "./conversation";
import type { ChatMessage, ConnectionState, Conversation } from "./types";
import StatusBadge from "@/components/features/meet/StatusBadge";
import {showIncomingCall} from "@/components/features/meet/notification";

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
  const t = useTranslations("meet");
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);

  const conversations = DEMO_CONVERSATIONS;
  // const conversations = []
  const connectionState: ConnectionState = "connected";

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

  const onInviteUser = (userId: string) => {
    /* send invitation */
  };

  const onSendEmailInvite = (email: string) => {
    /* send email invite */
  };

  const onRemoveParticipant = (id: string) => {
    /* kick user */
  };

  const onOpenChat = () => {
    setIsOpen(true);
    setActiveConversation(conversations[0]);
  };

  const onCallMember = (memberId: string) => {
    /* initiate call with specific member */
  };

  const onMuteToggle = () => {
    if (activeConversation) {
      setActiveConversation({
        ...activeConversation,
        isMuted: !activeConversation.isMuted,
      });
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

  //test
  const [showCallView, setShowCallView] = useState(false);

  return (
    <>
      {showCallView &&
        createPortal(
          <CallView
            participants={participants}
            owner={owner}
            room={room}
            startTime={Date.now()} // when call started
            isSidebarOpen={isOpen} // true if MeetDrawer is open
            onOpenChat={onOpenChat} // open chat with first conversation as example
            onEndCall={() => setShowCallView(false)}
            onClose={() => setShowCallView(false)}
            onInviteUser={onInviteUser}
            onSendEmailInvite={onSendEmailInvite}
            onRemoveParticipant={onRemoveParticipant}
          />,
          document.getElementById("app-layout-main"),
        )}
      <AppDrawer
        open={isOpen}
        setOpen={setIsOpen}
        title="Call"
        Trigger={Trigger ?? defaultTrigger}
        // needsAuth
        contentClassName="overflow-x-hidden"
        modal={false}
      >
        <div className="spacing-row gap-2 px-3 py-2 border-y">
          <StatusBadge status={connectionState} />
          <RenderIf isTrue={!activeConversation && !isEmpty(conversations)}>
            <DynamicButton
              icon="hugeicons:call-add"
              title={t("new_call")}
              variant="default"
              className="!h-7 !text-xs"
              onClick={() => {
                //   start call

                //test
                showIncomingCall(callData, () => setShowCallView(true))
               // showMessageNotification(messageData)
              }}
            />
          </RenderIf>
        </div>
        <Show>
          <Show.When isTrue={isEmpty(conversations)}>
            <StartCall
              //@ts-ignore
              handleStartCall={() => {}}
              //@ts-ignore
              getSession={() => {}}
              //@ts-ignore
              handleJoin={() => {}}
              connectionState="connecting"
            />
          </Show.When>
          <Show.When isTrue={!!activeConversation}>
            <Chat
              conversation={activeConversation}
              messages={messages}
              typingUsers={["Ahmad Reza"]}
              onBack={handleBackToList}
              onSendMessage={handleSendMessage}
              onCall={() => handleCall(activeConversation)}
              onDeleteMember={() => {}}
              onVideoCall={() => {}}
              onTitleEdit={handleTitleEdit}
              className="flex-1 overflow-hidden"
              isOwner={true}
              isMuted={activeConversation?.isMuted}
              onCallMember={onCallMember}
              onMuteToggle={onMuteToggle}
            />
          </Show.When>
          <Show.Else>
            <ConversationPage
              conversations={conversations}
              connectionState="connected"
              onCall={handleCall}
              onOpenChat={handleOpenChat}
              className="flex-1 overflow-x-hidden"
            />
          </Show.Else>
        </Show>
      </AppDrawer>
    </>
  );
};

export default MeetDrawer;

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

const messageData: MessageNotificationData = {
  senderName: "Ahmad Reza",
  senderAvatarUrl: "/avatars/ahmad.jpg", // optional
  messagePreview: "Pizza Ipsum Dolor Meat Lovers ...",
  conversationId: "conv-123", // optional, for navigation
};

const callData: CallNotificationData = {
  callerName: "Ahmad Reza",
  callerAvatarUrl: "/avatars/ahmad.jpg", // optional
  callType: "voice", // or "video"
};

const participants: CallParticipant[] = [
  {
    id: "me",
    name: "Seyed Habib Sadat",
    avatarUrl: "/avatars/me.jpg",
    isLocal: true,
    isMuted: false,
    isCameraOff: false,
    isSpeaking: false,
    videoTrack: null, // MediaStreamTrack or null
    screenTrack: null,
    reaction: null,
  },
  {
    id: "user-2",
    name: "Ali Reza Hosseini",
    avatarUrl: "/avatars/ali.jpg",
    isLocal: false,
    isMuted: false,
    isCameraOff: false,
    isSpeaking: true,
    videoTrack: null,
    screenTrack: null,
    reaction: null,
  },
  {
    id: "user-3",
    name: "Fati",
    avatarUrl: "/avatars/fati.jpg",
    isLocal: false,
    isMuted: true,
    isCameraOff: true,
    isSpeaking: false,
    videoTrack: null,
    screenTrack: null,
    reaction: null,
  },
  {
    id: "user-4",
    name: "Sara",
    avatarUrl: "/avatars/sara.jpg",
    isLocal: false,
    isMuted: false,
    isCameraOff: true,
    isSpeaking: false,
    videoTrack: null,
    screenTrack: null,
    reaction: null,
  },
  {
    id: "user-5",
    name: "Ali",
    avatarUrl: "/avatars/ali2.jpg",
    isLocal: false,
    isMuted: true,
    isCameraOff: false,
    isSpeaking: false,
    videoTrack: null,
    screenTrack: null,
    reaction: null,
  },
];

const owner: CallOwner = {
  id: "me",
  name: "Seyed Habib Sadat",
  avatarUrl: "/avatars/me.jpg",
};
const room: CallRoom = {
  id: "room-123",
  link: "https://app.pencilly.com/meet/room-123",
};
