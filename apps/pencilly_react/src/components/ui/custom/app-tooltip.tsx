import React from "react";
import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import RenderIf from "@/components/shared/RenderIf";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const variants = cva("", {
  variants: {
    variant: {
      bg: "bg-[var(--lighter)] text-[var(--color)]",
      border: "fill-[var(--lighter)]",
    },
    color: {
      default: [
        "[--color:theme(colors.foreground.dark)]",
        "[--lighter:theme(colors.background.lighter)]",
      ],
      danger: [
        "[--color:theme(colors.danger.DEFAULT)]",
        "[--lighter:theme(colors.danger.lighter)]",
      ],
      success: [
        "[--color:theme(colors.success.DEFAULT)]",
        "[--lighter:theme(colors.success.lighter)]",
      ],
      warning: [
        "[--color:theme(colors.warning.DEFAULT)]",
        "[--lighter:theme(colors.warning.lighter)]",
      ],
      info: [
        "[--color:theme(colors.info.DEFAULT)]",
        "[--lighter:theme(colors.info.lighter)]",
      ],
    },
  },
});

type IProps = {
  title: string | ReactNode;
  delayDuration?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "center" | "start" | "end";
  alignOffset?: number;
  sideOffset?: number;
  open?: boolean;
  setOpen?: (val: boolean) => void;
  contentClass?: string;
  arrow?: boolean;
  children: React.ReactNode;
  asChild?: boolean;
  tooltipTriggerClassName?: string;
} & Omit<VariantProps<typeof variants>, "variant">;

/**
 * tooltip for button
 * @param title tooltip title
 * @param side tooltip content side to button default is top
 * @param delayDuration delay duration to open in millisecond default is 100
 * @param align align of tooltip content to button
 * @param alignOffset
 * @param children
 * @param contentClass
 * @param asChild
 * @param tooltipTriggerClassName
 * @param arrow
 * @param color
 * @param sideOffset
 * @constructor
 */

export const AppTooltip = ({
  title,
  side = "top",
  delayDuration = 300,
  align,
  alignOffset,
  children,
  contentClass,
  asChild = true,
  tooltipTriggerClassName = "",
  arrow = true,
  color = "default",
  sideOffset,
}: IProps) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger
          className={tooltipTriggerClassName}
          asChild={asChild}
          onFocus={e => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          alignOffset={alignOffset}
          sideOffset={sideOffset}
          className={cn(
            "!z-100 max-md:hidden ",
            variants({ variant: "bg", color }),
            contentClass,
          )}
        >
          <p className="text-smfont-normal first-letter:capitalize">{title}</p>
          <RenderIf isTrue={arrow}>
            <TooltipArrow className={variants({ variant: "border", color })} />
          </RenderIf>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
