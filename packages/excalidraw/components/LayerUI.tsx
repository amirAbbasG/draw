import React from "react";

import {
  arrayToMap,
  capitalizeString,
  CLASSES,
  DEFAULT_SIDEBAR,
  isShallowEqual,
  MQ_MIN_WIDTH_DESKTOP,
  TOOL_TYPE,
} from "@excalidraw/common";
import {
  mutateElement,
  ShapeCache,
  showSelectedShapeActions,
} from "@excalidraw/element";
import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import clsx from "clsx";

import { actionToggleStats } from "../actions";
import { trackEvent } from "../analytics";
import { isHandToolActive } from "../appState";
import { TunnelsContext, useInitializeTunnels } from "../context/tunnels";
import { UIAppStateContext } from "../context/ui-appState";
import { useAtom, useAtomValue } from "../editor-jotai";
import { t } from "../i18n";
import { calculateScrollCenter } from "../scene";
import {
  CompactShapeActions,
  SelectedShapeActions,
  ShapesSwitcher,
} from "./Actions";
import { ActiveConfirmDialog } from "./ActiveConfirmDialog";
import { useDevice } from "./App";
import { DefaultSidebar } from "./DefaultSidebar";
import ElementLinkDialog from "./ElementLinkDialog";
import { ErrorDialog } from "./ErrorDialog";
import { activeEyeDropperAtom, EyeDropper } from "./EyeDropper";
import { FixedSideContainer } from "./FixedSideContainer";
import Footer from "./footer/Footer";
import { HandButton } from "./HandButton";
import { HelpDialog } from "./HelpDialog";
import { HintViewer } from "./HintViewer";
import { LibraryIcon } from "./icons";
import { ImageExportDialog } from "./ImageExportDialog";
import { Island } from "./Island";
import { JSONExportDialog } from "./JSONExportDialog";
import { LaserPointerButton } from "./LaserPointerButton";
import { LoadingMessage } from "./LoadingMessage";
import { LockButton } from "./LockButton";
import MainMenu from "./main-menu/MainMenu";
import { MobileMenu } from "./MobileMenu";
import { OverwriteConfirmDialog } from "./OverwriteConfirm/OverwriteConfirm";
import { PasteChartDialog } from "./PasteChartDialog";
import { PenModeButton } from "./PenModeButton";
import { Section } from "./Section";
import { isSidebarDockedAtom } from "./Sidebar/Sidebar";
import Stack from "./Stack";
import { Stats } from "./Stats";
import { TTDDialog } from "./TTDDialog/TTDDialog";
import { UserList } from "./UserList";

import "./LayerUI.scss";
import "./Toolbar.scss";

import type { ActionManager } from "../actions/manager";
import type { Language } from "../i18n";
import type {
  AppClassProperties,
  AppProps,
  AppState,
  BinaryFiles,
  ExcalidrawProps,
  UIAppState,
} from "../types";

interface LayerUIProps {
  actionManager: ActionManager;
  appState: UIAppState;
  files: BinaryFiles;
  canvas: HTMLCanvasElement;
  setAppState: React.Component<any, AppState>["setState"];
  elements: readonly NonDeletedExcalidrawElement[];
  onLockToggle: () => void;
  onHandToolToggle: () => void;
  onPenModeToggle: AppClassProperties["togglePenMode"];
  showExitZenModeBtn: boolean;
  langCode: Language["code"];
  renderTopLeftUI?: ExcalidrawProps["renderTopLeftUI"];
  renderTopRightUI?: ExcalidrawProps["renderTopRightUI"];
  renderCustomStats?: ExcalidrawProps["renderCustomStats"];
  renderLayersMenu?: ExcalidrawProps["renderLayersMenu"];
  renderMobileAction?: ExcalidrawProps["renderMobileAction"];
  collapseFooter: ExcalidrawProps["collapseFooter"];
    collapseTop: ExcalidrawProps["collapseTop"];
  UIOptions: AppProps["UIOptions"];
  onExportImage: AppClassProperties["onExportImage"];
  renderWelcomeScreen: boolean;
  children?: React.ReactNode;
  app: AppClassProperties;
  isCollaborating: boolean;
  generateLinkForSelection?: AppProps["generateLinkForSelection"];
}

