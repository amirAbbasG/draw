import * as React from "react";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import AppIcon from "@/components/ui/custom/app-icon";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    portal?: boolean;
    container?: Element;
  }
>(({ className, sideOffset = 4, portal = true, container, ...props }, ref) => {
  const Wrapper = ({ children }: PropsWithChildren) => {
    if (!portal) return children;
    return (
      <DropdownMenuPrimitive.Portal container={container}>
        {children}
      </DropdownMenuPrimitive.Portal>
    );
  };

  return (
    <Wrapper>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      />
    </Wrapper>
  );
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const iconSizes = {
  sm: "size-[14px]",
  md: "size-[16px]",
  lg: "size-[20px]",
};

const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    icon?: string;
    selected?: boolean;
    iconSize?: "sm" | "md" | "lg";
  }
>(
  (
    { className, iconSize = "md", inset, icon, children, selected, ...props },
    ref,
  ) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer hover:bg-background select-none items-center rounded-sm text-sm !font-normal px-2 py-1.5 outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 row",
        (inset || !!icon) && "pl-8",
        selected && "border border-primary bg-primary-lighter pe-8",
        className,
      )}
      {...props}
    >
      {icon && (
        <AppIcon
          icon={icon}
          className={cn(
            "absolute left-1.5 flex  top-1/2 -translate-y-1/2",
            iconSizes[iconSize],
          )}
        />
      )}
      {children}
      {selected && (
        <AppIcon
          icon="material-symbols-light:check"
          className="size-4 absolute right-1.5 flex top-1/2 -translate-y-1/2"
        />
      )}
    </DropdownMenuPrimitive.Item>
  ),
);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
    icon?: string;
  }
>(({ className, inset, children, icon, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        "flex row cursor-default relative select-none items-center rounded-sm px-2 py-1.5 text-sm !font-normal outline-none data-[state=open]:bg-background",
        (inset || !!icon) && "pl-8",
        className,
      )}
      {...props}
    >
      {icon && (
        <AppIcon
          icon={icon}
          className="absolute left-2 flex h-4 w-4  top-1/2 -translate-y-1/2"
        />
      )}
      {children}
      <span className="ms-auto">
        <AppIcon
          icon="ic:round-chevron-right"
          width={18}
          height={18}
          className="rtl:scale-x-[-1] "
        />
      </span>
    </DropdownMenuPrimitive.SubTrigger>
  );
});
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-background-dark", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
};
