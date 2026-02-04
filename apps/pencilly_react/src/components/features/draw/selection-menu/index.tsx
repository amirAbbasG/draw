import React, { type FC } from "react";

import ImprovePopup from "@/components/features/draw/ai/ImprovePopup";
import {
  toImageConfig,
  useDrawToImage,
} from "@/components/features/draw/ai/useDrawToImage";
import { improveConfig } from "@/components/features/draw/ai/useImproveDraw";
import {
  to3dConfig,
  useMakeFromDraw3d,
} from "@/components/features/draw/ai/useMakeFromDraw3d";
import {
  useTrackSelection,
  type SelectionBounds,
} from "@/components/features/draw/selection-menu/useTrackSelection";
import { CreditConfirmationPopover } from "@/components/layout/CreditConfirm";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  drawAPI: DrawAPI;
  bounds: SelectionBounds;
}

const SelectionMenu: FC<IProps> = ({ drawAPI, bounds }) => {
  const t = useTranslations("draw_tools");
  const { isGenerating, generate } = useDrawToImage(drawAPI, true);
  const { isProcessing, make3d } = useMakeFromDraw3d(drawAPI, true);

  if (!drawAPI) return null;

  const handleDeleteSelections = () => {
    const appState = drawAPI.getAppState();
    const selectedElementIds = appState.selectedElementIds;
    const elements = drawAPI.getSceneElements();

    const newElements = elements.filter(
      element => !selectedElementIds[element.id],
    );

    drawAPI.updateScene({
      elements: newElements,
      appState: {
        ...appState,
        selectedElementIds: {},
      },
    });
  };

  const actions = [
    {
      key: "delete",
      icon: sharedIcons.delete,
      handleClick: handleDeleteSelections,
      isPending: false,
      storageKey: undefined,
    },
    {
      key: toImageConfig.key,
      icon: toImageConfig.icon,
      handleClick: generate,
      isPending: isGenerating,
      storageKey: "IMAGE",
    },
    {
      key: to3dConfig.key,
      icon: to3dConfig.icon,
      handleClick: make3d,
      isPending: isProcessing,
      storageKey: "TO3D",
    },
  ] as const;

  return (
    <div
      className="px-[3px] py-0.5 gap-0.5 border bg-popover rounded-lg shadow-md -translate-x-1/2 absolute  row  z-40"
      style={{
        left: `${bounds.x + bounds.width / 2}px`,
        top: `${bounds.y + bounds.height + 15}px`,
        display: !bounds || !bounds?.visible ? "none" : "flex",
      }}
      draggable={false}
    >
      {/*{bounds.itemId && <AddCommentPopup itemId={bounds.itemId} />}*/}

      {actions.map(item => {
        const Wrapper = item.storageKey
          ? CreditConfirmationPopover
          : React.Fragment;
        const props = (
          item.storageKey
            ? {
                onConfirm: item.handleClick,
                featureName: t(item.key),
                storageKey: item.storageKey,
              }
            : {}
        ) as React.ComponentProps<typeof CreditConfirmationPopover>;
        return (
          <Wrapper key={"state-menu-" + item.key} {...props}>
            <AppIconButton
              className={cn(item.isPending && "animate-pulse bg-muted-darker")}
              element="div"
              disabled={item.isPending}
              icon={item.icon}
              title={t(item.key)}
              onClick={item.storageKey ? undefined : item.handleClick}
            />
          </Wrapper>
        );
      })}
      <ImprovePopup
        drawAPI={drawAPI}
        useSelection
        renderTrigger={isPending => (
          <AppIconButton
            className={cn(isPending && "animate-pulse bg-muted-darker")}
            element="div"
            disabled={isPending}
            icon={improveConfig.icon}
            title={t(improveConfig.key)}
          />
        )}
      />
    </div>
  );
};

export { useTrackSelection, SelectionBounds };

export default SelectionMenu;
