import React from "react";

import {
  itemParent,
  menuComponents,
} from "@/components/features/settings/constants";
import SettingSidebar from "@/components/features/settings/setting-sidebar";
import { useSettingsRouteParams } from "@/components/features/settings/useSettingsRouteParams";
import PageHeader from "@/components/layout/PageHeader";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

const Settings = () => {
  const { currentMenu, changeMenu, isOpen, onClose } = useSettingsRouteParams();
  const t = useTranslations("settings");

  const MainComponent = menuComponents[currentMenu];

  return (
    <div className="h-dvh col  w-screen max-h-dvh bg-background-lighter">
      <PageHeader title={t("title")} className="bg-background-lighter" />

      <div className="size-full overflow-hidden p-2 sm:p-4 gap-4 flex flex-col sm:flex-row">
        <SettingSidebar
          currentMenu={currentMenu}
          changeMenu={changeMenu}
          isOpen={isOpen}
        />
        <div
          className={cn(
            "size-full border col overflow-y-auto rounded p-4 pt-0 gap-4  transition-all duration-300",
            isOpen
              ? "flex max-h-[calc(100vh-4.5rem)]"
              : "hidden sm:flex max-h-0 sm:max-h-none",
          )}
        >
          <div className="w-full row gap-2 py-2 sm:py-3  border-b   z-20">
            {currentMenu in itemParent && (
              <AppIconButton
                icon={sharedIcons.arrow_left}
                onClick={() => {
                  changeMenu(itemParent[currentMenu]);
                }}
                size="xs"
              />
            )}
            <AppTypo
              variantMobileSize="headingS"
              variant="headingM"
              type="h2"
              className="me-auto"
            >
              {t(`menu.${currentMenu}`)}
            </AppTypo>
            {!(currentMenu in itemParent) && (
              <AppIconButton
                icon={sharedIcons.close}
                className="sm:hidden"
                onClick={onClose}
                size="xs"
              />
            )}
          </div>
          <MainComponent changeMenu={changeMenu} />
        </div>
      </div>
    </div>
  );
};

export default Settings;
