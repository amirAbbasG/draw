import { ChatGroupSettings } from "@/components/features/meet/types";

export const DEFAULT_GROUP_SETTINGS: ChatGroupSettings = {
  message: {
    allowMembersToSend: true,
    availability: "always",
    schedule: { start: "08:00", end: "08:00", repeat: ["Su", "Mo"] },
    allowedTypes: {
      all: false,
      textMessages: true,
      images: true,
      videos: true,
      fileUploads: true,
      links: false,
    },
    allowDeletion: true,
  },
  meeting: {
    allowCreation: false,
    chatDuringMeetingOnly: true,
    allowRecording: true,
  },
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