import * as React from "react";

import DynamicButton from "@/components/shared/DynamicButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import { useTheme } from "@/stores/context/theme";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  isSub?: boolean;
}

const Trigger = ({ isSub }: IProps) => {
  const isDarkMode = useIsDarkMode();
  const t = useTranslations("header");

  if (isSub) {
    return (
      <DropdownMenuSubTrigger
        icon={isDarkMode ? sharedIcons.dark : sharedIcons.light}
      >
        {t("theme")}
      </DropdownMenuSubTrigger>
    );
  }

  return (
    <DropdownMenuTrigger asChild className="max-md:hidden">
      <DynamicButton
        hideLabel
        icon={isDarkMode ? sharedIcons.dark : sharedIcons.light}
        title={t("theme")}
      />
    </DropdownMenuTrigger>
  );
};

function ThemeSelect({ isSub = false }: IProps) {
  const { setTheme, theme } = useTheme();
  const t = useTranslations("header");

  const MenuContent = isSub ? DropdownMenuSubContent : DropdownMenuContent;
  const Menu = isSub ? DropdownMenuSub : DropdownMenu;

  return (
    <Menu>
      <Trigger isSub={isSub} />
      <MenuContent
        {...(isSub ? {} : { align: "end" })}
        className="max-md:hidden col gap-1 top-z"
        sideOffset={5}
      >
        {(["light", "dark", "system"] as const).map(mode => (
          <DropdownMenuItem
            key={mode}
            onClick={() => setTheme(mode)}
            icon={sharedIcons[mode]}
            selected={theme === mode}
          >
            {t(mode)}
          </DropdownMenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}

export default ThemeSelect;
