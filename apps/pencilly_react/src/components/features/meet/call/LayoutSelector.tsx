import React, { useState, type FC } from "react";

import PopupHeader from "@/components/shared/PopupHeader";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { GridLayout, GridSettings } from "./types";

interface LayoutSelectorProps {
  settings: GridSettings;
  onChange: (settings: GridSettings) => void;
  className?: string;
}

const layouts = [
  {
    key: "auto",
    defaultMaxTiles: 9,
    icon: "lucide:layout-dashboard",
  },
  {
    key: "tiled",
    defaultMaxTiles: 9,
    icon: "lucide:layout-grid",
  },
  {
    key: "spotlight",
    defaultMaxTiles: 1,
    icon: "lucide:square",
  },
  {
    key: "sidebar",
    defaultMaxTiles: 4,
    icon: "lucide:layout-panel-left",
  },
] as const;

const LAYOUTS: GridLayout[] = ["auto", "tiled", "spotlight", "sidebar"];

const LayoutSelector: FC<LayoutSelectorProps> = ({
  settings,
  onChange,
  className,
}) => {
  const t = useTranslations("meet.call");
  const [isOpen, setIsOpen] = useState(false);

  const canAdjustTiles = settings.layout !== "spotlight";

  const handleLayoutChange = (value: string) => {
    const layout = value as GridLayout;
    onChange({
      ...settings,
      layout,
      // Reset maxTiles to 9 when switching to spotlight (only 1 shown anyway)
      maxTiles: settings.maxTiles,
    });
  };

  const handleMaxTilesChange = (value: number[]) => {
    onChange({ ...settings, maxTiles: value[0] });
  };

  const selectedLayout =
    layouts.find(l => l.key === settings.layout) || layouts[0];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <AppIconButton
          icon={selectedLayout.icon}
          size="xl"
          variant="fill"
          color="background"
          title={t("grid_view")}
          element="div"
          iconClassName="[&_g]:stroke-[1.25] [&_path]:stroke-[1.25] [&_rect]:stroke-[1.25]"
        />
      </PopoverTrigger>
      <PopoverContent sideOffset={10} className="w-72 p-3.5 z-60 col gap-2">
        <PopupHeader
          title={t("layout_change")}
          icon={sharedIcons.grid}
          subtitle={t("layout_saved")}
        />

        <AppTypo>{t("layout_options")}</AppTypo>
        <RadioGroup
          value={settings.layout}
          onValueChange={handleLayoutChange}
          className="gap-1 px-1"
        >
          {layouts.map(layout => (
            <label
              key={layout.key}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors",
                "hover:bg-muted/50",
                settings.layout === layout.key && "bg-muted/80",
              )}
            >
              <RadioGroupItem value={layout.key} />
              <AppTypo variant="small" className="flex-1 capitalize">
                {t(`layout_${layout.key}`)}
              </AppTypo>
              <AppIcon
                icon={layout.icon}
                className={cn(
                  "size-7 [&_g]:stroke-[1.25] [&_path]:stroke-[1.25] [&_rect]:stroke-[1.25]",
                  settings.layout === layout.key
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
            </label>
          ))}
        </RadioGroup>

        <AppTypo>{t("tiles_slider")}</AppTypo>
        <div className=" pt-3  border-t ">
          <div className="flex items-start justify-between mb-1">
            <AppTypo variant="xs" color="secondary">
              <span className="!text-sm !font-semibold">
                {t("layout_tiles")}{" "}
              </span>
              {canAdjustTiles
                ? t("layout_tiles_desc")
                : t("layout_tiles_disabled")}
            </AppTypo>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <AppIcon
              icon={sharedIcons.grid}
              className={cn(
                "size-4 shrink-0",
                canAdjustTiles
                  ? "text-foreground"
                  : "text-muted-foreground opacity-50",
              )}
            />
            <Slider
              value={[canAdjustTiles ? settings.maxTiles : 1]}
              onValueChange={handleMaxTilesChange}
              min={2}
              max={16}
              step={1}
              disabled={!canAdjustTiles}
              className="flex-1"
            />
            <AppIcon
              icon={sharedIcons.grid}
              className={cn(
                "size-5 shrink-0",
                canAdjustTiles
                  ? "text-foreground"
                  : "text-muted-foreground opacity-50",
              )}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LayoutSelector;
