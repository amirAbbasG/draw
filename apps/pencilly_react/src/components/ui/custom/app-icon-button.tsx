import React, { forwardRef } from "react";

import { cva } from "class-variance-authority";

import AppIcon from "@/components/ui/custom/app-icon";
import { AppTooltip } from "@/components/ui/custom/app-tooltip";
import { paletteColors } from "@/components/ui/variants";
import type { typeColorVariant } from "@/components/ui/variants";
import { cn } from "@/lib/utils";

/**
 * Minimal button with icon and title for tooltip
 * @param className - additional class name
 * @param title - tooltip title
 * @param Icon - icon component
 * @param iconClassname - additional class name for icon
 * @param otherProps - other button props
 * @constructor
 */

const iconVariants = cva(
  "flex flex-row cursor-pointer disabled:cursor-not-allowed rounded items-center justify-center",
  {
    variants: {
      variant: {
        default: `text-[var(--icon)] hover:bg-[var(--lighter)] active:bg-[var(--light)]
 disabled:text-foreground-disable data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-80
 selected:bg-[var(--lighter)] selected:border selected:border-[var(--light)] selected:text-[var(--color)]`,
        fill: `bg-[var(--color)] dark:bg-[var(--light)] text-[var(--fill-foreground)] hover:bg-[var(--dark)] dark:hover:bg-[var(--color)] active:bg-[var(--darker)]
 disabled:bg-background-dark disabled:text-foreground-disable disabled:border-background-dark
 selected:bg-[var(--lighter)] selected:text-[var(--color)]`,
        outline: `text-[var(--icon)] border hover:bg-[var(--lighter)] hover:border-[var(--icon)]/40 hover:text-[var(--dark)] active:bg-[var(--light)]
 disabled:bg-background-dark disabled:text-foreground-disable disabled:border-background-dark
 selected:border-[var(--color)] selected:border selected:text-[var(--color)] selected:bg-[var(--lighter)]`,
        ghost: "text-[var(--icon)] disabled:text-foreground-disable",
        custom: "",
      },
      color: {
        ...paletteColors,
        light: [
          "[--color:#fff]",
          "[--dark:#3d3d3d]",
          "[--darker:rgb(42,39,52)]",
          "[--lighter:#717276]",
          "[--light:#5a5959]",
          "[--icon:#fff]",
          "[--fill-foreground:theme(colors.foreground.icon)]",
        ],
        background: [
          "[--color:theme(colors.background.DEFAULT)]",
          "[--dark:theme(colors.background.light)]",
          "[--darker:theme(colors.background.lighter)]",
          "[--lighter:theme(colors.background.darker)]",
          "[--light:theme(colors.background.dark)]",
          "[--icon:theme(colors.foreground.icon)]",
          "[--fill-foreground:theme(colors.foreground.icon)]",
        ]
      },
      size: {
        default: "h-8 w-8",
        sm: "h-7 w-7",
        lg: "h-9 w-9",
        xl: "h-11 w-11",
        xs: "h-6 w-6",
      },
    },
    compoundVariants: [
      {
        size: "default",
        variant: "ghost",
        class: "!h-auto !w-auto !px-0",
      },
      {
        size: "sm",
        variant: "ghost",
        class: "!h-auto !w-auto !min-w-auto !px-0",
      },
      {
        size: "lg",
        variant: "ghost",
        class: "px-6",
      },
      {
        size: "xl",
        variant: "ghost",
        class: "px-8",
      },
    ],
    defaultVariants: {
      size: "default",
      color: "default",
    },
  },
);

export type IconProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color" | "title"
> & {
  asChild?: boolean;
  selected?: boolean;
  size?: "default" | "xl" | "lg" | "sm" | "xs";
  color?: typeColorVariant | "light" | "background";
  variant?: "default" | "fill" | "ghost" | "outline";
  icon: string;
  tooltipColor?: typeColorVariant;
  disabled?: boolean;
  element?: "div" | "button";
  iconClassName?: string;
  title?: string;
};

const AppIconButton = forwardRef<HTMLButtonElement, IconProps>(
  (
    {
      className,
      title,
      icon,
      color = "default",
      size = "default",
      variant = "default",
      selected,
      tooltipColor = "default",
      iconClassName,
      element = "button",
      ...props
    },
    ref,
  ) => {
    const sizeIconList = {
      default: 18,
      xs: 14,
      sm: 18,
      lg: 20,
      xl: 20,
    };

    const Comp = element;

    const Button = (
      <Comp
        className={iconVariants({ color, size, variant: variant, className })}
        //@ts-ignore
        ref={ref}
        disabled={props.disabled}
        data-disabled={props.disabled ? "true" : undefined}
        data-selected={selected ? "true" : undefined}
        {...props}
      >
        <AppIcon
          fontSize={sizeIconList[size]}
          icon={icon}
          className={cn(
              "[&_g]:stroke-[1.25] [&_path]:stroke-[1.25]",
              iconClassName)}
        />
      </Comp>
    );

    return title ? (
      <AppTooltip color={tooltipColor} title={title} >
        {Button}
      </AppTooltip>
    ) : (
      Button
    );
  },
);

AppIconButton.displayName = "AppIconButton";

export default AppIconButton;
