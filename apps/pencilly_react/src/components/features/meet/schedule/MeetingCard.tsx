import React, { type FC } from "react";

import { STATUS_CLASSES } from "@/components/features/meet/constants";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import { EventStatusColor, ScheduledMeeting } from "./types";

interface MeetingCardProps {
  meeting: ScheduledMeeting;
  onJoin?: (meeting: ScheduledMeeting) => void;
  onEdit?: (meeting: ScheduledMeeting) => void;
  onDelete?: (meeting: ScheduledMeeting) => void;
  className?: string;
  status?: EventStatusColor;
}

const MeetingCard: FC<MeetingCardProps> = ({
  meeting,
  onJoin,
  onEdit,
  onDelete,
  className,
  status = "primary",
}) => {
  const t = useTranslations("meet.schedule");

  const formattedMembers = formatMembers(meeting.members);

  const statusClasses = STATUS_CLASSES[status] || STATUS_CLASSES.primary;

  return (
    <div
      className={cn(
        `rounded-lg border  p-3 flex flex-col gap-1.5`,
        `border-l-4`,
        statusClasses.background,
        statusClasses.border,
        className,
      )}
    >
      {/* Title */}
      <AppTypo variant="headingXS" className={statusClasses.text}>
        {meeting.title}
      </AppTypo>

      {/* Date & Time */}
      <AppTypo variant="headingXXS" color="secondary">
        {meeting.date} · {meeting.startTime}
        {meeting.endTime ? ` – ${meeting.endTime}` : ""}
        {meeting.timezone ? ` (${meeting.timezone})` : ""}
      </AppTypo>

      {/* Members */}
      {meeting.members.length > 0 && (
        <AppTypo variant="small" color="secondary">
          {formattedMembers}
        </AppTypo>
      )}

      {/* Attached Board */}
      {meeting.attachedBoard && (
        <div className="flex items-center gap-1">
          <AppIcon icon="hugeicons:link-02" className="size-3.5 " />
          <AppTypo variant="small">
            {t("attached_board")}: {meeting.attachedBoard}
          </AppTypo>
        </div>
      )}

      {/* Actions */}
      <div className="row gap-2 mt-1">
        <Button onClick={() => onJoin?.(meeting)} variant="outline" size="sm">
          {t("join_meeting")}
        </Button>
        <Button onClick={() => onEdit?.(meeting)} variant="outline" size="sm">
          {t("edit")}
        </Button>
        <Button onClick={() => onDelete?.(meeting)} variant="outline" size="sm">
          {t("delete")}
        </Button>
      </div>
    </div>
  );
};

function formatMembers(members: ScheduledMeeting["members"]): string {
  if (members.length === 0) return "";
  const MAX_VISIBLE = 3;
  const visible = members.slice(0, MAX_VISIBLE);
  const remaining = members.length - MAX_VISIBLE;

  const names = visible
    .map(m => {
      const parts = m.name.split(" ");
      return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
    })
    .join(" · ");

  return remaining > 0 ? `${names} +${remaining}` : names;
}

export default MeetingCard;
