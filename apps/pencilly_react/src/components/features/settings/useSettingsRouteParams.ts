import { useState } from "react";

import { SettingMenu } from "@/components/features/settings/types";
import { useCustomSearchParams } from "@/hooks/useCustomSearchParams";

const MENU_KEY = "menu";

export const useSettingsRouteParams = () => {
  const { currentValue, setSearchParams } = useCustomSearchParams(
    MENU_KEY,
    "account",
  );
  const [isOpen, setIsOpen] = useState(false);

  const paramMenu = (currentValue || "account") as SettingMenu;

  const changeMenu = (menu: SettingMenu) => {
    setSearchParams({ [MENU_KEY]: menu });
    setIsOpen(true);
  };

  return {
    currentMenu: paramMenu || "account",
    changeMenu,
    isOpen,
    onClose: () => setIsOpen(false),
  };
};
