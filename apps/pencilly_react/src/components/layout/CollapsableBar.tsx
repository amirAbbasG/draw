import React, {
  memo,
  useCallback,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";

import AppIconButton from "@/components/ui/custom/app-icon-button";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";

interface IProps {
  isCollapsable?: boolean;
  side?: "left" | "right" | "bottom" | "top";
  rootClassName?: string;
  contentClassName?: string;
}

type Props = PropsWithChildren<IProps>;

const containerPosition = (side: IProps["side"], isOpen: boolean) => {
  const map: Record<NonNullable<IProps["side"]>, string> = {
    top: isOpen ? "top-0" : "-top-14",
    bottom: isOpen ? "bottom-0" : "-bottom-14",
    left: isOpen ? "left-0" : "-left-14",
    right: isOpen ? "right-0" : "-right-14",
  };
  return map[side || "bottom"];
};

const buttonPosition = (side: IProps["side"], isOpen: boolean) => {
  const map: Record<NonNullable<IProps["side"]>, string> = {
    top: `left-1/2 -translate-x-1/2 translate-y-full ${isOpen ? "-bottom-2" : "-bottom-3"}`,
    bottom: `left-1/2 -translate-x-1/2 -translate-y-full ${isOpen ? "-top-2" : "-top-3"}`,
    right: `top-1/2 -translate-y-1/2 -translate-x-full ${isOpen ? "-left-2" : "-left-3"}`,
    left: `top-1/2 -translate-y-1/2 translate-x-full ${isOpen ? "-right-2" : "-right-3"}`,
  };
  return map[side || "bottom"];
};

const CollapsableBar: FC<Props> = ({
  children,
  isCollapsable = false,
  side = "bottom",
  rootClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen(v => !v), []);

  if (!isCollapsable) return <>{children}</>;

  const containerClass = cn(
    "relative z-10 transition-all duration-200",
    rootClassName,
    containerPosition(side, isOpen),
  );

  const iconBtnClass = cn("absolute", buttonPosition(side, isOpen));

  return (
    <div className={containerClass}>
      {children}
      <AppIconButton
        size="sm"
        icon={isOpen ? sharedIcons.chevron_up : sharedIcons.chevron_down}
        onClick={toggle}
        className={iconBtnClass}
        aria-expanded={isOpen}
        aria-label="Toggle panel"
      />
    </div>
  );
};

export default memo(CollapsableBar);
