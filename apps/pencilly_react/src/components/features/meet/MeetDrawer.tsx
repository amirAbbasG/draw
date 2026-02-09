import React, { useState, type FC } from "react";

import AppDrawer from "@/components/shared/AppDrawer";
import DynamicButton from "@/components/shared/DynamicButton";
import { sharedIcons } from "@/constants/icons";

import MeetDrawerContent from "./MeetDrawerContent";
import type { Conversation } from "./types";

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

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const handleCall = (conversation: Conversation) => {
    // Placeholder - integrate with actual call logic
  };

  const handleStartNewCall = () => {
    // Placeholder - integrate with actual call creation flow
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
      <MeetDrawerContent
        conversations={DEMO_CONVERSATIONS}
        connectionState="connected"
        onCall={handleCall}
        onStartNewCall={handleStartNewCall}
        className="flex-1 overflow-x-hidden"
      />
    </AppDrawer>
  );
};

export default MeetDrawer;
