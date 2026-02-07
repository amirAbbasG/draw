import React from "react";

import { WelcomeScreen } from "@excalidraw/excalidraw";

import RenderIf from "@/components/shared/RenderIf";
import AppIcon from "@/components/ui/custom/app-icon";
import { useCheckIsAuth } from "@/hooks/useCheckIsAuth";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import { cn } from "@/lib/utils";
import { setIsAuthPopupOpen } from "@/stores/zustand/ui/actions";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

const AppWelcomeScreen: React.FC<{
  onCollabDialogOpen?: () => any;
  isCollabEnabled?: boolean;
}> = React.memo(props => {
  const t = useTranslations("welcome_screen");
  const { isAuth } = useCheckIsAuth();
  const isDark = useIsDarkMode();

  return (
    <WelcomeScreen>
      {/*<WelcomeScreen.Hints.MenuHint>*/}
      {/*  {t("app.menuHint")}*/}
      {/*</WelcomeScreen.Hints.MenuHint>*/}
      {/*<WelcomeScreen.Hints.ToolbarHint />*/}
      {/*<WelcomeScreen.Hints.HelpHint />*/}
      <WelcomeScreen.Center>
        <WelcomeScreen.Center.Logo>
          <div className="flex items-center md:flex-col gap-1 md:gap-2">
            <img
              loading="lazy"
              src={`/images/logos/logo${isDark ? "-dark" : ""}.svg`}
              alt="Nemati AI"
              className="size-18 md:size-20"
            />
            <h1 className="text-3xl md:text-4xl pt-1 md:pt-0.5 font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent excalifont">
              Pencilly Us
            </h1>
          </div>
        </WelcomeScreen.Center.Logo>
        <WelcomeScreen.Center.Heading>
          <span className="block text-balance text-base">{t("app.center_heading")}</span>
        </WelcomeScreen.Center.Heading>
        <WelcomeScreen.Center.Menu
          className={cn(
            // "max-lg:!hidden",
            isAuth ? "!max-w-sm md:!max-w-lg" : "max-w-sm md:!max-w-[720px]",
          )}
        >
          <WelcomeScreen.Center.MenuItemLoadScene />
          <WelcomeScreen.Center.MenuItemHelp />
          <RenderIf isTrue={!isAuth}>
            <WelcomeScreen.Center.MenuItem
              onSelect={() => setIsAuthPopupOpen(true)}
              shortcut={null}
              icon={<AppIcon icon={sharedIcons.logout} className="h-full w-full p-[1px]" />}
              description="Access your saved drawings"
            >
              {t("defaults.login")}
            </WelcomeScreen.Center.MenuItem>
          </RenderIf>
        </WelcomeScreen.Center.Menu>
      </WelcomeScreen.Center>
    </WelcomeScreen>
  );
});

AppWelcomeScreen.displayName = "AppWelcomeScreen";

export default AppWelcomeScreen;
