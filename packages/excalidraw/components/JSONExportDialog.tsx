"use client";

import React, { useState } from "react";

import { getFrame } from "@excalidraw/common";
import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import { Icon } from "@iconify/react";

import { actionSaveFileToDisk } from "../actions/actionExport";
import { trackEvent } from "../analytics";
import { t } from "../i18n";
import { Dialog } from "./Dialog";

import "./ExportDialog.scss";

import type { ActionManager } from "../actions/manager";
import type { BinaryFiles, ExportOpts, UIAppState } from "../types";

export type ExportCB = (
  elements: readonly NonDeletedExcalidrawElement[],
  scale?: number,
) => void;

interface ExportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  isLoading?: boolean;
}

const ExportCard = ({
  icon,
  title,
  description,
  onClick,
  variant = "primary",
  isLoading = false,
}: ExportCardProps) => {
  return (
    <div
      className={`ExportCard ExportCard--${variant}`}
      onClick={isLoading ? undefined : onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isLoading) onClick();
        }
      }}
    >
      <div className="ExportCard__header">
        <div className="ExportCard__icon">{icon}</div>
        <Icon icon="mdi:arrow-right" className="ExportCard__arrow" />
      </div>
      <h3 className="ExportCard__title">{title}</h3>
      <p className="ExportCard__description">{description}</p>
    </div>
  );
};

const OrDivider = () => (
  <div className="ExportDialog__divider">
    <span className="ExportDialog__divider-text">OR</span>
  </div>
);

const JSONExportModal = ({
  elements,
  appState,
  setAppState,
  files,
  actionManager,
  exportOpts,
  canvas,
  onCloseRequest,
}: {
  appState: UIAppState;
  setAppState: React.Component<any, UIAppState>["setState"];
  files: BinaryFiles;
  elements: readonly NonDeletedExcalidrawElement[];
  actionManager: ActionManager;
  onCloseRequest: () => void;
  exportOpts: ExportOpts;
  canvas: HTMLCanvasElement;
}) => {
  const { onExportToBackend } = exportOpts;
  const [isExporting, setIsExporting] = useState(false);

  const onClickExport = async () => {
    if (!onExportToBackend) return;
    setIsExporting(true);
    try {
      trackEvent("export", "link", `ui (${getFrame()})`);
      await onExportToBackend(elements, appState, files);
      onCloseRequest();
    } catch (error: any) {
      setAppState({ errorMessage: error.message });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="ExportDialog ExportDialog--json ExportDialog--redesigned">
      <div className="ExportDialog__cards">
        {exportOpts.saveFileToDisk && (
          <ExportCard
            icon={<Icon icon="hugeicons:download-01" className="size-4" />}
            title={t("exportDialog.disk_title")}
            description={t("exportDialog.disk_details")}
            variant="primary"
            onClick={() => {
              actionManager.executeAction(actionSaveFileToDisk, "ui");
            }}
          />
        )}

        {exportOpts.saveFileToDisk && onExportToBackend && <OrDivider />}

        {onExportToBackend && (
          <ExportCard
            icon={
              <Icon
                icon={
                  isExporting ? "eos-icons:bubble-loading" : "hugeicons:link-02"
                }
                className="size-4"
              />
            }
            title={t("exportDialog.link_title")}
            description={t("exportDialog.link_details")}
            variant="secondary"
            onClick={onClickExport}
          />
        )}

        {exportOpts.renderCustomUI &&
          exportOpts.renderCustomUI(elements, appState, files, canvas)}
      </div>
    </div>
  );
};

export const JSONExportDialog = ({
  elements,
  appState,
  files,
  actionManager,
  exportOpts,
  canvas,
  setAppState,
}: {
  elements: readonly NonDeletedExcalidrawElement[];
  appState: UIAppState;
  files: BinaryFiles;
  actionManager: ActionManager;
  exportOpts: ExportOpts;
  canvas: HTMLCanvasElement;
  setAppState: React.Component<any, UIAppState>["setState"];
}) => {
  const handleClose = React.useCallback(() => {
    setAppState({ openDialog: null });
  }, [setAppState]);

  return (
    <>
      {appState.openDialog?.name === "jsonExport" && (
        <Dialog
          onCloseRequest={handleClose}
          title={t("buttons.export")}
          size="small"
          className="export-dialog"
        >
          <JSONExportModal
            elements={elements}
            appState={appState}
            setAppState={setAppState}
            files={files}
            actionManager={actionManager}
            onCloseRequest={handleClose}
            exportOpts={exportOpts}
            canvas={canvas}
          />
        </Dialog>
      )}
    </>
  );
};
