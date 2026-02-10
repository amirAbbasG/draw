"use client";

import React, { type FC } from "react";

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
import { sharedIcons } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import type { GridLayout, GridSettings } from "./types";

interface LayoutSelectorProps {
  settings: GridSettings;
  onChange: (settings: GridSettings) => void;
  className?: string;
}

/** Small SVG layout preview thumbnails */
const LayoutPreview: FC<{ layout: GridLayout; isActive: boolean }> = ({
  layout,
  isActive,
}) => {
  const strokeColor = isActive ? "var(--primary)" : "var(--muted-foreground)";
  const fillColor = isActive
    ? "var(--primary)"
    : "var(--muted-darker, hsl(var(--muted) / 0.6))";

  const size = 48;

  switch (layout) {
    case "auto":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden
        >
          {/* 2x2 grid with one slightly larger */}
          <rect
            x="2"
            y="2"
            width="26"
            height="20"
            rx="2"
            fill={fillColor}
            opacity="0.2"
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          <rect
            x="30"
            y="2"
            width="16"
            height="20"
            rx="2"
            fill={fillColor}
            opacity="0.15"
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          <rect
            x="2"
            y="26"
            width="16"
            height="20"
            rx="2"
            fill={fillColor}
            opacity="0.15"
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          <rect
            x="20"
            y="26"
            width="26"
            height="20"
            rx="2"
            fill={fillColor}
            opacity="0.15"
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          {/* Arrow indicating auto-resize */}
          <line
            x1="24"
            y1="20"
            x2="24"
            y2="28"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        </svg>
      );

    case "tiled":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden
        >
          {/* Uniform 3x3-ish grid */}
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={2 + col * 16}
                y={2 + row * 16}
                width="12"
                height="12"
                rx="1.5"
                fill={fillColor}
                opacity="0.2"
                stroke={strokeColor}
                strokeWidth="1.5"
              />
            )),
          )}
        </svg>
      );

    case "spotlight":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden
        >
          {/* One large tile */}
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="2"
            fill={fillColor}
            opacity="0.2"
            stroke={strokeColor}
            strokeWidth="1.5"
          />
        </svg>
      );

    case "sidebar":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden
        >
          {/* Large area + small sidebar tiles */}
          <rect
            x="2"
            y="2"
            width="32"
            height="44"
            rx="2"
            fill={fillColor}
            opacity="0.2"
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          <rect
            x="36"
            y="2"
            width="10"
            height="13"
            rx="1.5"
            fill={fillColor}
            opacity="0.15"
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          <rect
            x="36"
            y="17"
            width="10"
            height="13"
            rx="1.5"
            fill={fillColor}
            opacity="0.15"
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          <rect
            x="36"
            y="32"
            width="10"
            height="13"
            rx="1.5"
            fill={fillColor}
            opacity="0.15"
            stroke={strokeColor}
            strokeWidth="1.5"
          />
        </svg>
      );

    default:
      return null;
  }
};

const LAYOUTS: GridLayout[] = ["auto", "tiled", "spotlight", "sidebar"];

const LayoutSelector: FC<LayoutSelectorProps> = ({
  settings,
  onChange,
  className,
}) => {
  const t = useTranslations("meet.call");

  const canAdjustTiles = settings.layout !== "spotlight";

  const handleLayoutChange = (value: string) => {
    const layout = value as GridLayout;
    onChange({
      ...settings,
      layout,
      // Reset maxTiles to 9 when switching to spotlight (only 1 shown anyway)
      maxTiles: layout === "spotlight" ? 1 : settings.maxTiles,
    });
  };

  const handleMaxTilesChange = (value: number[]) => {
    onChange({ ...settings, maxTiles: value[0] });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <AppIconButton
            icon={sharedIcons.grid}
            size="default"
            variant="outline"
            title={t("grid_view")}
            element="div"
            className={cn("rounded-lg bg-background", className)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={12}
        className="w-72 p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <AppTypo variant="headingS" className="font-semibold">
            {t("layout_change")}
          </AppTypo>
          <PopoverTrigger asChild>
            <AppIconButton
              icon={sharedIcons.close}
              size="xs"
              variant="ghost"
              element="div"
            />
          </PopoverTrigger>
        </div>

        <AppTypo variant="xs" color="secondary" className="px-4 pb-3">
          {t("layout_saved")}
        </AppTypo>

        {/* Layout options */}
        <RadioGroup
          value={settings.layout}
          onValueChange={handleLayoutChange}
          className="gap-0 px-1"
        >
          {LAYOUTS.map((layout) => (
            <label
              key={layout}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors",
                "hover:bg-muted/50",
                settings.layout === layout && "bg-muted/80",
              )}
            >
              <RadioGroupItem value={layout} />
              <AppTypo variant="small" className="flex-1 capitalize">
                {t(`layout_${layout}`)}
              </AppTypo>
              <LayoutPreview
                layout={layout}
                isActive={settings.layout === layout}
              />
            </label>
          ))}
        </RadioGroup>

        {/* Tiles slider */}
        <div className="px-4 pt-3 pb-4 border-t mt-1">
          <div className="flex items-start justify-between mb-1">
            <div>
              <AppTypo variant="small" className="font-medium">
                {t("layout_tiles")}
              </AppTypo>
              <AppTypo variant="xs" color="secondary">
                {canAdjustTiles
                  ? t("layout_tiles_desc")
                  : t("layout_tiles_disabled")}
              </AppTypo>
            </div>
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
