import React, { useCallback, useState, type FC } from "react";

import { Excalidraw } from "@excalidraw/excalidraw";
import { AppProps, BinaryFiles } from "@excalidraw/excalidraw/types";
import { useDebounceCallback } from "usehooks-ts";
import { useShallow } from "zustand/react/shallow";

import TextToDiagram from "@/components/features/draw/ai/TextToDiagram";
import DrawFooter from "@/components/features/draw/footer";
import LayersContent from "@/components/features/draw/layers/LayersContent";
import {
  loadActivePageId,
  savePageData,
  setLocalstorageLibraryData,
} from "@/components/features/draw/local-storage";
import AppMainMenu from "@/components/features/draw/main-menu";
import MobilePagination from "@/components/features/draw/pagination/MobilePagination";
import { usePaginationActions } from "@/components/features/draw/pagination/usePaginationActions";
import SelectionMenu, {
  useTrackSelection,
} from "@/components/features/draw/selection-menu";
import TopTools from "@/components/features/draw/TopTools";
import { useExportLink } from "@/components/features/draw/useExportLink";
import { useLoadData } from "@/components/features/draw/useLoadData";
import { useSetData } from "@/components/features/draw/useSetData";
import AppWelcomeScreen from "@/components/features/draw/welcome-screen";
import Share from "@/components/features/share";
import RenderIf from "@/components/shared/RenderIf";
import { setIsLibraryOpen } from "@/stores/zustand/ui/actions";
import { useUiStore } from "@/stores/zustand/ui/ui-store";

interface IProps {
  onChange: AppProps["onChange"];
  excalidrawAPI: AppProps["excalidrawAPI"];
  onPointerUpdate: AppProps["onPointerUpdate"];
  theme: "dark" | "light";
  langCode: string;
  drawAPI: DrawAPI;
  onOpenLibraryRepo?: () => void;
  collabAPI: CollabAPI;
  isOpenShare: boolean;
  setIsOpenShare: (isOpen: boolean) => void;
}

const DrawWrapper: FC<PropsWithChildren<IProps>> = ({
  children,
  excalidrawAPI,
  langCode,
  onChange,
  onPointerUpdate,
  theme,
  drawAPI,
  collabAPI,
  isOpenShare,
  setIsOpenShare,
}) => {
  const { selectionBounds, handleChange, elements } = useTrackSelection();
  const [collapseFooter, setCollapseFooter] = useState(true);
  const [collapseTop, setCollapseTop] = useState(true);
  const isFullScreen = useUiStore(useShallow(s => s.isFullScreenDraw));

  const {
    startCollaboration,
    sendKickMessage,
    isCollaborating,
    isCollabViewMode,
    collabErrorMessage,
    isOffline,
    isOwner,
    shouldJoinFromParam,
    paramRoom,
    setUsername,
    username,
  } = collabAPI;

  const paginationAPI = usePaginationActions({
    drawAPI,
  });

  const { setData } = useSetData(drawAPI, paginationAPI);

  const { exportLink, isExporting, setShareLink, shareLink } = useExportLink(
    drawAPI,
    setData,
  );

  const { initialStatePromiseRef } = useLoadData(
    drawAPI,
    handleChange,
    setData,
  );

  // Save to pagination storage instead of main localStorage
  const localSaveWithPagination = useCallback(
    (elements: DrawElements, appState: DrawAppState, files: BinaryFiles) => {
      const activePageId = loadActivePageId();
      if (activePageId) {
        // Save to pagination storage (this also merges to main storage)
        savePageData(activePageId, elements, appState, files);
      }
    },
    [],
  );

  const localSave = useDebounceCallback(localSaveWithPagination, 200);

  const onChangeCallback = useCallback(
    (elements: DrawElements, appState: DrawAppState, files: BinaryFiles) => {
      handleChange(elements, appState);
      onChange(elements, appState, files);

      // Only save locally if not collaborating
      if (!isCollaborating) {
        localSave(elements, appState, files);
      }
    },
    [handleChange, onChange, isCollaborating, localSave],
  );

  const closeShare = () => {
    setIsOpenShare(false);
    setShareLink("");
  };

  const hidePagination = isCollaborating && !isOwner;

  return (
    <>
      <Excalidraw
        onLibraryChange={setLocalstorageLibraryData}
        viewModeEnabled={isCollabViewMode}
        isCollaborating={isCollaborating}
        initialData={initialStatePromiseRef.current.promise}
        onChange={onChangeCallback}
        excalidrawAPI={excalidrawAPI}
        collapseFooter={isFullScreen && collapseFooter}
        collapseTop={isFullScreen && collapseTop}
        handleKeyboardGlobally
        autoFocus
        renderMobileAction={() => (
          <>
            <RenderIf isTrue={!hidePagination}>
              <MobilePagination paginationAPI={paginationAPI} />
            </RenderIf>
          </>
        )}
        onPointerUpdate={onPointerUpdate}
        renderLayersMenu={() => (
          <LayersContent drawAPI={drawAPI} elements={elements} />
        )}
        onOpenLibraryRepo={() => setIsLibraryOpen(true)}
        UIOptions={{
          canvasActions: {
            toggleTheme: true,
            export: {
              onExportToBackend: exportLink,
            },
          },
          tools: {
            image: true,
          },
        }}
        theme={theme}
        langCode={langCode}
        renderTopRightUI={() => (
          <TopTools
            drawAPI={drawAPI}
            isExporting={isExporting}
            openShare={() => setIsOpenShare(true)}
            collapseTop={collapseTop}
            setCollapseTop={setCollapseTop}
            isCollaborating={isCollaborating}
            isCollabViewMode={isCollabViewMode}
            collabErrorMessage={collabErrorMessage}
            isOwner={isOwner}
            isOffline={isOffline}
            sendKickMessage={sendKickMessage}
          />
        )}
      >
        <TextToDiagram drawAPI={drawAPI} />
        <AppMainMenu
          drawAPI={drawAPI}
          elements={elements}
          disableTools={isCollabViewMode}
        />
        <DrawFooter
          paginationAPI={paginationAPI}
          hidePagination={hidePagination}
          collapseFooter={collapseFooter}
          setCollapseFooter={setCollapseFooter}
        />
        <AppWelcomeScreen />
        {children}
      </Excalidraw>
      <SelectionMenu drawAPI={drawAPI} bounds={selectionBounds} />
      <Share
        sendKickCollaboratorMessage={sendKickMessage}
        isCurrentOwner={isOwner}
        clearLink={() => setShareLink("")}
        onExportToBackend={exportLink}
        onClose={closeShare}
        isOpen={isOpenShare}
        link={shareLink}
        isPendingExport={isOpenShare && isExporting}
        isCollaborating={isCollaborating}
        startCollaboration={startCollaboration}
        username={username}
        setUsername={setUsername}
        paramRoom={paramRoom}
        shouldJoinFromParam={shouldJoinFromParam}
      />
    </>
  );
};

export default DrawWrapper;
