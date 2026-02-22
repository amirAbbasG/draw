export const meetKeys = {
  all: ["meet"] as const,

  conversations: () => [...meetKeys.all, "conversations"] as const,

  messages: (conversationId: string) =>
    [...meetKeys.all, "messages", conversationId] as const,

  members: (conversationId: string) =>
    [...meetKeys.all, "members", conversationId] as const,

  readReceipts: (conversationId: string) =>
    [...meetKeys.all, "readReceipts", conversationId] as const,

  activities: (conversationId: string, kind?: string, status?: string) =>
    [...meetKeys.all, "activities", conversationId, { kind, status }] as const,

  searchUser: (query: string) =>
    [...meetKeys.all, "searchUser", query] as const,
};
