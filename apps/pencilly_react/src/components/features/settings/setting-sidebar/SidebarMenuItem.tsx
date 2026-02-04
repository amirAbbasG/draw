import React, { memo, type FC } from "react";

import { useTranslations } from "@/i18n";

import {
  SettingMenu,
  SettingMenuItem,
} from "@/components/features/settings/types";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

interface IProps {
  item: SettingMenuItem;
  changeMenu: (menu: SettingMenu) => void;
  isActive: boolean;
}

const SidebarMenuItem: FC<IProps> = ({ item, changeMenu, isActive }) => {
  const t = useTranslations("settings.menu");
  return (
    <div
      onClick={() => changeMenu(item.key as SettingMenu)}
      className={cn(
        "row w-full sm:w-56 cursor-pointer gap-2 rounded p-2 ps-0 relative overflow-hidden",
        isActive ? "bg-primary-lighter !text-primary" : "text-foreground",
      )}
    >
      <div
        className={cn(
          " bg-primary w-2 h-4 rounded-sm transition-all duration-200 -ms-1",
          isActive ? "opacity-100" : "opacity-0",
        )}
      />
      <AppIcon icon={item.Icon} width={16} />
      <AppTypo
        variant="small"
        className={cn(
          "caret-transparent",
          isActive ? "!text-primary" : "text-foreground",
        )}
      >
        {t(item.key)}
      </AppTypo>
    </div>
  );
};

export default memo(SidebarMenuItem);
