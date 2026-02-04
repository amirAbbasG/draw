import React from "react";

import { useShallow } from "zustand/react/shallow";

import Draw from "@/components/features/draw";
import Header from "@/components/features/header";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/zustand/ui/ui-store";

// import ThreeJSCanvas from "@/components/features/three";
const ThreeJSCanvas = React.lazy(() => import("@/components/features/three"));

type Div = React.HTMLAttributes<HTMLDivElement>;

function AppLayout({ children, className, ...otherProps }: Div) {
  return (
    <div
      id="app-layout"
      className={cn(
        "w-screen h-dvh overflow-hidden col nemati-draw  ",
        className,
      )}
      {...otherProps}
    >
      {children}
    </div>
  );
}

const Main = ({ children, className, ...otherProps }: Div) => {
  const isFullScreen = useUiStore(useShallow(s => s.isFullScreenDraw));

  return (
    <div
      id="app-layout-main"
      className={cn(
        "w-full  relative transition-all duration-200",
        isFullScreen
          ? "h-dvh max-h-dvh "
          : "h-[var(--main-height)] max-h-[var(--main-height)] ",
        className,
      )}
      {...otherProps}
    >
      {children}
    </div>
  );
};

AppLayout.Header = Header;
AppLayout.Draw = Draw;
AppLayout.Main = Main;
AppLayout.ThreeCanvas = ThreeJSCanvas;

export default AppLayout;
