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

export type ChatView = "chat" | "info";
