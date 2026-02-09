import React, { type FC } from "react";

import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

interface DateSeparatorProps {
  label: string;
  className?: string;
}

/**
 * A centered date label used between message groups to indicate time boundaries.
 */
const DateSeparator: FC<DateSeparatorProps> = ({ label, className }) => {
  return (
    <div className={cn("flex items-center justify-center py-3", className)}>
      <span className="rounded-full bg-foreground-lighter/20 px-4 py-1">
        <AppTypo variant="xs" color="secondary" className="font-medium">
          {label}
        </AppTypo>
      </span>
    </div>
  );
};

export default DateSeparator;
