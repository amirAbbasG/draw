import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import RenderIf from "@/components/shared/RenderIf";
import AppIcon from "@/components/ui/custom/app-icon";
import AppLoading from "@/components/ui/custom/app-loading";
import { cn } from "@/lib/utils";

import { paletteColors } from "./variants";

const buttonVariants = cva(
  "flex flex-row whitespace-nowrap gap-1 rounded items-center cursor-pointer  justify-center caret-transparent" +
    "disabled:cursor-not-allowed disabled:opacity-80 " +
    "data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-80 ",
  {
    variants: {
      variant: {
        default: `bg-[var(--color)] dark:bg-[var(--light)] text-primary-foreground hover:bg-[var(--dark)] dark:hover:bg-[var(--color)] active:bg-[var(--darker)]
      selected:bg-[var(--lighter)] selected:text-[var(--color)]`,

        outline: `text-foreground border border-separator hover:bg-primary-lighter hover:border-[var(--primary)] hover:text-[var(--darker)] active:bg-[var(--light)]
        selected:border-[var(--color)] selected:border selected:text-[var(--color)] selected:bg-[var(--lighter)]`,

        secondary: `bg-muted-light text-foreground hover:bg-muted-dark active:bg-muted active:text-foreground-lighter
     selected:bg-muted-light selected:border-primary selected:border selected:text-primary`,

        text: `text-[var(--color)]  hover:bg-[var(--lighter)] active:bg-[var(--light)]
     selected:bg-muted-light selected:text-[var(--color)]`,

        link: `underline text-[var(--color)] hover:text-[var(--dark)] active:text-[var(--darker)]
     disabled:text-foreground-disable
     selected:bg-muted-light selected:text-[var(--color)]`,
        ghost:
          "hover:bg-muted-dark active:bg-[var(--light)] selected:bg-[var(--lighter)] dark:selected:bg-[var(--dark)] dark:active:bg-[var(--dark)]",
        gradiant:
          "bg-gradient-to-br from-primary to-secondary text-white hover:to-primary transition-all duration-500",
        input: `bg-[var(--light)] border border-[var(--dark)] text-[var(--darker)] hover:bg-[var(--dark)] hover:border-[var(--darker)]
      disabled:bg-background-dark disabled:text-foreground-disable disabled:border-background-darker`,
      },
      color: {
        ...paletteColors,
        input: [
          "[--color:theme(colors.primary.DEFAULT)]",
          "[--dark:theme(colors.background.dark)]",
          "[--darker:theme(colors.background.darker)]",
          "[--lighter:theme(colors.background.lighter)]",
          "[--light:theme(colors.background.light)]",
          "[--icon:theme(colors.foreground.icon)]",
        ],
      },
      size: {
        default: "h-8 text-sm ",
        sm: "h-7  text-sm px-2",
        lg: "h-9  px-4",
        xl: "h-11  text-lg px-6",
      },
      spacing: {
        default: " ",
        "md:none": "  ",
        none: "  ",
        input: "!px-2",
      },
    },
    compoundVariants: [
      {
        size: "default",
        spacing: "default",
        class: "px-4",
      },
      {
        size: "sm",
        spacing: "default",
        class: "px-2",
      },
      {
        size: "lg",
        spacing: "default",
        class: "px-4",
      },
      {
        size: "xl",
        spacing: "default",
        class: "px-6",
      },
      {
        size: "default",
        spacing: "md:none",
        class: " min-w-8 px-0 md:px-4",
      },
      {
        size: "sm",
        spacing: "md:none",
        class: "min-w-7 px-0 md:px-2",
      },
      {
        size: "lg",
        spacing: "md:none",
        class: "min-w-9 md:px-6 px-0",
      },
      {
        size: "xl",
        spacing: "md:none",
        class: "min-w-11 md:px-8 px-0",
      },
      {
        size: "default",
        spacing: "none",
        class: "min-w-8 px-0",
      },
      {
        size: "sm",
        spacing: "none",
        class: "min-w-7 px-0",
      },
      {
        size: "lg",
        spacing: "none",
        class: "min-w-9 px-0",
      },
      {
        size: "xl",
        spacing: "none",
        class: "min-w-11 px-0",
      },
    ],
    defaultVariants: {
      size: "default",
      color: "default",
    },
  },
);

const iconSizes = {
  default: 16,
  xs: 12,
  sm: 16,
  lg: 20,
  xl: 22,
};

const loadingSizes = {
  default: "w-4 h-4",
  xs: "w-3 h-3",
  sm: "w-3.5 h-3.5",
  lg: "w-5 h-5",
  xl: "w-[22px] h-[22px]",
};

export type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> & {
  asChild?: boolean;
  isPending?: boolean;
  selected?: boolean;
  element?: "div" | "button";
  icon?: string;
  iconClassName?: string;
} & VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      isPending,
      variant = "default",
      size = "default",
      asChild = false,
      children,
      title,
      selected,
      color = "default",
      spacing = "default",
      element = "button",
      icon,
      iconClassName,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : element;

    // determine disabled state
    const isDisabled = !!props.disabled || !!isPending;

    // avoid passing original onClick/disabled/tabIndex directly (they behave differently for div)
    const {
      onClick: originalOnClick,
      disabled: _disabledProp,
      tabIndex: _tabIndexProp,
      ...rest
    } = props as any;

    const handleClick: React.MouseEventHandler = e => {
      if (isDisabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (typeof originalOnClick === "function") originalOnClick(e);
    };

    return (
      <Comp
        className={cn(
          buttonVariants({ spacing, color, variant, size, className }),
          icon && "row gap-1.5",
        )}
        //@ts-ignore
        ref={ref}
        data-disabled={isDisabled ? "true" : undefined}
        data-selected={selected ? "true" : undefined}
        // only set real `disabled` for native button
        {...rest}
        onClick={handleClick}
        disabled={element === "button" ? isDisabled : undefined}
        aria-disabled={isDisabled ? true : undefined}
        tabIndex={
          element === "div" && isDisabled ? -1 : (props.tabIndex as any)
        }
      >
        <RenderIf isTrue={!!icon && !isPending}>
          <AppIcon
            icon={icon!}
            fontSize={iconSizes[size || "default"]}
            className={cn(
              "",
              // "[&_g]:stroke-[1.25] [&_path]:stroke-[1.25]",
              iconClassName,
            )}
          />
        </RenderIf>
        <RenderIf isTrue={!!isPending}>
          <AppLoading
            svgClass={cn(
              variant === "default" ? "stroke-white" : "stroke-foreground",
              loadingSizes[size],
            )}
          />
        </RenderIf>
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
