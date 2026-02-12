export interface ScheduledMeeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  timezone?: string;
  repeat: string[];
  members: MeetingMember[];
  attachedBoard?: string;
  color?: string;
}

export interface MeetingMember {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface ScheduleMeetingFormData {
  title: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  repeat: string[];
  members: string[];
  attachedBoard: string;
}
