import type { User } from "@/services/user";

export interface Reaction {
  id: string;
  content: string;
  users: User[];
}

export type Reply = Omit<
  Comment,
  "replies" | "itemId" | "resolved" | "isStageComment"
>;

export interface Comment {
  id: string;
  itemId: string;
  content: string;
  createdAt: string;
  resolved: boolean;
  isStageComment?: boolean;
  user: User;
  reactions: Reaction[];
  replies: Reply[];
  mentionUsers: User[];
}
