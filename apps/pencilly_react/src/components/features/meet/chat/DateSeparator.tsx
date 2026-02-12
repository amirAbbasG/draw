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
    <div className={cn("centered-row py-3", className)}>
      <span className="row rounded-full bg-gray-700/40 backdrop-blur-sm px-4 py-1.5">
        <AppTypo variant="xs" color="secondary" className="font-medium leading-normal text-white">
          {label}
        </AppTypo>
      </span>
    </div>
  );
};

export default DateSeparator;
