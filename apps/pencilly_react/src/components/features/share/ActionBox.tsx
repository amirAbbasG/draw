import React, { type FC } from "react";

import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

interface IProps {
  icon: string;
  title: string;
  subtitle: string;
  iconClassName?: string;
  rootClassName?: string;
}

const ActionBox: FC<PropsWithChildren<IProps>> = ({
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
        "rounded-lg border   p-5 space-y-4 hover:border-primary transition-colors",
        rootClassName,
      )}
    >
      <div className="flex items-center gap-3">
        <AppIcon
          icon={icon}
          className={cn(
            "h-10 w-10 rounded-lg bg-primary-light/10 centered-col text-primary p-2.5",
            iconClassName,
          )}
        />
        <div>
          <AppTypo variant="headingS" type="h3">
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

export default ActionBox;
