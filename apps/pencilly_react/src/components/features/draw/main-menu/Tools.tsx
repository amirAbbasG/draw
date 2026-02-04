import React, { useEffect, useRef, useState, type FC } from "react";

import { MainMenu } from "@excalidraw/excalidraw";
import { useShallow } from "zustand/react/shallow";

import AppIcon from "@/components/ui/custom/app-icon";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { toggleHideComments } from "@/stores/zustand/ui/actions";
import { useUiStore } from "@/stores/zustand/ui/ui-store";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

const CLOSE_DELAY = 120;


interface IProps {
  drawAPI?: DrawAPI;
}

const items = [
  {
    key: "gridModeEnabled",
    titleKey: "show_grid",
    icon: "hugeicons:grid-table",
  },
  {
    key: "viewModeEnabled",
    titleKey: "view_mode",
    icon: "hugeicons:eye",
  },
  {
    key: "zenModeEnabled",
    titleKey: "zen_mode",
    icon: "hugeicons:full-screen",
  },
  {
    key: "objectsSnapModeEnabled",
    titleKey: "snap_to_objects",
    icon: "fluent-mdl2:snap-to-grid",
  },
] as const;

const Tools: FC<IProps> = ({ drawAPI }) => {
  const t = useTranslations("main_menu");
  const [isOpen, setIsOpen] = useState(false);
  const [toolsState, setToolsState] = useState({
    gridModeEnabled: drawAPI?.getAppState().gridModeEnabled,
    viewModeEnabled: drawAPI?.getAppState().viewModeEnabled,
    zenModeEnabled: drawAPI?.getAppState().zenModeEnabled,
    objectsSnapModeEnabled: drawAPI?.getAppState().objectsSnapModeEnabled,
  });
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const hideComments = useUiStore(useShallow((state) => state.hideComments));

  const onChange = (key: (typeof items)[number]["key"]) => {
    if (!drawAPI) return;
    const val = !drawAPI.getAppState()[key];
    drawAPI.updateScene({
      // @ts-ignore
      appState: { [key]: val },
    });
    setToolsState((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  useEffect(() => {
    if (!drawAPI) return;
    const appState = drawAPI.getAppState();
    setToolsState({
      gridModeEnabled: appState.gridModeEnabled,
      viewModeEnabled: appState.viewModeEnabled,
      zenModeEnabled: appState.zenModeEnabled,
      objectsSnapModeEnabled: appState.objectsSnapModeEnabled,
    });
  }, [drawAPI]);

  const scheduleClose = (delay = CLOSE_DELAY) => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, delay) as unknown as number;
  };

  const cancelClose = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const isInsideHoverCard = (node: EventTarget | null) => {
    if (!(node instanceof Node)) return false;
    return (
        triggerRef.current?.contains(node as Node) ||
        contentRef.current?.contains(node as Node)
    );
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    cancelClose();
    setIsOpen(true);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const related = (e.nativeEvent as PointerEvent).relatedTarget;
    if (isInsideHoverCard(related)) return;
    scheduleClose(CLOSE_DELAY);
  };

  return (
      <HoverCard
          openDelay={50}
          open={isOpen}
          onOpenChange={(val) => {
            if (val) setIsOpen(true);
          }}
      >
        <HoverCardTrigger asChild>
          <div
              ref={triggerRef}
              onPointerEnter={handlePointerEnter}
              onPointerLeave={handlePointerLeave}
          >
            <MainMenu.ItemCustom className="dropdown-menu-item dropdown-menu-item-base !mt-0 relative">
              <AppIcon icon={sharedIcons.settings} className="size-4" />
              {t("settings")}
              <AppIcon
                  icon="ic:round-chevron-right"
                  className="size-4 absolute end-2 top-1/2 -translate-y-1/2"
              />
            </MainMenu.ItemCustom>
          </div>
        </HoverCardTrigger>

        <HoverCardContent
            ref={contentRef as any}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            side="right"
            className="w-44 p-1 !shadow-sm border border-background col gap-1"
            sideOffset={12}
            portal={false}
        >
          {items.map(({ key, titleKey, icon }) => (
              <MainMenu.Item
                  key={key}
                  onClick={() => onChange(key)}
                  selected={toolsState[key]}
                  icon={<AppIcon icon={icon} className="size-4" />}
              >
                {t(titleKey)}
              </MainMenu.Item>
          ))}
          <MainMenu.Item
              onClick={() => toggleHideComments()}
              selected={hideComments}
              icon={<AppIcon icon={sharedIcons.hide_comments} className="size-4" />}
          >
            {t("hide_comments")}
          </MainMenu.Item>
        </HoverCardContent>
      </HoverCard>
  );
};

export default Tools;