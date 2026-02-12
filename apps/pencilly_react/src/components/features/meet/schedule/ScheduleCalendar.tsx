import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";
import { sharedIcons } from "@/constants/icons";
import type { ScheduledMeeting } from "./types";

interface ScheduleCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  meetings?: ScheduledMeeting[];
  onClose?: () => void;
  className?: string;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  onDateSelect,
  selectedDate,
  meetings = [],
  onClose,
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
    <div className={cn("flex flex-col gap-4 p-4 bg-background rounded-lg", className)}>
      <div className="flex items-center justify-between">
        <AppTypo variant="headingS">
          {t("calendar")}
        </AppTypo>
        {onClose && (
          <AppIconButton
            icon={sharedIcons.close}
            size="sm"
            onClick={onClose}
            title={t("close")}
          />
        )}
      </div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        className="rounded-md"
      />
    </div>
  );
};
