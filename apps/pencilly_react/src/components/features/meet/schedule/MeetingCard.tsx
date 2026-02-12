import React, { type FC } from "react";

import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import type { ScheduledMeeting } from "./types";

interface MeetingCardProps {
  meeting: ScheduledMeeting;
  onJoin?: (meeting: ScheduledMeeting) => void;
  onEdit?: (meeting: ScheduledMeeting) => void;
  onDelete?: (meeting: ScheduledMeeting) => void;
  className?: string;
}

const MeetingCard: FC<MeetingCardProps> = ({
  meeting,
  onJoin,
  onEdit,
  onDelete,
  className,
}) => {
  const t = useTranslations("meet.schedule");

  const formattedMembers = formatMembers(meeting.members);

  return (
    <div
      className={cn(
        "rounded-lg border border-warning/30 bg-warning/5 p-3 flex flex-col gap-1.5",
        "border-l-4 border-l-warning",
        className,
      )}
    >
      {/* Title */}
      <AppTypo variant="small" className="font-semibold leading-5">
        {meeting.title}
      </AppTypo>

      {/* Date & Time */}
      <AppTypo variant="xs" color="secondary">
        {meeting.date} · {meeting.startTime}
        {meeting.endTime ? ` – ${meeting.endTime}` : ""}
        {meeting.timezone ? ` (${meeting.timezone})` : ""}
      </AppTypo>

      {/* Members */}
      {meeting.members.length > 0 && (
        <AppTypo variant="xs" color="muted">
          {formattedMembers}
        </AppTypo>
      )}

      {/* Attached Board */}
      {meeting.attachedBoard && (
        <div className="flex items-center gap-1">
          <AppIcon
            icon="hugeicons:link-02"
            className="size-3 text-foreground-lighter"
          />
          <AppTypo variant="xs" color="muted">
            {t("attached_board")}: {meeting.attachedBoard}
          </AppTypo>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-1 pt-1.5 border-t border-warning/20">
        <button
          onClick={() => onJoin?.(meeting)}
          className="text-xs font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
        >
          {t("join_meeting")}
        </button>
        <button
          onClick={() => onEdit?.(meeting)}
          className="text-xs font-medium text-foreground-light hover:text-foreground transition-colors cursor-pointer"
        >
          {t("edit")}
        </button>
        <button
          onClick={() => onDelete?.(meeting)}
          className="text-xs font-medium text-foreground-light hover:text-danger transition-colors cursor-pointer"
        >
          {t("delete")}
        </button>
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
      return parts.length > 1
        ? `${parts[0]} ${parts[1][0]}.`
        : parts[0];
    })
    .join(" · ");

  return remaining > 0 ? `${names} +${remaining}` : names;
}

export default MeetingCard;
