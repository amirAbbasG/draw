// ─── Actor / User ───────────────────────────────────────────────────────────

export interface Actor {
  id: number;
  name: string;
  profileImageUrl?: string | null;
}

/** Lightweight user reference used across meet UI */
export interface MeetUser {
  id: string;
  name: string;
  avatarUrl?: string;
  username: string;
}

// ─── Conversation ───────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  title: string;
  owner_id: number;
  role: string;
  status: string;
  chat_state: string;
  call_state: string;
  collab_state: string;
  stream_state: string;
  next_seq: number;
  state_version: number;
  starts_at: string | null;
  ended_at: string | null;
  last_event_at: string | null;
  created_at: string;
  updated_at: string;

  // API-provided enrichment fields
  unread_count?: number;
  countMemebrs?: number;

  // Client-side enrichments (not from API directly)
  members?: MeetUser[];
  lastMessage?: {
    text: string;
    senderName: string;
    timestamp: string;
  };
  unseenCount?: number;
  isOnline?: boolean;
  isMuted?: boolean;
  isGroup?: boolean;
  avatarUrl?: string;
}

// ─── Conversation List API Response ─────────────────────────────────────────

export interface ConversationListResponse {
  count: number;
  websocket_url: string;
  items: Conversation[];
}

// ─── Chat Message / Event ───────────────────────────────────────────────────

export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";

export interface ReplyTo {
  id: string;
  seq: number;
  senderUserId: number;
  sender?: Actor;
  body: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  seq: number;
  type: string;
  subtype: string;
  status: string;
  senderUserId: number | null;
  actor?: Actor;
  body: string;
  payload?: Record<string, any>;
  clientEventId?: string;
  createdAt: string;
  updatedAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;

  // Client-side computed
  isCurrentUser: boolean;
  displayStatus?: MessageStatus;
  replyTo?: ReplyTo;
}

// ─── Conversation Event Envelope (WS) ──────────────────────────────────────

export interface ConversationEventPayload {
  id: string;
  conversationId: string;
  seq: number;
  type: "message" | "system" | "activity" | "state";
  subtype: string;
  status: string;
  senderUserId: number | null;
  isCurrentUser: boolean;
  actor?: Actor;
  body: string;
  payload?: Record<string, any>;
  clientEventId?: string;
  createdAt: string;
  updatedAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
}

export interface ConversationEvent {
  type: "conversation:event";
  conversationId: string;
  seq: number;
  stateVersion: number;
  event: ConversationEventPayload;
}

// ─── WS Message Types ──────────────────────────────────────────────────────

export interface WsConnectedMessage {
  type: "conversations:connected";
  userId: number;
  autoSubscribedConversationIds: string[];
  autoSubscribedTruncated: boolean;
}

export interface WsSubscribedMessage {
  type: "conversations:subscribed";
  conversationIds: string[];
}

export interface WsUnsubscribedMessage {
  type: "conversations:unsubscribed";
  conversationIds: string[];
}

export interface WsUpsertMessage {
  type: "conversations:upsert";
  conversationId: string;
  reason: string;
  role: string | null;
}

export interface WsReadUpdatedMessage {
  type: "conversation:read_updated";
  conversationId: string;
  userId: number;
  lastReadSeq: number;
  updatedAt: string;
}

export interface WsErrorMessage {
  type: "error";
  code: string;
  message: string;
}

export interface WsPongMessage {
  type: "pong";
}

export type WsServerMessage =
  | WsConnectedMessage
  | WsSubscribedMessage
  | WsUnsubscribedMessage
  | ConversationEvent
  | WsUpsertMessage
  | WsReadUpdatedMessage
  | WsErrorMessage
  | WsPongMessage;

// ─── Activity ──────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  conversation_id: string;
  kind: "call" | "collab" | "stream";
  status: "pending" | "active" | "ended" | "failed";
  provider: string;
  provider_room_id: string;
  started_by_user_id: number;
  started_event_id: string;
  ended_event_id: string | null;
  started_at: string;
  ended_at: string | null;
  payload: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ─── Read Receipts ─────────────────────────────────────────────────────────

export interface ReadReceipt {
  seq: number;
  user_ids: number[];
}

export interface ReadByResponse {
  conversation_id: string;
  count: number;
  items: ReadReceipt[];
}

// ─── Messages API Response ─────────────────────────────────────────────────

export interface MessagesResponse {
  conversation_id: string;
  count: number;
  has_more: boolean;
  next_before_seq: number;
  items: ConversationEventPayload[];
}

// ─── UI State Types ────────────────────────────────────────────────────────

export type ChatView = "chat" | "info" | "settings";

export type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected";

export type CallType = "audio" | "video";

/** Pending participant waiting to join call */
export interface PendingParticipant {
  userId: number;
  name: string;
  profileImageUrl?: string | null;
  addedAt: number;
}

/** Conversation member from the API */
export interface ConversationMember {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
}

export interface ConversationMembersResponse {
  count: number;
  items: ConversationMember[];
}

/** Settings schema for a group chat */
export interface ChatGroupSettings {
  message: {
    allowMembersToSend: boolean;
    availability: "always" | "only_during_meetings" | "custom_schedule";
    schedule: {
      start: string;
      end: string;
      repeat: string[];
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
  meeting: {
    allowCreation: boolean;
    chatDuringMeetingOnly: boolean;
    allowRecording: boolean;
  };
}
