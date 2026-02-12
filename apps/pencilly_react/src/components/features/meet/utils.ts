import type { ChatMessage } from "@/components/features/meet/types";

/**
 * Extracts a date label from a timestamp string.
 * In a real app, this would parse the date and return "Today", "Yesterday", etc.
 * For now, we return undefined (no separator) for simple time-only strings.
 */
export function extractDateLabel(timestamp: string): string {
  // If timestamp looks like a date ("Yesterday", "02/09/2026", etc.)
  if (
    timestamp.toLowerCase().includes("yesterday") ||
    timestamp.toLowerCase().includes("today") ||
    /\d{2}\/\d{2}/.test(timestamp)
  ) {
    return timestamp;
  }
  return "";
}

interface MessageGroup {
  dateLabel?: string;
  messages: ChatMessage[];
}

/**
 * Group messages by date label for rendering date separators.
 * Simple implementation - groups consecutive messages that share the same date.
 */
export function groupMessagesByDate(messages: ChatMessage[]): MessageGroup[] {
  if (messages.length === 0) return [];

  const groups: MessageGroup[] = [];
  let currentDate = "";

  for (const msg of messages) {
    // Extract the date portion from timestamp (e.g., "Yesterday", "02/09", etc.)
    const dateLabel = extractDateLabel(msg.timestamp);

    if (dateLabel !== currentDate) {
      groups.push({ dateLabel, messages: [msg] });
      currentDate = dateLabel;
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }

  return groups;
}