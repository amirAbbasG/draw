import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";
import type { ScheduledMeeting } from "./types";

interface ScheduleCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  meetings?: ScheduledMeeting[];
  className?: string;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  onDateSelect,
  selectedDate,
  meetings = [],
  className,
}) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const t = useTranslations("meet.schedule");

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      onDateSelect(selectedDate);
    }
  };

  const hasMeetingOnDate = (checkDate: Date) => {
    return meetings.some(
      (meeting) =>
        meeting.date.toDateString() === checkDate.toDateString()
    );
  };

  return (
    <div className={cn("flex flex-col gap-4 p-4 bg-background rounded-lg border", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{t("calendar")}</h3>
      </div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        className="rounded-md border"
      />
    </div>
  );
};
