import clsx from "clsx";

import { actionShortcuts } from "../../actions";
import type { ActionManager } from "../../actions/manager";
import { useTunnels } from "../../context/tunnels";
import type { UIAppState } from "../../types";
import { ExitZenModeAction, UndoRedoActions, ZoomActions } from "../Actions";
import { HelpButton } from "../HelpButton";
import { Section } from "../Section";
import Stack from "../Stack";

const Footer = ({
  appState,
  actionManager,
  showExitZenModeBtn,
  renderWelcomeScreen,
    collapseFooter
}: {
  appState: UIAppState;
  actionManager: ActionManager;
  showExitZenModeBtn: boolean;
  renderWelcomeScreen: boolean;
  collapseFooter?: boolean
}) => {
  const { FooterCenterTunnel, WelcomeScreenHelpHintTunnel } = useTunnels();

  return (
      <footer
          role="contentinfo"
          // className="layer-ui__wrapper__footer App-menu App-menu_bottom"
          className={clsx("layer-ui__wrapper__footer App-menu App-menu_bottom zen-mode-transition", {
            "wrapper__footer--transition-bottom": collapseFooter,
          })}
      >
        {/*<div*/}
        {/*    className={clsx("layer-ui__wrapper__footer-right zen-mode-transition", {*/}
        {/*      "transition-right": appState.zenModeEnabled,*/}
        {/*    })}*/}
        {/*>*/}
        {/*  <div style={{position: "relative"}}>*/}
        {/*    {renderWelcomeScreen && <WelcomeScreenHelpHintTunnel.Out/>}*/}
        {/*    <HelpButton*/}
        {/*        onClick={() => actionManager.executeAction(actionShortcuts)}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*</div>*/}

        <FooterCenterTunnel.Out/>

        <div
            className={clsx("layer-ui__wrapper__footer-left zen-mode-transition", {
              "layer-ui__wrapper__footer-left--transition-bottom":
              appState.zenModeEnabled,
            })}
        >
          <Stack.Row gap={2}>
            <Section heading="canvasActions">
              <ZoomActions
                  renderAction={actionManager.renderAction}
                  zoom={appState.zoom}
              />

              {!appState.viewModeEnabled && (
                  <UndoRedoActions
                      renderAction={actionManager.renderAction}
                      className={clsx("zen-mode-transition", {
                        "layer-ui__wrapper__footer-left--transition-bottom":
                        appState.zenModeEnabled,
                      })}
                  />
              )}
            </Section>
            <div style={{position: "relative"}}>
              {renderWelcomeScreen && <WelcomeScreenHelpHintTunnel.Out/>}
              <HelpButton
                  onClick={() => actionManager.executeAction(actionShortcuts)}
              />
            </div>
          </Stack.Row>
        </div>

        <ExitZenModeAction
            actionManager={actionManager}
            showExitZenModeBtn={showExitZenModeBtn}
        />
      </footer>
  );
};

export default Footer;
Footer.displayName = "Footer";
