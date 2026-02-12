import React, { type FC } from "react";



import { useShallow } from "zustand/react/shallow";



import AITriggers from "@/components/features/draw/ai/AITriggers";
import { ShareTrigger } from "@/components/features/share";
import DynamicButton from "@/components/shared/DynamicButton";
import RenderIf from "@/components/shared/RenderIf";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { AppTooltip } from "@/components/ui/custom/app-tooltip";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/zustand/ui/ui-store";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";





interface IProps {
  drawAPI: DrawAPI;
  isCollaborating: boolean;
  isOffline: boolean;
  isCollabViewMode: boolean;
  isExporting: boolean;
  isOwner: boolean;
  collabErrorMessage: string;
  sendKickMessage: (collaboratorId: string) => void;
  openShare: () => void;
  collapseTop: boolean;
  setCollapseTop: StateSetter<boolean>;
}

const TopTools: FC<IProps> = ({
  drawAPI,
  isExporting,
  openShare,
  collapseTop,
  setCollapseTop,
    isCollaborating,
    isOffline,
    isCollabViewMode,
    collabErrorMessage,
}) => {
  const t = useTranslations("draw_tools");
  const isFullScreen = useUiStore(useShallow(s => s.isFullScreenDraw));
  const tAlerts = useTranslations("collaboration.alerts");

  return (
    <>
      <div className="rounded  shadow-island bg-background-lighter dark:bg-[#232329] row  absolute left-1/2  -translate-x-1/2 p-0.5 gap-0.5 ">
        <RenderIf isTrue={!isCollabViewMode}>
          <AITriggers drawAPI={drawAPI} />

          <DynamicButton
            icon="hugeicons:workflow-square-06"
            title={t("mermaid")}
            variant="ghost"
            className="draw-btn"
            onClick={() =>
              drawAPI.updateScene({
                appState: {
                  openDialog: {
                    name: "ttd",
                    tab: "mermaid",
                  },
                },
              })
            }
          />

          <DynamicButton
            icon={sharedIcons.layers}
            title={t("layers")}
            variant="ghost"
            className="draw-btn"
            onClick={() =>
              drawAPI?.toggleSidebar({
                name: "layers",
              })
            }
          />
        </RenderIf>
        <ShareTrigger
          isCollaborating={isCollaborating}
          collabErrorMessage={collabErrorMessage}
          isExporting={isExporting}
          onClick={openShare}
        />
      </div>
      {/*<RenderIf isTrue={isCollaborating && isOffline}>*/}
      {/*  <CollaboratorsPopup*/}
      {/*    isCurrentOwner={isOwner}*/}
      {/*    sendKickCollaboratorMessage={sendKickMessage}*/}
      {/*  />*/}
      {/*</RenderIf>*/}

      <RenderIf isTrue={isCollaborating && isOffline}>
        <div className="h-10 centered-col">
          <AppTooltip title={tAlerts("collabOfflineWarning")} asChild={false}>
            <AppIcon
              icon={sharedIcons.offline}
              className="size-7  p-1 rounded-full bg-warning-lighter "
            />
          </AppTooltip>
        </div>
      </RenderIf>
      <RenderIf isTrue={isFullScreen}>
        <AppIconButton
          size="sm"
          icon={collapseTop ? sharedIcons.chevron_down : sharedIcons.chevron_up}
          onClick={() => setCollapseTop(!collapseTop)}
          className={cn(
            "!fixed ",
            "left-1/2 -translate-x-1/2 -translate-y-full",
            collapseTop ? "top-19" : "top-22",
          )}
        />
      </RenderIf>
    </>
  );
};

export default TopTools;
