import * as React from "react";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as SelectPrimitive from "@radix-ui/react-select";

import { cn } from "@/lib/utils";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> & {
    container?: Element;
    portal?: boolean;
  }
>(
  (
    {
      className,
      align = "center",
      sideOffset = 4,
      portal = true,
      container,
      ...props
    },
    ref,
  ) => {
    const Wrapper = ({ children }: PropsWithChildren) => {
      if (!portal) return children;
      return (
        <SelectPrimitive.Portal container={container}>
          {children}
        </SelectPrimitive.Portal>
      );
    };
    return (
      <Wrapper>
        <HoverCardPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-50 w-64 rounded-md bg-popover  p-4 text-popover-foreground shadow-popup outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className,
          )}
          {...props}
        />
      </Wrapper>
    );
  },
);
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
