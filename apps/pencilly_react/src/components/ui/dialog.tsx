import * as React from "react";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-overlay/10 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    effect?: boolean;
    headerClassName?: string;
    showClose?: boolean;
    container?: Element;
  }
>(
  (
    {
      className,
      onCloseAutoFocus,
      onOpenAutoFocus,
      title,
      effect = true,
      showClose = true,
      children,
      headerClassName,
      container,
      ...props
    },
    ref,
  ) => {
    return (
      <DialogPortal container={container}>
        <DialogOverlay />
        <DialogPrimitive.Content
          onCloseAutoFocus={onCloseAutoFocus}
          onInteractOutside={e => {
            const toastContainer = document.querySelector(".Toastify");
            if (toastContainer && toastContainer.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
          onOpenAutoFocus={onCloseAutoFocus}
          // title={title}
          ref={ref}
          className={cn(
            // shadow
            `bg-background-lighter shadow-modal fixed outline-none overflow-y-auto max-h-[calc(100%-40px)] p-4 left-[50%] top-[50%] z-50  w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 ${effect ? " data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95" : ""} sm:rounded`,
            className + (title && title !== "" ? " pt-0 " : ""),
          )}
          {...props}
        >
          {title && title !== "" && (
            <div
              className={cn(
                "flex justify-between items-center h-14",
                headerClassName,
              )}
            >
              <div className=" flex items-center">
                <DialogTitle>{title}</DialogTitle>
                <VisuallyHidden>
                  <DialogDescription>{title}</DialogDescription>
                </VisuallyHidden>
              </div>

              <DialogPrimitive.Close className="border-none outline-none hover:bg-primary-lighter rounded-full duration-300  cursor-pointer">
                <AppIcon icon={sharedIcons.close} width={16} height={16} />
              </DialogPrimitive.Close>
            </div>
          )}
          {children}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-start",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-medium text-start text-foreground  leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-foreground-light", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogCloseButton = ({
  className,
  size = "xs",
  ...otherProps
}: React.ComponentProps<typeof DialogPrimitive.Close> & {
  size?: "xs" | "sm" | "default" | "xl" | "lg";
}) => {
  return (
    <DialogPrimitive.Close
      className={cn(
        "border-none outline-none hover:bg-primary-lighter rounded-full duration-200 cursor-pointer",
        className,
      )}
      {...otherProps}
    >
      <AppIconButton element="div" size={size} icon={sharedIcons.close} />
    </DialogPrimitive.Close>
  );
};
DialogCloseButton.displayName = "DialogCloseButton";

export {
  Dialog,
  DialogOverlay,
  DialogClose,
  DialogPortal,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
};
