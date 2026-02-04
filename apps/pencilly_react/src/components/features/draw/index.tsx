import React, {useCallback, useState} from "react";

import { useIsDarkMode } from "@/hooks/useIsDarkMode";

import "@excalidraw/excalidraw/index.css";

import DrawWrapper from "@/components/features/draw/DrawWrapper";
import ErrorDialog from "@/components/features/draw/error";
import Library from "@/components/features/draw/library";
import { useLocale } from "@/i18n";

import "./draw.css";

import { JoinRequestPopup } from "@/components/features/share/request/JoinRequestPopup";
import { PendingApprovalOverlay } from "@/components/features/share/request/PendingApprovalOverlay";
import { useCollaboration } from "@/hooks/collaboration/useCollaboration";

interface IProps {
  drawAPI: DrawAPI;
  setDrawAPI: StateSetter<DrawAPI>;
}

const Draw = ({ drawAPI, setDrawAPI }: PropsWithChildren<IProps>) => {
  const isDark = useIsDarkMode();
  const locale = useLocale();
    const [isOpenShare, setIsOpenShare] = useState(false);

  const collabAPI = useCollaboration({ drawAPI,  setIsOpenShare });

  // stable callback for excalidrawAPI to avoid re-creating the function each render
  const handleExcalidrawAPI = useCallback(
    (api: any) => setDrawAPI(api),
    [setDrawAPI],
  );

  const {
    syncCollaboration,
    onPointerUpdate,
    errorMessage,
    collabErrorMessage,
    handleReconnect,
    clearErrors,
    pendingJoinRequests,
    isPendingApproval,
    cancelPendingApproval,
    approveJoinRequest,
    denyJoinRequest,
  } = collabAPI;

  return (
    <>
      <DrawWrapper
        collabAPI={collabAPI}
        drawAPI={drawAPI}
          isOpenShare={isOpenShare}
            setIsOpenShare={setIsOpenShare}
        excalidrawAPI={handleExcalidrawAPI}
        onChange={(elements, appState, files) => {
          syncCollaboration(elements, appState, files);
        }}
        onPointerUpdate={onPointerUpdate}
        theme={isDark ? "dark" : "light"}
        langCode={locale.startsWith("en") ? "en" : locale}
      >
        <ErrorDialog
          error={errorMessage}
          onClose={clearErrors}
          handleReconnect={collabErrorMessage ? handleReconnect : undefined}
        />
      </DrawWrapper>
      <Library drawAPI={drawAPI} />
      <PendingApprovalOverlay
        isVisible={isPendingApproval}
        onCancel={cancelPendingApproval}
      />
      <JoinRequestPopup
        requests={pendingJoinRequests}
        onApprove={approveJoinRequest}
        onDeny={denyJoinRequest}
      />


      {/*<CommentMarkers elements={elements} drawAPI={drawAPI} />*/}
    </>
  );
};

export default Draw;
