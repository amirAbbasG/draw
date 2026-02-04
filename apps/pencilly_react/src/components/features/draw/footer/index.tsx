import React from "react";

import { Footer } from "@excalidraw/excalidraw";
import { useShallow } from "zustand/react/shallow";

import DesktopPagination from "@/components/features/draw/pagination/DesktopPagination";
import type { usePaginationActions } from "@/components/features/draw/pagination/usePaginationActions";
import DynamicButton from "@/components/shared/DynamicButton";
import RenderIf from "@/components/shared/RenderIf";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { cn } from "@/lib/utils";
import { toggleDrawFullScreen } from "@/stores/zustand/ui/actions";
import { useUiStore } from "@/stores/zustand/ui/ui-store";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  paginationAPI: ReturnType<typeof usePaginationActions>;
  hidePagination: boolean;
  collapseFooter: boolean;
  setCollapseFooter: StateSetter<boolean>;
}

const DrawFooter = React.memo(
  ({
    paginationAPI,
    hidePagination,
    collapseFooter,
    setCollapseFooter,
  }: IProps) => {
    const t = useTranslations("draw_footer");
    const isFullScreen = useUiStore(useShallow(s => s.isFullScreenDraw));
    return (
      <>
        <Footer>
          <RenderIf isTrue={!!isFullScreen}>
            <AppIconButton
              size="sm"
              icon={
                collapseFooter
                  ? sharedIcons.chevron_up
                  : sharedIcons.chevron_down
              }
              onClick={() => setCollapseFooter(!collapseFooter)}
              className={cn(
                "absolute ",
                "  left-1/2 -translate-x-1/2 -translate-y-full",
                collapseFooter ? "bottom-8" : "bottom-2",
              )}
            />
          </RenderIf>
          <RenderIf isTrue={!hidePagination}>
            <DesktopPagination paginationAPI={paginationAPI} />
          </RenderIf>
          <DynamicButton
            onClick={() => toggleDrawFullScreen()}
            icon={isFullScreen ? sharedIcons.shrink : sharedIcons.expand}
            title={isFullScreen ? t("exit_full_screen") : t("full_screen")}
            variant="secondary"
            className=" aspect-square ms-auto !h-8 4xl:!h-9"
            hideLabel
          />
        </Footer>
      </>
    );
  },
);

export default DrawFooter;
