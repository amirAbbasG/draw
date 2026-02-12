import React from "react";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";
import type { ScheduledMeeting } from "./types";

interface MeetingCardProps {
  meeting: ScheduledMeeting;
  onJoin?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onJoin,
  onEdit,
  onDelete,
  className,
}) => {
  const t = useTranslations("meet.schedule");

  const getEventColor = (color?: string) => {
    const colorMap: Record<string, string> = {
      blue: "border-l-blue-500 bg-blue-50",
      red: "border-l-red-500 bg-red-50",
      green: "border-l-green-500 bg-green-50",
      purple: "border-l-purple-500 bg-purple-50",
      yellow: "border-l-yellow-500 bg-yellow-50",
    };
    return colorMap[color || "blue"] || colorMap["blue"];
  };

  const participantsList = meeting.participants
    .slice(0, 2)
    .map((p) => p.name)
    .join(", ");
  const moreParticipants =
    meeting.participants.length > 2
      ? ` +${meeting.participants.length - 2}`
      : "";

  return (
    <div
      className={cn(
        "border-l-4 rounded-md p-4 mb-3 bg-card",
        getEventColor(meeting.color),
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground truncate">
            {meeting.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {meeting.startTime} - {meeting.endTime}
          </p>
          {meeting.participants.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {participantsList}
              {moreParticipants}
            </p>
          )}
          {meeting.boardLink && (
            <p className="text-xs text-primary mt-2 truncate">
              📌 {t("attached_board")}
            </p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {onJoin && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={onJoin}
            >
              {t("join_meeting")}
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
            >
              <AppIcon icon="hugeicons:pencil-edit-02" className="w-3.5 h-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onDelete}
            >
              <AppIcon icon="hugeicons:delete-03" className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
