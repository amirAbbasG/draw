export interface MeetUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  title?: string;
  avatarUrl?: string;
  members: MeetUser[];
  lastMessage?: {
    text: string;
    senderName: string;
    timestamp: string;
  };
  unseenCount?: number;
  isOnline?: boolean;
}

export type MessageStatus = "sent" | "delivered" | "read" | "pending";

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  timestamp: string;
  status?: MessageStatus;
  isCurrentUser: boolean;
}

export type ChatView = "chat" | "info" | "settings";

/** Settings schema for a group chat */
export interface ChatGroupSettings {
  /** Message section */
  message: {
    allowMembersToSend: boolean;
    availability: "always" | "only_during_meetings" | "custom_schedule";
    schedule: {
      start: string; // "HH:mm"
      end: string;   // "HH:mm"
      repeat: string[]; // e.g. ["Su","Mo"]
    };
    allowedTypes: {
      all: boolean;
      textMessages: boolean;
      images: boolean;
      videos: boolean;
      fileUploads: boolean;
      links: boolean;
    };
    allowDeletion: boolean;
  };
  /** Meeting section */
  meeting: {
    allowCreation: boolean;
    chatDuringMeetingOnly: boolean;
    allowRecording: boolean;
  };
}