const DefaultMainMenu: React.FC<{
  UIOptions: AppProps["UIOptions"];
}> = ({ UIOptions }) => {
  return (
    <MainMenu __fallback>
      <MainMenu.DefaultItems.LoadScene />
      <MainMenu.DefaultItems.SaveToActiveFile />
      {UIOptions.canvasActions.export && <MainMenu.DefaultItems.Export />}
      {UIOptions.canvasActions.saveAsImage && (
        <MainMenu.DefaultItems.SaveAsImage />
      )}
      <MainMenu.DefaultItems.SearchMenu />
      <MainMenu.DefaultItems.Help />
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      <MainMenu.Group title="Excalidraw links">
        <MainMenu.DefaultItems.Socials />
      </MainMenu.Group>
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme />
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
};

const DefaultOverwriteConfirmDialog = () => {
  return (
    <OverwriteConfirmDialog __fallback>
      <OverwriteConfirmDialog.Actions.SaveToDisk />
      <OverwriteConfirmDialog.Actions.ExportToImage />
    </OverwriteConfirmDialog>
  );
};

const LayerUI = ({
  actionManager,
  appState,
  files,
  setAppState,
  elements,
  canvas,
  onLockToggle,
  onHandToolToggle,
  onPenModeToggle,
  showExitZenModeBtn,
                     collapseFooter,
                     collapseTop,
  renderTopLeftUI,
  renderTopRightUI,
  renderCustomStats,
  renderMobileAction,
  UIOptions,
  onExportImage,
  renderWelcomeScreen,
  children,
  app,
  isCollaborating,
  generateLinkForSelection,
  renderLayersMenu,
}: LayerUIProps) => {
  const device = useDevice();
  const tunnels = useInitializeTunnels();

  const spacing =
    appState.stylesPanelMode === "compact"
      ? {
          menuTopGap: 4,
          toolbarColGap: 4,
          toolbarRowGap: 1,
          toolbarInnerRowGap: 0.5,
          islandPadding: 0.5,
          collabMarginLeft: 8,
        }
      : {
          menuTopGap: 6,
          toolbarColGap: 4,
          toolbarRowGap: 1,
          toolbarInnerRowGap: 0.5,
          islandPadding: 0.5,
          collabMarginLeft: 8,
        };

  const TunnelsJotaiProvider = tunnels.tunnelsJotai.Provider;

  const [eyeDropperState, setEyeDropperState] = useAtom(activeEyeDropperAtom);

  const renderJSONExportDialog = () => {
    if (!UIOptions.canvasActions.export) {
      return null;
    }

    return (
      <JSONExportDialog
        elements={elements}
        appState={appState}
        files={files}
        actionManager={actionManager}
        exportOpts={UIOptions.canvasActions.export}
        canvas={canvas}
        setAppState={setAppState}
      />
    );
  };

  const renderImageExportDialog = () => {
    if (
      !UIOptions.canvasActions.saveAsImage ||
      appState.openDialog?.name !== "imageExport"
    ) {
      return null;
    }

    return (
      <ImageExportDialog
        elements={elements}
        appState={appState}
        files={files}
        actionManager={actionManager}
        onExportImage={onExportImage}
        onCloseRequest={() => setAppState({ openDialog: null })}
        name={app.getName()}
      />
    );
  };

  const renderCanvasActions = () => (
    <div style={{ position: "relative" }}>
      <tunnels.MainMenuTunnel.Out />
    </div>
  );

  const renderSelectedShapeActions = () => {
    const isCompactMode = appState.stylesPanelMode === "compact";

    return (
      <Section
        heading="selectedShapeActions"
        className={clsx("selected-shape-actions zen-mode-transition", {
          "transition-left": appState.zenModeEnabled,
        })}
      >
        {isCompactMode ? (
          <Island
            className={clsx("compact-shape-actions-island")}
            padding={0}
            style={{
              maxHeight: `${appState.height - 166}px`,
            }}
          >
            <CompactShapeActions
              appState={appState}
              elementsMap={app.scene.getNonDeletedElementsMap()}
              renderAction={actionManager.renderAction}
              app={app}
              setAppState={setAppState}
            />
          </Island>
        ) : (
          <Island
            className={CLASSES.SHAPE_ACTIONS_MENU}
            padding={2}
            style={{
              maxHeight: `${appState.height - 166}px`,
            }}
          >
            <SelectedShapeActions
              appState={appState}
              elementsMap={app.scene.getNonDeletedElementsMap()}
              renderAction={actionManager.renderAction}
              app={app}
            />
          </Island>
        )}
      </Section>
    );
  };

  const isSidebarDocked = useAtomValue(isSidebarDockedAtom);

  const shouldRenderSelectedShapeActions = showSelectedShapeActions(
    appState,
    elements,
  );

  const shouldShowStats =
    appState.stats.open &&
    !appState.zenModeEnabled &&
    !appState.viewModeEnabled &&
    appState.openDialog?.name !== "elementLinkSelector";

  const renderFixedSideContainer = () => {
    return (
      <>
        {!appState.viewModeEnabled &&
          appState.openDialog?.name !== "elementLinkSelector" && (
            <div
              className={clsx(
                "App-hint-viewer-container transition-all duration-500",
                appState.zenModeEnabled ? "opacity-0" : "opacity-100",
              )}
            >
              <HintViewer
                appState={appState}
                isMobile={device.editor.isMobile}
                device={device}
                app={app}
              />
            </div>
          )}
        <div className="App-menu-trigger-container" style={{ zIndex: 5 }}>
          {renderCanvasActions()}
          {renderWelcomeScreen && <tunnels.WelcomeScreenMenuHintTunnel.Out />}
        </div>
        <div className="App-left-toolbar-wrapper">
          <div className="App-left-toolbar-container">
            {!appState.viewModeEnabled &&
              appState.openDialog?.name !== "elementLinkSelector" && (
                <Section
                  heading="shapes"
                  className="shapes-section shapes-section--left"
                >
                  {(heading: React.ReactNode) => (
                    <div style={{ position: "relative" }}>
                      {renderWelcomeScreen && (
                        <tunnels.WelcomeScreenToolbarHintTunnel.Out />
                      )}
                      <Stack.Col gap={spacing.toolbarColGap} align="start">
                        <Stack.Col
                          gap={spacing.toolbarRowGap}
                          className={clsx(
                            "App-toolbar-container App-toolbar-container--left",
                            {
                              "zen-mode": appState.zenModeEnabled,
                            },
                          )}
                        >
                          <Island
                            padding={spacing.islandPadding}
                            className={clsx("App-toolbar App-toolbar--left", {
                              "zen-mode": appState.zenModeEnabled,
                              "App-toolbar--compact":
                                appState.stylesPanelMode !== "mobile" &&
                                appState.width < 1400,
                            })}
                          >
                            {heading}
                            <Stack.Col gap={spacing.toolbarInnerRowGap}>
                              <PenModeButton
                                zenModeEnabled={appState.zenModeEnabled}
                                checked={appState.penMode}
                                onChange={() => onPenModeToggle(null)}
                                title={t("toolBar.penMode")}
                                penDetected={appState.penDetected}
                              />
                              <LockButton
                                checked={appState.activeTool.locked}
                                onChange={onLockToggle}
                                title={t("toolBar.lock")}
                              />

                              <div className="App-toolbar__divider App-toolbar__divider--horizontal" />

                              <HandButton
                                checked={isHandToolActive(appState)}
                                onChange={() => onHandToolToggle()}
                                title={t("toolBar.hand")}
                                isMobile
                              />

                              <ShapesSwitcher
                                setAppState={setAppState}
                                activeTool={appState.activeTool}
                                UIOptions={UIOptions}
                                app={app}
                              />
                            </Stack.Col>
                          </Island>
                          {isCollaborating && (
                            <Island
                              style={{
                                marginTop: spacing.collabMarginLeft,
                                alignSelf: "center",
                                height: "fit-content",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                padding: "4px 2px",
                              }}
                            >
                              <LaserPointerButton
                                title={t("toolBar.laser")}
                                checked={
                                  appState.activeTool.type === TOOL_TYPE.laser
                                }
                                onChange={() =>
                                  app.setActiveTool({ type: TOOL_TYPE.laser })
                                }
                                isMobile
                              />
                            </Island>
                          )}
                        </Stack.Col>
                      </Stack.Col>
                    </div>
                  )}
                </Section>
              )}
          </div>

          <div
            className={clsx(
              "selected-shape-actions-container selected-shape-actions-container--left",
              {
                "selected-shape-actions-container--compact":
                  appState.stylesPanelMode === "compact",
              },
            )}
          >
            {shouldRenderSelectedShapeActions && renderSelectedShapeActions()}
          </div>
        </div>
        <FixedSideContainer side="top">
          <div className="App-menu App-menu_top App-menu_top--right-only">
            <div
              className={clsx(
                "layer-ui__wrapper__top-right zen-mode-transition",
                {
                  "transition-top": appState.zenModeEnabled || collapseTop,
                  "layer-ui__wrapper__top-right--compact":
                    appState.stylesPanelMode === "compact",
                },
              )}
            >
              {appState.collaborators.size > 0 && (
                <UserList
                  collaborators={appState.collaborators}
                  userToFollow={appState.userToFollow?.socketId || null}
                />
              )}
              {renderTopRightUI?.(device.editor.isMobile, appState)}
              {!appState.viewModeEnabled &&
                appState.openDialog?.name !== "elementLinkSelector" &&
                (!isSidebarDocked ||
                  appState.openSidebar?.name !== DEFAULT_SIDEBAR.name) && (
                  <tunnels.DefaultSidebarTriggerTunnel.Out />
                )}
              {shouldShowStats && (
                <Stats
                  app={app}
                  onClose={() => {
                    actionManager.executeAction(actionToggleStats);
                  }}
                  renderCustomStats={renderCustomStats}
                />
              )}
            </div>
          </div>
        </FixedSideContainer>
      </>
    );
  };

  const renderSidebars = () => {
    return (
      <DefaultSidebar
        __fallback
        renderLayersMenu={renderLayersMenu}
        onDock={docked => {
          trackEvent(
            "sidebar",
            `toggleDock (${docked ? "dock" : "undock"})`,
            `(${device.editor.isMobile ? "mobile" : "desktop"})`,
          );
        }}
      />
    );
  };

  const layerUIJSX = (
    <>
      {children}
      <DefaultMainMenu UIOptions={UIOptions} />
      <DefaultSidebar.Trigger
        __fallback
        icon={LibraryIcon}
        title={capitalizeString(t("toolBar.library"))}
        onToggle={open => {
          if (open) {
            trackEvent(
              "sidebar",
              `${DEFAULT_SIDEBAR.name} (open)`,
              `button (${device.editor.isMobile ? "mobile" : "desktop"})`,
            );
          }
        }}
        tab={DEFAULT_SIDEBAR.defaultTab}
      >
        {appState.stylesPanelMode === "full" &&
          appState.width >= MQ_MIN_WIDTH_DESKTOP &&
          t("toolBar.library")}
      </DefaultSidebar.Trigger>
      <DefaultOverwriteConfirmDialog />
      {appState.openDialog?.name === "ttd" && <TTDDialog __fallback />}

      {appState.isLoading && <LoadingMessage delay={250} />}
      {appState.errorMessage && (
        <ErrorDialog onClose={() => setAppState({ errorMessage: null })}>
          {appState.errorMessage}
        </ErrorDialog>
      )}
      {eyeDropperState && !device.editor.isMobile && (
        <EyeDropper
          colorPickerType={eyeDropperState.colorPickerType}
          onCancel={() => {
            setEyeDropperState(null);
          }}
          onChange={(colorPickerType, color, selectedElements, { altKey }) => {
            if (
              colorPickerType !== "elementBackground" &&
              colorPickerType !== "elementStroke"
            ) {
              return;
            }

            if (selectedElements.length) {
              for (const element of selectedElements) {
                mutateElement(element, arrayToMap(elements), {
                  [altKey && eyeDropperState.swapPreviewOnAlt
                    ? colorPickerType === "elementBackground"
                      ? "strokeColor"
                      : "backgroundColor"
                    : colorPickerType === "elementBackground"
                      ? "backgroundColor"
                      : "strokeColor"]: color,
                });
                ShapeCache.delete(element);
              }
              app.scene.triggerUpdate();
            } else if (colorPickerType === "elementBackground") {
              setAppState({
                currentItemBackgroundColor: color,
              });
            } else {
              setAppState({ currentItemStrokeColor: color });
            }
          }}
          onSelect={(color, event) => {
            setEyeDropperState(state => {
              return state?.keepOpenOnAlt && event.altKey ? state : null;
            });
            eyeDropperState?.onSelect?.(color, event);
          }}
        />
      )}
      {appState.openDialog?.name === "help" && (
        <HelpDialog
          onClose={() => {
            setAppState({ openDialog: null });
          }}
        />
      )}
      <ActiveConfirmDialog />
      {appState.openDialog?.name === "elementLinkSelector" && (
        <ElementLinkDialog
          sourceElementId={appState.openDialog.sourceElementId}
          onClose={() => {
            setAppState({
              openDialog: null,
            });
          }}
          scene={app.scene}
          appState={appState}
          generateLinkForSelection={generateLinkForSelection}
        />
      )}
      <tunnels.OverwriteConfirmDialogTunnel.Out />
      {renderImageExportDialog()}
      {renderJSONExportDialog()}
      {appState.pasteDialog.shown && (
        <PasteChartDialog
          setAppState={setAppState}
          appState={appState}
          onClose={() =>
            setAppState({
              pasteDialog: { shown: false, data: null },
            })
          }
        />
      )}
      {device.editor.isMobile && (
        <MobileMenu
          renderMobileAction={renderMobileAction}
          app={app}
          appState={appState}
          elements={elements}
          actionManager={actionManager}
          renderJSONExportDialog={renderJSONExportDialog}
          renderImageExportDialog={renderImageExportDialog}
          setAppState={setAppState}
          onHandToolToggle={onHandToolToggle}
          onPenModeToggle={onPenModeToggle}
          renderTopLeftUI={renderTopLeftUI}
          renderTopRightUI={renderTopRightUI}
          renderSidebars={renderSidebars}
          renderWelcomeScreen={renderWelcomeScreen}
          UIOptions={UIOptions}
        />
      )}
      {!device.editor.isMobile && (
        <>
          <div
            className="layer-ui__wrapper"
            style={
              appState.openSidebar &&
              isSidebarDocked &&
              device.editor.canFitSidebar
                ? { width: `calc(100% - var(--right-sidebar-width))` }
                : {}
            }
          >
            {renderWelcomeScreen && <tunnels.WelcomeScreenCenterTunnel.Out />}
            {renderFixedSideContainer()}
            <Footer
              appState={appState}
              actionManager={actionManager}
              showExitZenModeBtn={showExitZenModeBtn}
              renderWelcomeScreen={renderWelcomeScreen}
              collapseFooter={collapseFooter}
            />
            {appState.scrolledOutside && (
              <button
                type="button"
                className="scroll-back-to-content"
                onClick={() => {
                  setAppState(appState => ({
                    ...calculateScrollCenter(elements, appState),
                  }));
                }}
              >
                {t("buttons.scrollBackToContent")}
              </button>
            )}
          </div>
          {renderSidebars()}
        </>
      )}
    </>
  );

  return (
    <UIAppStateContext.Provider value={appState}>
      <TunnelsContext.Provider value={tunnels}>
        <TunnelsJotaiProvider>{layerUIJSX}</TunnelsJotaiProvider>
      </TunnelsContext.Provider>
    </UIAppStateContext.Provider>
  );
};

const areEqual = (prev: LayerUIProps, next: LayerUIProps) => {
  const getNecessaryObj = (appState: LayerUIProps["appState"]) => ({
    ...appState,
    collaborators: appState.collaborators,
  });
  const prevAppState = getNecessaryObj(prev.appState);
  const nextAppState = getNecessaryObj(next.appState);

  return (
    prev.renderTopRightUI === next.renderTopRightUI &&
    prev.renderCustomStats === next.renderCustomStats &&
    prev.renderWelcomeScreen === next.renderWelcomeScreen &&
    prev.langCode === next.langCode &&
    prev.elements === next.elements &&
    prev.files === next.files &&
    isShallowEqual(prevAppState, nextAppState)
  );
};

export default React.memo(LayerUI, areEqual);
