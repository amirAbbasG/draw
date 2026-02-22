import { ChatSettings, type Decorator } from "@/components/features/meet/types";
import { sharedIcons } from "@/constants/icons";

export const DEFAULT_GROUP_SETTINGS: ChatSettings = {
  call_state: "open",
  chat_state: "open",
  stream_state: "open",
  collab_state: "open",
  status: "active",
};

export const STATUS_CLASSES = {
  primary: {
    border: "border-primary",
    background: "bg-primary-lighter",
    text: "text-primary",
  },
  danger: {
    border: "border-danger",
    background: "bg-danger-lighter",
    text: "text-danger",
  },
  warning: {
    border: "border-warning",
    background: "bg-warning-lighter",
    text: "text-warning",
  },
  success: {
    border: "border-success",
    background: "bg-success-lighter",
    text: "text-success",
  },
  info: {
    border: "border-info",
    background: "bg-info-lighter",
    text: "text-info",
  },
};

export const decorators: Decorator[] = [
  {
    id: "ai-decorator",
    icon: sharedIcons.ai,
    title: "AI Assistant",
    description: "Mention AI for help",
    key: "ai",
  },
];
