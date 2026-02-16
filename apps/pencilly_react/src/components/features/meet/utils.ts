import type { ChatMessage } from "@/components/features/meet/types";

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