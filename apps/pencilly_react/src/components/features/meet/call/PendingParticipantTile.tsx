import React, { useEffect, useState, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import type { PendingParticipant } from "../types";

interface PendingParticipantTileProps {
  participant: PendingParticipant;
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
        "relative overflow-hidden rounded-lg bg-muted flex items-center justify-center",
        className,
      )}
    >
      <div className="col items-center gap-3">
        <div className="animate-pulse">
          <UserAvatar
            imageSrc={participant.profileImageUrl ?? undefined}
            name={participant.name}
            className="size-16 sm:size-20 text-base opacity-60"
          />
        </div>
        <div className="col items-center gap-1">
          <AppTypo variant="small" color="secondary" className="truncate max-w-[120px]">
            {participant.name}
          </AppTypo>
          <AppTypo variant="xs" color="muted">
            {t("pending_join")} {elapsed}s
          </AppTypo>
        </div>
      </div>
    </div>
  );
};

export default PendingParticipantTile;
