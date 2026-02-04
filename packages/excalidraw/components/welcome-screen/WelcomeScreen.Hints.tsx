import { useTunnels } from "../../context/tunnels";
import { t } from "../../i18n";
import {
    WelcomeScreenHelpArrow,
    WelcomeScreenMenuArrow,
    WelcomeScreenTopToolbarArrow,
} from "../icons";

const MenuHint = ({ children }: { children?: React.ReactNode }) => {
    const { WelcomeScreenMenuHintTunnel } = useTunnels();
    return (
        <WelcomeScreenMenuHintTunnel.In>
            <div className="excalifont welcome-screen-hint welcome-screen-hint--menu">
                {WelcomeScreenMenuArrow}
                <div className="welcome-screen-hint__label">
                    {children || t("welcomeScreen.defaults.menuHint")}
                </div>
            </div>
        </WelcomeScreenMenuHintTunnel.In>
    );
};
MenuHint.displayName = "MenuHint";

const ToolbarHint = ({ children }: { children?: React.ReactNode }) => {
    const { WelcomeScreenToolbarHintTunnel } = useTunnels();
    return (
        <WelcomeScreenToolbarHintTunnel.In>
            <div className="excalifont welcome-screen-hint welcome-screen-hint--toolbar">
                {WelcomeScreenTopToolbarArrow}
                <div className="welcome-screen-hint__label">
                    {children || t("welcomeScreen.defaults.toolbarHint")}
                </div>
            </div>
        </WelcomeScreenToolbarHintTunnel.In>
    );
};
ToolbarHint.displayName = "ToolbarHint";

const HelpHint = ({ children }: { children?: React.ReactNode }) => {
    const { WelcomeScreenHelpHintTunnel } = useTunnels();
    return (
        <WelcomeScreenHelpHintTunnel.In>
            <div className="excalifont welcome-screen-hint welcome-screen-hint--help">
                <div className="welcome-screen-hint__label">
                    {children || t("welcomeScreen.defaults.helpHint")}
                </div>
                {WelcomeScreenHelpArrow}
            </div>
        </WelcomeScreenHelpHintTunnel.In>
    );
};
HelpHint.displayName = "HelpHint";

export { HelpHint, MenuHint, ToolbarHint };