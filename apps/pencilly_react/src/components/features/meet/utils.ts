import type {ChatMessage, Conversation, Decorator, MeetUser} from "@/components/features/meet/types";

/**
 * Returns a human-readable date label for grouping messages.
 * Parses ISO date strings and returns "Today", "Yesterday", or a formatted date.
 */
export function extractDateLabel(isoString: string): string {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffMs = today.getTime() - messageDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Formats an ISO timestamp to a short time string (e.g. "9:40 AM").
 */
export function formatMessageTime(isoString: string): string {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface MessageGroup {
  dateLabel?: string;
  messages: ChatMessage[];
}

/**
 * Group messages by date label for rendering date separators.
 * Uses createdAt (ISO string) to compute date grouping.
 */
export function groupMessagesByDate(messages: ChatMessage[]): MessageGroup[] {
  if (messages.length === 0) return [];

  const groups: MessageGroup[] = [];
  let currentDate = "";

  for (const msg of messages) {
    const dateLabel = extractDateLabel(msg.createdAt);

    if (dateLabel !== currentDate) {
      groups.push({ dateLabel, messages: [msg] });
      currentDate = dateLabel;
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }

  return groups;
}

/**
 * Generate a unique client event ID for message deduplication.
 */
export function generateClientEventId(): string {
  return crypto.randomUUID();
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}


/**
 * Result returned by extractDecoratorsFromText
 */
export interface ExtractDecoratorsResult {
  matches: {
    decorator: Decorator;
    index: number;
    raw: string; // the raw matched text, e.g. "@ai"
  }[];
  ids: string[]; // unique decorator ids found
  keys: string[]; // unique decorator keys found
  count: number; // unique decorator count
  valid: boolean; // true when at most one decorator is present
  firstId?: string; // id of first found decorator (if any)
  error?: string; // present when invalid (more than one decorator)
}

/**
 * Extract decorators from `text` by matching @key tokens against the provided decorators.
 * Only alphanumeric + underscore keys are considered (change the regex if your keys allow other chars).
 */
export function extractDecoratorsFromText(
    text: string,
    decorators: Decorator[]
): ExtractDecoratorsResult {
  const regex = /@([A-Za-z0-9_]+)/g;
  const matches: ExtractDecoratorsResult["matches"] = [];

  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const token = m[1];
    const found = decorators.find(d => d.key.toLowerCase() === token.toLowerCase());
    if (found) {
      matches.push({
        decorator: found as Decorator,
        index: m.index,
        raw: m[0],
      });
    }
    // continue scanning (global regex)
  }

  const keys = Array.from(new Set(matches.map(x => x.decorator.key)));
  const ids = Array.from(new Set(matches.map(x => x.decorator.id)));
  const count = ids.length;
  const valid = count <= 1;

  return {
    matches,
    ids,
    keys,
    count,
    valid,
    firstId: ids[0],
    error: valid ? undefined : "multiple_decorators_not_allowed",
  };
}

/**
 * Convenience helper: returns the single decorator id if valid, otherwise undefined.
 */
export function getSingleDecoratorId(
    text: string,
    decorators: Decorator[]
): string | undefined {
  const res = extractDecoratorsFromText(text, decorators);
  return res.valid ? res.firstId : undefined;
}

export const createTemConversation = (user: MeetUser, me: MeetUser) => {
  return  {
    id: `temp-${user.id}`,
    title: user.name,
    profile_image_url: user.avatarUrl,
    members: [user, me],
    owner_id: Number(me.id),
    role: "owner",
    status: "active",
    chat_state: "active",
    call_state: "inactive",
    collab_state: "inactive",
    stream_state: "inactive",
    next_seq: 0,
    state_version: 0,
    starts_at: null,
    ended_at: null,
    last_event_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    muted: false,
  } as Conversation
}

// Helper: compute caret offset (character index) within a contenteditable element
export const getCaretCharacterOffsetWithin = (element: HTMLElement | null) => {
  if (!element) return 0;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return element.innerText.length;

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);

  const temp = document.createElement('div');
  temp.appendChild(preCaretRange.cloneContents());
  return temp.innerText.length;
};

// Helper: set caret at a character offset within contenteditable
export const setCaretCharacterOffsetWithin = (element: HTMLElement | null, offset: number) => {
  if (!element) return;
  element.focus();
  const selection = window.getSelection();
  if (!selection) return;

  let currentOffset = 0;
  let nodeToPlace: Node | null = null;
  let placeOffset = 0;

  // NodeFilter is available on window; createTreeWalker typing can be strict in TS, use as any if needed
  const walker = (document as any).createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
  );

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const nextOffset = currentOffset + (node.textContent?.length ?? 0);
    if (offset <= nextOffset) {
      nodeToPlace = node;
      placeOffset = offset - currentOffset;
      break;
    }
    currentOffset = nextOffset;
  }

  if (nodeToPlace) {
    const range = document.createRange();
    range.setStart(nodeToPlace, placeOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};


