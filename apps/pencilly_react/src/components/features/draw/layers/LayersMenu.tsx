import React, { type FC } from "react";

import { MoveDirection } from "@/components/features/draw/layers/types";
import RenderIf from "@/components/shared/RenderIf";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

const layerItems = [
  {
    key: "backward",
    icon: sharedIcons.layer_down,
  },
  {
    key: "back",
    icon: sharedIcons.layer_bottom,
  },
  {
    key: "forward",
    icon: sharedIcons.layer_up,
  },
  {
    key: "front",
    icon: sharedIcons.layer_top,
  },
] as const;

interface IProps {
  isLocked: boolean;
  isHidden: boolean;
  setProperty: (key: string, value: any) => void;
  move: (dir: MoveDirection) => void;
  onUngroupElements?: () => void;
  onDelete: () => void;
}

const LayersMenu: FC<IProps> = ({
  isHidden,
  isLocked,
  setProperty,
  move,
  onDelete,
  onUngroupElements,
}) => {
  const t = useTranslations("layers");

  const isGroup = !!onUngroupElements;

  return (
    <>
      <AppIconButton
        title={
          isLocked
            ? t(isGroup ? "unlock_all" : "unlock")
            : t(isGroup ? "lock_all" : "unlock")
        }
        icon={isLocked ? sharedIcons.lock : sharedIcons.unlock}
        size="xs"
        onClick={e => {
          e.stopPropagation();
          setProperty("locked", !isLocked);
        }}
      />
      <AppIconButton
        title={
          isHidden
            ? t(isGroup ? "show_all" : "show")
            : t(isGroup ? "hide_all" : "hide")
        }
        icon={isHidden ? sharedIcons.visible : sharedIcons.hidden}
        size="xs"
        onClick={e => {
          e.stopPropagation();
          setProperty("isDeleted", !isHidden);
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger
          className="z-10 cursor-pointer"
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <AppIcon icon={sharedIcons.more} className="size-3.5 " />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 top-z" portal={false}>
          {layerItems.map(({ key, icon }) => (
            <DropdownMenuItem key={key} onClick={() => move(key)} icon={icon}>
              {t(key)}
            </DropdownMenuItem>
          ))}
          <RenderIf isTrue={!!onUngroupElements}>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onUngroupElements}
              icon="hugeicons:ungroup-items"
            >
              {t("ungroup")}
            </DropdownMenuItem>
          </RenderIf>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onDelete}
            className="text-danger focus:text-danger"
            icon={sharedIcons.delete}
          >
            {t(isGroup ? "delete_group" : "delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default LayersMenu;
