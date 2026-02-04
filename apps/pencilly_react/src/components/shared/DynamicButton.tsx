import React, { type FC } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { AppTooltip } from "@/components/ui/custom/app-tooltip";
import { cn } from "@/lib/utils";

interface IProps extends Omit<ButtonProps, "title"> {
  icon: string;
  title: string;
  hideLabel?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost";
  responsiveLabel?: boolean;
  labelClassName?: string;
}

const DynamicButton: FC<IProps> = ({
  icon,
  title,
  className,
  hideLabel,
  variant = "outline",
  responsiveLabel = true,
  children,
    labelClassName,
  ...otherProps
}) => {
  return (
    <AppTooltip title={title} contentClass={cn(!hideLabel && "sm:hidden")}>
      <Button
        element="div"
        variant={variant}
        className={cn(
          "row gap-1.5   select-none !h-8 !px-2",
          !hideLabel && " sm:px-2.5",
          className,
        )}
        {...otherProps}
        icon={icon}
        aria-label={title}
      >
        {!hideLabel && (
          <span className={cn(responsiveLabel && "max-md:hidden pe-0.5", labelClassName)}>
            {title}
          </span>
        )}
        {children}
      </Button>
    </AppTooltip>
  );
};

export default DynamicButton;
