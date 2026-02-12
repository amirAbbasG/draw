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

export type GridLayout = "auto" | "tiled" | "spotlight" | "sidebar";

export interface GridSettings {
  layout: GridLayout;
  /** Max tiles to display (2-16), depends on window size */
  maxTiles: number;
}
