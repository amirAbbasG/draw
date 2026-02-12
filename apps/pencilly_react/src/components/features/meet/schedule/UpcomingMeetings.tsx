import React from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";
import { MeetingCard } from "./MeetingCard";
import type { ScheduledMeeting } from "./types";

interface UpcomingMeetingsProps {
  meetings: ScheduledMeeting[];
  selectedDate?: Date;
  onJoinMeeting?: (meeting: ScheduledMeeting) => void;
  onEditMeeting?: (meeting: ScheduledMeeting) => void;
  onDeleteMeeting?: (meetingId: string) => void;
  className?: string;
  maxItems?: number;
}

export const UpcomingMeetings: React.FC<UpcomingMeetingsProps> = ({
  meetings,
  selectedDate,
  onJoinMeeting,
  onEditMeeting,
  onDeleteMeeting,
  className,
  maxItems = 3,
}) => {
  const t = useTranslations("meet.schedule");

  const filteredMeetings = selectedDate
    ? meetings.filter(
        (meeting) =>
          meeting.date.toDateString() === selectedDate.toDateString()
      )
    : meetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, maxItems);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-sm">{t("upcoming_meetings")}</h3>
        {filteredMeetings.length > 0 && (
          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
            {filteredMeetings.length}
          </span>
        )}
      </div>

      {filteredMeetings.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onJoin={() => onJoinMeeting?.(meeting)}
              onEdit={() => onEditMeeting?.(meeting)}
              onDelete={() => onDeleteMeeting?.(meeting.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 px-4 text-muted-foreground">
          <p className="text-sm">{t("no_meetings")}</p>
          {selectedDate && (
            <p className="text-xs mt-2">
              {t("selected_date")}: {selectedDate.toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
