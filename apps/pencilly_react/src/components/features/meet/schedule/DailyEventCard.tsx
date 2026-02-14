import { FC } from "react";

import { STATUS_CLASSES } from "@/components/features/meet/constants";
import { DailyEvent } from "@/components/features/meet/schedule/types";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

interface DailyEventCardProps {
  event: DailyEvent;
}

const DailyEventCard: FC<DailyEventCardProps> = ({ event }) => {
  const statusClasses = STATUS_CLASSES[event.status] || STATUS_CLASSES.primary;

  return (
    <div
      className={cn(
        "rounded-lg border-l-4 px-3 py-2.5",
        statusClasses.background,
        statusClasses.border,
      )}
    >
      <AppTypo className={cn("", statusClasses.text)}>{event.title}</AppTypo>
    </div>
  );
};

export default DailyEventCard;
