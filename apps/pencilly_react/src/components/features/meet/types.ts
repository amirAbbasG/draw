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
