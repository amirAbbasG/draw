import { useState } from "react";
import type { ScheduledMeeting, ScheduleMeetingFormData } from "./types";

export const useScheduleMeetings = (initialMeetings: ScheduledMeeting[] = []) => {
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>(initialMeetings);
  const [isLoading, setIsLoading] = useState(false);

  const addMeeting = async (data: ScheduleMeetingFormData) => {
    setIsLoading(true);
    try {
      const newMeeting: ScheduledMeeting = {
        id: `meeting-${Date.now()}`,
        ...data,
        color: "blue",
      };
      setMeetings([...meetings, newMeeting]);
      return newMeeting;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMeeting = async (id: string, data: Partial<ScheduleMeetingFormData>) => {
    setIsLoading(true);
    try {
      setMeetings(
        meetings.map((meeting) =>
          meeting.id === id ? { ...meeting, ...data } : meeting
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMeeting = async (id: string) => {
    setIsLoading(true);
    try {
      setMeetings(meetings.filter((meeting) => meeting.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(
      (meeting) => meeting.date.toDateString() === date.toDateString()
    );
  };

  const getUpcomingMeetings = (limit: number = 5) => {
    return meetings
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  };

  return {
    meetings,
    isLoading,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    getMeetingsForDate,
    getUpcomingMeetings,
  };
};
