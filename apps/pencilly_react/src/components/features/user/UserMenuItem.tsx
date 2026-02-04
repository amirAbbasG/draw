import React from "react";

import { PopoverClose } from "@radix-ui/react-popover";

import RenderIf from "@/components/shared/RenderIf";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import { cn } from "@/lib/utils";

interface IItemProps {
  title: string;
  icon: any;
  onClick?: () => void;
  classNames?: string;
  children?: React.ReactNode;
  closeOnClick?: boolean;
}

/**
 * button used as item of menu
 * @param title button title
 * @param onClick butte=on click handler
 * @param Icon used in left side of title in button
 * @param classNames extra classNames
 * @param children used in right side of title in button
 * @param closeOnClick close the popover when click on item
 * @constructor
 */
export function UserMenuItem({
  title,
  onClick,
  icon: Icon,
  classNames,
  children,
  closeOnClick = true,
}: IItemProps) {
  const Wrapper = closeOnClick
    ? ({ children }: PropsWithChildren) => (
        <PopoverClose className="w-full" asChild>
          {children}
        </PopoverClose>
      )
    : React.Fragment;

  return (
    <Wrapper>
      <Button
        element="div"
        title={title}
        variant="ghost"
        className={cn(
          "h-fit w-full px-2.5 py-2 text-label/70 hover:bg-primary-lighter text-base cursor-pointer focus-visible:ring-offset-0",
          "text-foreground",
          classNames,
        )}
        onClick={onClick}
      >
        <RenderIf isTrue={!!Icon}>
          {typeof Icon === "string" ? (
            <AppIcon icon={Icon} width={18} className="me-1 sm:me-2" />
          ) : (
            <Icon size="18" className="me-2" />
          )}
        </RenderIf>
        <span className="w-full text-start font-normal capitalize text-current">
          {title}{" "}
        </span>
        <div className="w-auto h-full flex justify-center items-center">
          {children}
        </div>
      </Button>
    </Wrapper>
  );
}
