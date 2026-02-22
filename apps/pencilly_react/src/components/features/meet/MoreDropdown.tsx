import React, { useState, type FC } from "react";

import AppIconButton from "@/components/ui/custom/app-icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface MoreMenuIem {
  icon: string;
  label: string;
  onClick: () => void;
  className?: string;
  preventCloseOnClick?: boolean;
  disabled?: boolean;
}

interface IProps {
  items: MoreMenuIem[];
  open?: boolean;
  setOpen?: (open: boolean) => void;
  contentClassName?: string;
  triggerProps?: Omit<
    React.ComponentProps<typeof AppIconButton>,
    "title" | "icon" | "element"
  >;
}

const MoreDropdown: FC<IProps> = ({
  items,
  open,
  setOpen,
  contentClassName,
  triggerProps,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const isOpen = open ?? moreOpen;
  const setIsOpen = setOpen ?? setMoreOpen;

  const { className, size, variant, ...otherProps } = triggerProps || {};

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <AppIconButton
          icon="hugeicons:more-vertical"
          size={size ?? "xs"}
          variant={variant}
          element="div"
          className={cn("shrink-0", className)}
          {...otherProps}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn("w-32 z-100", contentClassName)}
        onClick={e => e.stopPropagation()}
      >
        {items.map((item, index) => (
          <DropdownMenuItem
              disabled={item.disabled}
            key={index}
            icon={item.icon}
            className={cn(item.className)}
            onClick={e => {
              e.stopPropagation();
              if (!item.preventCloseOnClick) {
                setIsOpen(false);
              }
              item.onClick();
            }}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MoreDropdown;
