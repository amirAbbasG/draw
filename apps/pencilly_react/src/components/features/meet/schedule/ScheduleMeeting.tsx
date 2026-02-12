import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
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
    // Integrate with actual call logic
  };

  const handleEditMeeting = (meeting: ScheduledMeeting) => {
    // Implement edit logic
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(meetings.filter((m) => m.id !== meetingId));
  };

  return (
    <div className={cn("flex flex-col gap-4 h-full", className)}>
      <Show>
        <Show.When isTrue={!showForm}>
          <div className="flex flex-col gap-4 overflow-y-auto flex-1">
            <div className="flex items-center justify-between px-1">
              <AppTypo variant="headingM">
                {t("schedule_meeting")}
              </AppTypo>
              <AppIconButton
                icon="hugeicons:calendar-add-01"
                size="sm"
                onClick={() => setShowForm(true)}
                title={t("new_meeting")}
                variant="fill"
                color="primary"
              />
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
          <div className="flex flex-col gap-4 overflow-y-auto flex-1">
            <div className="flex items-center gap-2 px-1">
              <AppIconButton
                icon="hugeicons:arrow-left-01"
                size="sm"
                onClick={() => setShowForm(false)}
                title={t("close")}
              />
              <AppTypo variant="headingM">
                {t("create_new_meeting")}
              </AppTypo>
            </div>

            <ScheduleForm
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
              initialData={selectedDate ? { date: selectedDate } : undefined}
            />
          </div>
        </Show.When>
      </Show>
    </div>
  );
};

export default ScheduleMeeting;
