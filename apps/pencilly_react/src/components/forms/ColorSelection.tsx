import React, { ChangeEvent, useEffect, useState, type FC } from "react";

import { useResizeObserver } from "usehooks-ts";

import RenderIf from "@/components/shared/RenderIf";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { useDebounceEffect } from "@/hooks/useDebounceEffect";
import { cn } from "@/lib/utils";

interface IProps {
  value?: string;
  onChange: (vla: string) => void;
  showColorInput?: boolean;
  className?: string;
  title?: string;
  showTransparent?: boolean;
  colorWrapperClassName?: string;
  itemEstimateWidth?: number;
  showStatus?: boolean;
  useDebounce?: boolean;
  sizeClass?: string;
}

const suggestionColor = [
  "#E2B203",
  "#1F845A",
  "#943D73",
  "#0C66E4",
  "#C9372C",
  "#F5A623",
  "#4A90E2",
  "#50E3C2",
  "#B8E986",
  "#9013FE",
  "#F8E71C",
  "#D0021B",
];

const ColorSelection: FC<IProps> = ({
  onChange,
  value,
  className,
  title,
  showTransparent,
  colorWrapperClassName,
  showStatus,
  itemEstimateWidth = 56,
  useDebounce = true,
  sizeClass = " w-9 h-9",
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [width, setWidth] = useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);

  useResizeObserver({
    ref: rootRef as React.RefObject<HTMLDivElement>,
    onResize: entry => {
      setWidth(entry.width || 0);
    },
  });

  useEffect(() => {
    if (value && useDebounce) {
      setLocalValue(value);
    }
  }, [value, useDebounce]);

  useDebounceEffect(() => {
    if (localValue === value || !localValue || !useDebounce) return;
    onChange(localValue);
  }, localValue);

  const itemCount =
    Math.floor(width / itemEstimateWidth) - (showTransparent ? 1 : 0);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!useDebounce) {
      onChange(e.target.value);
    } else {
      setLocalValue(e.target.value);
    }
  };

  return (
    <div className={cn("col gap-2", className)} ref={rootRef}>
      <RenderIf isTrue={!!title}>
        <AppTypo className="!font-normal row gap-1.5">
          <RenderIf isTrue={!!showStatus}>
            <div
              className="size-3 rounded-full border"
              style={{
                backgroundColor: value || "transparent",
              }}
            />
          </RenderIf>
          {title}
        </AppTypo>
      </RenderIf>
      <div
        className={cn("spacing-row gap-2 w-full flex-1", colorWrapperClassName)}
      >
        <RenderIf isTrue={!!showTransparent}>
          <div
            className={cn(
              "rounded border aspect-square cursor-pointer centered-col ",
              !value && "border-primary",
              sizeClass,
            )}
            onClick={() => onChange("")}
          >
            <div className="w-[1px] bg-background-dark h-full rotate-45" />
          </div>
        </RenderIf>

        {suggestionColor.slice(0, itemCount).map(color => (
          <div
            key={color}
            className={cn(
              "rounded cursor-pointer aspect-square centered-col  ",
              sizeClass,
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          >
            <RenderIf isTrue={value === color}>
              <AppIcon
                icon="mdi:check-circle-outline"
                className="h-6 w-6 text-white"
              />
            </RenderIf>
          </div>
        ))}
        <div className={cn("relative  col-span-1 ", sizeClass)}>
          <AppIcon
            icon="streamline-ultimate-color:color-palette-2"
            className="size-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none"
          />
          <input
            type="color"
            className="square-color  !rounded !h-full !w-full cursor-pointer"
            value={useDebounce ? localValue : value || ""}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorSelection;
