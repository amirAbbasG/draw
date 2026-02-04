import React, { useEffect, useState, type FC } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import RenderIf from "@/components/shared/RenderIf";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useCheckIsAuth } from "@/hooks/useCheckIsAuth";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

const sideClasses = {
  right: "right-0 !left-auto",
  left: "left-0 !right-auto",
};

const sideSizes = {
  sm: "w-60 lg:w-64 lg:min-w-64 max-w-64 ",
  md: "w-72 lg:w-80 lg:min-w-80 max-w-80 ",
  lg: "w-96 max-w-96 min-w-96 ",
  xl: "w-[500px] max-w-[500px] min-w-[500px] ",
};

const pinClasses = {
  right: {
    sm: "lg:pr-64",
    md: "lg:pr-80",
    lg: "lg:pr-96",
    xl: "lg:pr-[500px]",
  },
  left: {
    sm: "lg:pl-64",
    md: "lg:pl-80",
    lg: "lg:pl-96",
    xl: "lg:pl-[500px]",
  },
};

interface IProps {
  title: string;
  needsAuth?: boolean;
  Trigger: React.ReactNode;
  side?: "right" | "left";
  size?: "sm" | "md" | "lg" | "xl";
  open?: boolean;
  setOpen?: (val: boolean) => void;
  variant?: "fixed" | "overlay" | "dynamic";
  containerId?: string;
  contentClassName?: string;
  modal?: boolean;
}

const AppDrawer: FC<PropsWithChildren<IProps>> = ({
  needsAuth,
  title,
  Trigger,
  side = "right",
  size = "md",
  open,
  setOpen,
  variant = "dynamic",
  children,
  containerId = "app-layout",
  contentClassName,
  modal = true,
}) => {
  const [isPin, setIsPin] = useState(false);
  const [isOpenLocal, setIsOpenLocal] = useState(false);
  const t = useTranslations("shared");

  const pin = variant === "fixed" ? true : isPin;

  const isOpen = open !== undefined ? open : isOpenLocal;
  const setIsOpen = setOpen !== undefined ? setOpen : setIsOpenLocal;

  const { isAuth, goAuth } = useCheckIsAuth();

  const onOpenChange = (val: boolean) => {
    setIsOpen(pin ? true : val);
  };

  const pinClass = pinClasses[side][size];

  useEffect(() => {
    if (variant !== "overlay") {
      const layout = document.getElementById(containerId);
      if (layout) {
        if (isOpen) {
          layout.classList[pin ? "add" : "remove"](pinClass);
        } else {
          layout.classList.remove(pinClass);
          setIsPin(false);
        }
      }
    }

    return () => {
      const layout = document.getElementById(containerId);
      if (layout) {
        layout.classList.remove(pinClass);
      }
    };
  }, [isPin, isOpen, variant]);

  return (
    <Drawer
      dismissible={false}
      direction={side}
      onOpenChange={onOpenChange}
      open={isOpen}
      modal={modal}
    >
      <DrawerTrigger
        onClick={e => {
          if (!isAuth && needsAuth) {
            e.preventDefault();
            e.stopPropagation();
            goAuth();
          }
        }}
      >
        {Trigger}
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          "top-0 bottom-0 z-100 overflow-y-auto fixed border-y-0 mt-0 outline-none  rounded-none  bg-popover",
          sideClasses[side],
          sideSizes[size],
          pin ? "shadow-none" : "shadow-sidebar",
          contentClassName,
        )}
        hideOverlay={pin}
      >
        <DrawerHeader>
          <div className="row gap-0.5">
            <DrawerTitle className="me-auto">{title}</DrawerTitle>
            <RenderIf isTrue={variant === "dynamic"}>
              <AppIconButton
                icon={isPin ? sharedIcons.pin_filled : sharedIcons.pin_outline}
                size="sm"
                iconClassName={isPin ? "text-primary" : ""}
                onClick={() => setIsPin(!isPin)}
                title={isPin ? t("unpin") : t("pin")}
                className="max-lg:hidden"
              />
            </RenderIf>
            <AppIconButton
              icon={sharedIcons.close}
              size="sm"
              onClick={() => setIsOpen(false)}
              title={t("close")}
            />
          </div>
          <VisuallyHidden>
            <DrawerDescription> {title}</DrawerDescription>
          </VisuallyHidden>
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  );
};

export default AppDrawer;
