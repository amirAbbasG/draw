import type { MeetUser } from "../types";

export interface CallParticipant extends MeetUser {
  isMuted?: boolean;
  isCameraOff?: boolean;
  isSpeaking?: boolean;
  isPinned?: boolean;
  isLocal?: boolean;
  isScreenSharing?: boolean;
  videoTrack?: MediaStreamTrack | null;
  screenTrack?: MediaStreamTrack | null;
  reaction?: string | null;
}

export interface CallRoom {
  id: string;
  link: string;
  title?: string;
}

export interface CallOwner {
  id: string;
  name: string;
  avatarUrl?: string;
}

export type CallViewMode = "maximized" | "minimized";
