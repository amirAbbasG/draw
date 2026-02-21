// ─── Actor / User ───────────────────────────────────────────────────────────

export interface Actor {
  id: number;
  name: string;
  profileImageUrl?: string | null;
  username?: string;
}

/** Lightweight user reference used across meet UI */
export interface MeetUser {
  id: string;
  name: string;
  avatarUrl?: string;
  username: string;
  isCurrentUser?: boolean;
  convesation_id?: string | number;
  commen_convesations?: string[]
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
  muted: boolean;

  // API-provided enrichment fields
  unread_count?: number;
  countMemebrs?: number;

  // Client-side enrichments (not from API directly)
  members?: MeetUser[];
  last_message?: ChatMessage
  last_message_at: string,
  unseenCount?: number;
  isOnline?: boolean;
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

export type MessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

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
  agentType?: string | null;
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

export interface ConversationAI {
  sourceEventId: string;
  prompt: string;
  error?: string
  provider?: string
}

export interface ConversationActivity {
  id: string
  conversation_id: string
  kind: string
  status: string
  provider: string
  provider_room_id: string
  started_by_user_id: number
  started_event_id: string
  ended_event_id: any
  started_at: string
  ended_at: any
  payload: ActivityPayload
  created_at: string
  updated_at: string
}

export interface ActivityPayload {
  roomName: string
  sessionId: string
}


export interface ConversationEventPayload {
  id: string;
  conversationId: string;
  seq: number;
  type: "message" | "system" | "activity" | "state" | "agent";
  subtype: string;
  status: "done" | "pending" | "failed";
  senderUserId: number | null;
  isCurrentUser: boolean;
  actor?: Actor;
  body: string;
  payload?: Record<string, any>;
  clientEventId?: string;
  createdAt: string;
  updatedAt: string;
  agentType?: string;
  ai?: ConversationAI;
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

export interface WsReactionMessage {
  type: "conversation:reaction";
  conversationId: string;
  senderUserId: string;
  identity: string;
  text: string;
  createdAt: string;
  reactionType: ReactionType;
}

export interface WsPongMessage {
  type: "pong";
}

export interface WsCallInviteMessage {
  type: "conversation:call_invite"
  conversationId: string
  activityId: string
  sessionId: string
  roomName: string
  invitedBy: InvitedBy
  createdAt: string
}

export interface InvitedBy {
  id: number
  name: string
  profileImageUrl?: string | null
}


export type WsServerMessage =
  | WsConnectedMessage
  | WsSubscribedMessage
  | WsUnsubscribedMessage
  | ConversationEvent
  | WsUpsertMessage
  | WsReadUpdatedMessage
  | WsErrorMessage
  | WsPongMessage
  | WsReactionMessage
  | WsCallInviteMessage

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
  convesation_id?: string | number;
  commen_convesations?: string[]
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

export type ReactionType = "emoji" | "raise_hand" | "lower_hand";

export interface Decorator {
  id: string;
  icon: string;
  title: string;
  description: string;
  key: string; // the value inserted into the chat input when selected
}


export interface UserSearchResponse {
  query: string
  exact: boolean
  match_type: string
  results: SearchUser[]
}

export interface SearchUser {
  id: number
  username: string
  email: string
  profile_image_url: string
}
