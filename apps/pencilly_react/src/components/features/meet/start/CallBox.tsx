import React, { FC } from "react";

import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

interface CallBoxProps {
  icon: string;
  title: string;
  subtitle: string;
  iconClassName?: string;
  rootClassName?: string;
}

export const CallBox: FC<PropsWithChildren<CallBoxProps>> = ({
  children,
  icon,
  iconClassName,
  rootClassName,
  subtitle,
  title,
}) => {
  return (
    <div
      className={cn(
        "rounded border p-3 col gap-3 hover:border-primary transition-colors",
        rootClassName,
      )}
    >
      <div className="row gap-3 mb-3">
        <AppIcon
          icon={icon}
          className={cn(
            "h-10 w-10 rounded-lg bg-primary-light/10 centered-col text-primary p-2.5",
            iconClassName,
          )}
        />
        <div className="col gap-0.5">
          <AppTypo variant="headingXS" type="h3">
            {title}
          </AppTypo>
          <AppTypo variant="small" color="secondary">
            {subtitle}
          </AppTypo>
        </div>
      </div>
      {children}
    </div>
  );
};
