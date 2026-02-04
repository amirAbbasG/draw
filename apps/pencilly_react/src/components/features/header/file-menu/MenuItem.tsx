import React, { ComponentProps } from "react";

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface MenuItemProps extends ComponentProps<typeof DropdownMenuItem> {
  icon: string;
  title: string;
  divider?: boolean;
  selected?: boolean;
}

export const MenuItem = ({
  icon,
  onClick,
  title,
  divider,
  selected,
  children,
}: PropsWithChildren<MenuItemProps>) => (
  <>
    <DropdownMenuItem
      selected={selected}
      onClick={onClick}
      className="cursor-pointer hover:bg-background "
      icon={icon}
    >
      {title}
      {children}
    </DropdownMenuItem>
    {divider && <DropdownMenuSeparator />}
  </>
);
