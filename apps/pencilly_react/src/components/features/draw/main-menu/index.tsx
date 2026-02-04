import React from "react";

import { ExcalidrawElement } from "@excalidraw/element/types";
import { MainMenu } from "@excalidraw/excalidraw";

import Layers from "@/components/features/draw/layers";
import Tools from "@/components/features/draw/main-menu/Tools";
import RenderIf from "@/components/shared/RenderIf";

// import VersionHistory from "@/components/features/draw/main-menu/version-history";

interface IProps {
  onCollabDialogOpen?: () => any;
  isCollaborating?: boolean;
  isCollabEnabled?: boolean;
  disableTools?: boolean;
  refresh?: () => void;
  drawAPI: DrawAPI;
  elements: readonly ExcalidrawElement[];
}

const AppMainMenu: React.FC<IProps> = React.memo(
  ({
    drawAPI,
    isCollabEnabled,
    isCollaborating,
    onCollabDialogOpen,
    elements,
    disableTools,
  }) => {
    return (
      <>
        <Layers drawAPI={drawAPI} elements={elements} />
        {/*<VersionHistory drawAPI={drawAPI} />*/}
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.SaveToActiveFile />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />

          <Layers.Trigger drawAPI={drawAPI} />
          {/*<VersionHistory.Trigger drawAPI={drawAPI} />*/}
          <RenderIf isTrue={!disableTools}>
            <Tools drawAPI={drawAPI} />
          </RenderIf>
          <MainMenu.Separator />
          {isCollabEnabled && (
            <MainMenu.DefaultItems.LiveCollaborationTrigger
              isCollaborating={!isCollaborating}
              onSelect={() => onCollabDialogOpen?.()}
            />
          )}
          {/*<MainMenu.DefaultItems.CommandPalette className="highlighted" />*/}
          <MainMenu.DefaultItems.SearchMenu />
          <MainMenu.DefaultItems.Help />

          <MainMenu.Separator />

          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
      </>
    );
  },
);

export default AppMainMenu;
