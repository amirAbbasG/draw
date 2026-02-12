import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { ScheduleCalendar } from "./ScheduleCalendar";
import { UpcomingMeetings } from "./UpcomingMeetings";
import { ScheduleForm } from "./ScheduleForm";
import { Show } from "@/components/shared/Show";
import type { ScheduledMeeting, ScheduleMeetingFormData } from "./types";

interface ScheduleMeetingProps {
  onClose?: () => void;
  className?: string;
}

export const ScheduleMeeting: React.FC<ScheduleMeetingProps> = ({
  onClose,
  className,
}) => {
  const t = useTranslations("meet.schedule");
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([
    {
      id: "1",
      title: "PRD Review – Checkout Flow V2",
      date: new Date(2025, 8, 19),
      startTime: "10:00",
      endTime: "11:30",
      eventType: "meeting",
      participants: [
        { id: "u1", name: "Ali R." },
        { id: "u2", name: "Sara M." },
        { id: "u3", name: "Hossein D." },
      ],
      color: "blue",
      boardLink: "Checkout – User Flow & PRD",
    },
    {
      id: "2",
      title: "Product Discussion",
      date: new Date(2025, 8, 19),
      startTime: "12:00",
      endTime: "13:00",
      eventType: "meeting",
      participants: [
        { id: "u4", name: "Mohammad" },
        { id: "u5", name: "Fatima" },
      ],
      color: "yellow",
    },
  ]);

  const handleFormSubmit = (data: ScheduleMeetingFormData) => {
    const newMeeting: ScheduledMeeting = {
      id: `meeting-${Date.now()}`,
      ...data,
      participants: [],
      color: "blue",
    };
    setMeetings([...meetings, newMeeting]);
    setShowForm(false);
  };

  const handleJoinMeeting = (meeting: ScheduledMeeting) => {
    console.log("[v0] Joining meeting:", meeting);
    // Integrate with actual call logic
  };

  const handleEditMeeting = (meeting: ScheduledMeeting) => {
    console.log("[v0] Editing meeting:", meeting);
    // Implement edit logic
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(meetings.filter((m) => m.id !== meetingId));
  };

  return (
    <div className={cn("flex flex-col gap-4 h-full", className)}>
      <Show>
        <Show.When isTrue={!showForm}>
          <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                {t("schedule_meeting")}
              </h2>
              <Button
                size="sm"
                onClick={() => setShowForm(true)}
                className="gap-1"
              >
                <AppIcon icon="hugeicons:calendar-add-01" className="w-4 h-4" />
                {t("new_meeting")}
              </Button>
            </div>

            <ScheduleCalendar
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
              meetings={meetings}
            />

            <UpcomingMeetings
              meetings={meetings}
              selectedDate={selectedDate}
              onJoinMeeting={handleJoinMeeting}
              onEditMeeting={handleEditMeeting}
              onDeleteMeeting={handleDeleteMeeting}
            />
          </div>
        </Show.When>

        <Show.When isTrue={showForm}>
          <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
              >
                <AppIcon icon="hugeicons:arrow-left-01" className="w-4 h-4" />
              </Button>
              <h2 className="text-base font-semibold text-foreground">
                {t("create_new_meeting")}
              </h2>
            </div>

            <ScheduleForm
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
              initialData={selectedDate ? { date: selectedDate } : undefined}
            />
          </div>
        </Show.When>
      </Show>

      {onClose && (
        <Button
          variant="outline"
          onClick={onClose}
          className="w-full"
        >
          {t("close")}
        </Button>
      )}
    </div>
  );
};

export default ScheduleMeeting;
