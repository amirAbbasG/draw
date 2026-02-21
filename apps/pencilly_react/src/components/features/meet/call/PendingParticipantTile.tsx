import React, { useEffect, useState, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import type { MeetUser } from "../types";

interface PendingParticipantTileProps {
  participant: MeetUser & { addedAt: number };
  className?: string;
}

/**
 * Tile shown in the call grid for a user who has been invited
 * but hasn't joined yet. Displays a pulsing avatar + "Waiting..." label.
 * Auto-animates an elapsed timer.
 */
const PendingParticipantTile: FC<PendingParticipantTileProps> = ({
  participant,
  className,
}) => {
  const t = useTranslations("meet");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - participant.addedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [participant.addedAt]);

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-primary rounded-lg bg-background-dark centered-row animate-pulse p-2",
        className,
      )}
    >
      <div className="col items-center gap-2">
        <div className="animate-pulse">
          <UserAvatar
            imageSrc={participant.avatarUrl ?? undefined}
            name={participant.username}
            className="size-10 sm:size-14 text-base "
          />
        </div>
        <div className="col items-center gap-1">
          <AppTypo
            variant="small"
            className="truncate max-w-[120px]"
          >
            {participant.name || participant.username}
          </AppTypo>
          <AppTypo variant="xs" color="secondary">
            {t("pending_join")} {elapsed}s
          </AppTypo>
        </div>
      </div>
    </div>
  );
};

export default PendingParticipantTile;
