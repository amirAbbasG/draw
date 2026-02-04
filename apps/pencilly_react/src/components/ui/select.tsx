import * as React from "react";

import * as SelectPrimitive from "@radix-ui/react-select";

import RenderIf from "@/components/shared/RenderIf";
import AppIcon from "@/components/ui/custom/app-icon";
import { cn } from "@/lib/utils";

import { inputVariant } from "./variants";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    hideArrow?: boolean; // Added hideArrow prop
  }
>(({ className, hideArrow, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // " flex w-full items-center justify-between  rounded",
      "flex items-center gap-2",
      inputVariant({ variant: "input", color: "input" }),
      className,
    )}
    {...props}
  >
    {children}
    {!hideArrow && (
      <SelectPrimitive.Icon asChild>
        <span className="ms-2">
          <AppIcon icon="bi:chevron-down" className="h-3.5 w-3.5 opacity-50" />
        </span>
      </SelectPrimitive.Icon>
    )}
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <AppIcon icon="bi:chevron-up" className="h-4 w-4 ms-1" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <AppIcon icon="bi:chevron-down" className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    hideScrollButtons?: boolean;
    viewportClassName?: string;
    container?: Element;
    portal?: boolean;
  }
>(
  (
    {
      className,
      children,
      position = "popper",
      hideScrollButtons,
      viewportClassName,
      portal = true,
      ...props
    },
    ref,
  ) => {
    const Wrapper = ({ children }: PropsWithChildren) => {
      if (!portal) return children;
      return (
        <SelectPrimitive.Portal container={props.container}>
          {children}
        </SelectPrimitive.Portal>
      );
    };

    return (
      <Wrapper>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            "relative z-50 max-h-[350px] min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            className,
          )}
          position={position}
          {...props}
        >
          <RenderIf isTrue={!hideScrollButtons}>
            <SelectScrollUpButton />
          </RenderIf>
          <SelectPrimitive.Viewport
            className={cn(
              "py-1",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
              viewportClassName,
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <RenderIf isTrue={!hideScrollButtons}>
            <SelectScrollDownButton />
          </RenderIf>
        </SelectPrimitive.Content>
      </Wrapper>
    );
  },
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-4 pr-2 text-base", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    image?: string;
  }
>(({ className, children, image, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center py-1.5 px-3 font-sans text-base font-normal outline-none data-[state='checked']:!bg-primary-lighter border-s-2 data-[state='checked']:border-primary border-transparent hover:!bg-background-dark  data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    {/*<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">*/}
    {/*<span className="me-2 flex h-3.5 w-3.5 items-center justify-center">*/}
    {/*  <SelectPrimitive.ItemIndicator>*/}
    {/*    <AppIcon icon="material-symbols-light:check" className="h-4 w-4" />*/}
    {/*  </SelectPrimitive.ItemIndicator>*/}
    {/*</span>*/}
    {image && <img src={image} alt="image" className="h-5 w-5 rounded-full" />}
    <SelectPrimitive.ItemText className="w-full row gap-2">
      {children}
    </SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
};
