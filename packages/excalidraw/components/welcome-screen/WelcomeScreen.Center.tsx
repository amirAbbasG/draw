import type { JSX } from "react";

import { actionLoadScene, actionShortcuts } from "../../actions";
import { getShortcutFromShortcutName } from "../../actions/shortcuts";
import { useTunnels } from "../../context/tunnels";
import { useUIAppState } from "../../context/ui-appState";
import { t, useI18n } from "../../i18n";
import { useDevice, useExcalidrawActionManager } from "../App";
import { ExcalidrawLogo } from "../ExcalidrawLogo";
import { HelpIcon, LoadIcon, usersIcon } from "../icons";

const WelcomeScreenMenuItemContent = ({
                                        icon,
                                        shortcut,
                                        children,
                                        description,
                                      }: {
  icon?: JSX.Element;
  shortcut?: string | null;
  children: React.ReactNode;
  description?: string;
}) => {
  const device = useDevice();
  return (
      <>
        <div className="welcome-screen-card__icon-wrapper">
          <div className="welcome-screen-card__icon">{icon}</div>
        </div>
        <div className="welcome-screen-card__content">
          <div className="welcome-screen-card__title">{children}</div>
          {description && (
              <div className="welcome-screen-card__description">{description}</div>
          )}
          {shortcut && !device.editor.isMobile && (
              <div className="welcome-screen-card__shortcut">{shortcut}</div>
          )}
        </div>
      </>
  );
};
WelcomeScreenMenuItemContent.displayName = "WelcomeScreenMenuItemContent";

const WelcomeScreenMenuItem = ({
                                 onSelect,
                                 children,
                                 icon,
                                 shortcut,
                                 description,
                                 className = "",
                                 ...props
                               }: {
  onSelect: () => void;
  children: React.ReactNode;
  icon?: JSX.Element;
  shortcut?: string | null;
  description?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
      <button
          {...props}
          type="button"
          className={`welcome-screen-card ${className}`}
          onClick={onSelect}
      >
        <WelcomeScreenMenuItemContent
            icon={icon}
            shortcut={shortcut}
            description={description}
        >
          {children}
        </WelcomeScreenMenuItemContent>
      </button>
  );
};
WelcomeScreenMenuItem.displayName = "WelcomeScreenMenuItem";

const WelcomeScreenMenuItemLink = ({
                                     children,
                                     href,
                                     icon,
                                     shortcut,
                                     description,
                                     className = "",
                                     ...props
                                   }: {
  children: React.ReactNode;
  href: string;
  icon?: JSX.Element;
  shortcut?: string | null;
  description?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
      <a
          {...props}
          className={`welcome-screen-card ${className}`}
          href={href}
          target="_blank"
          rel="noopener"
      >
        <WelcomeScreenMenuItemContent
            icon={icon}
            shortcut={shortcut}
            description={description}
        >
          {children}
        </WelcomeScreenMenuItemContent>
      </a>
  );
};
WelcomeScreenMenuItemLink.displayName = "WelcomeScreenMenuItemLink";

const Center = ({ children }: { children?: React.ReactNode }) => {
  const { WelcomeScreenCenterTunnel } = useTunnels();
  return (
      <WelcomeScreenCenterTunnel.In>
        <div className="welcome-screen-center">
          {children || (
              <>
                <div className="welcome-screen-hero">
                  <Logo />
                  <Heading>{t("welcomeScreen.defaults.center_heading")}</Heading>
                </div>
                <Menu>
                  <MenuItemLoadScene />
                  <MenuItemHelp />
                </Menu>
              </>
          )}
        </div>
      </WelcomeScreenCenterTunnel.In>
  );
};
Center.displayName = "Center";

const Logo = ({ children }: { children?: React.ReactNode }) => {
  return (
      <div className="welcome-screen-logo excalifont">
        {children || <ExcalidrawLogo withText />}
      </div>
  );
};
Logo.displayName = "Logo";

const Heading = ({ children }: { children: React.ReactNode }) => {
  return (
      <div className="welcome-screen-heading excalifont">{children}</div>
  );
};
Heading.displayName = "Heading";

const Menu = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
  return <div className={`welcome-screen-menu ${className}`}>{children}</div>;
};
Menu.displayName = "Menu";

const MenuItemHelp = () => {
  const actionManager = useExcalidrawActionManager();

  return (
      <WelcomeScreenMenuItem
          onSelect={() => actionManager.executeAction(actionShortcuts)}
          shortcut="?"
          icon={HelpIcon}
          description="View keyboard shortcuts and tips"
      >
        {t("helpDialog.title")}
      </WelcomeScreenMenuItem>
  );
};
MenuItemHelp.displayName = "MenuItemHelp";

const MenuItemLoadScene = () => {
  const appState = useUIAppState();
  const actionManager = useExcalidrawActionManager();

  if (appState.viewModeEnabled) {
    return null;
  }

  return (
      <WelcomeScreenMenuItem
          onSelect={() => actionManager.executeAction(actionLoadScene)}
          shortcut={getShortcutFromShortcutName("loadScene")}
          icon={LoadIcon}
          description="Open an existing drawing file"
      >
        {t("buttons.load")}
      </WelcomeScreenMenuItem>
  );
};
MenuItemLoadScene.displayName = "MenuItemLoadScene";

const MenuItemLiveCollaborationTrigger = ({
                                            onSelect,
                                          }: {
  onSelect: () => any;
}) => {
  const { t } = useI18n();
  return (
      <WelcomeScreenMenuItem
          shortcut={null}
          onSelect={onSelect}
          icon={usersIcon}
          description="Collaborate with others in real-time"
      >
        {t("labels.liveCollaboration")}
      </WelcomeScreenMenuItem>
  );
};
MenuItemLiveCollaborationTrigger.displayName =
    "MenuItemLiveCollaborationTrigger";

// -----------------------------------------------------------------------------

Center.Logo = Logo;
Center.Heading = Heading;
Center.Menu = Menu;
Center.MenuItem = WelcomeScreenMenuItem;
Center.MenuItemLink = WelcomeScreenMenuItemLink;
Center.MenuItemHelp = MenuItemHelp;
Center.MenuItemLoadScene = MenuItemLoadScene;
Center.MenuItemLiveCollaborationTrigger = MenuItemLiveCollaborationTrigger;

export { Center };