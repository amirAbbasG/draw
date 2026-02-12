export interface ScheduledMeeting {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  participants: MeetingParticipant[];
  eventType: "meeting" | "event";
  location?: string;
  boardLink?: string;
  color?: string;
}

export interface MeetingParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  status?: "accepted" | "pending" | "declined";
}

export interface ScheduleMeetingFormData {
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  participants: string[];
  eventType: "meeting" | "event";
  location?: string;
}
