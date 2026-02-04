import React, { type FC } from "react";

import { useShallow } from "zustand/react/shallow";

import CallDrawer from "@/components/features/call";
import FileMenu from "@/components/features/header/file-menu";
import HeaderTabs from "@/components/features/header/HeaderTabs";
import AppHistory from "@/components/features/history";
import ScreenRecorder from "@/components/features/screen-recorder";
import UserMenu from "@/components/features/user/UserMenu";
import AppLogo from "@/components/shared/AppLogo";
import RenderIf from "@/components/shared/RenderIf";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/zustand/ui/ui-store";

interface IProps {
  drawAPI: DrawAPI;
  activeTab: string;
}

const Header: FC<IProps> = ({ drawAPI, activeTab }) => {
  const isFullScreen = useUiStore(useShallow(s => s.isFullScreenDraw));

  return (
    <header
      className={cn(
        "w-full  app-header border-b bg-background-lighter  px-2.5 sm:px-4 row gap-2 md:gap-4 relative overflow-hidden transition-all duration-200",
        isFullScreen
          ? "max-h-0 h-0"
          : "max-h-[var(--header-height)] h-[var(--header-height)] py-2",
      )}
    >
      <div className="row gap-2">
        <AppLogo width={40} height={40} className="max-sm:hidden" />
        <FileMenu drawAPI={drawAPI} />
      </div>

      <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 ">
        <HeaderTabs />
      </div>

      <div className="ms-auto row gap-2">
        <RenderIf isTrue={activeTab === "2d_canvas"}>
          {/*<CommentPopup*/}
          {/*  Trigger={*/}
          {/*    <DynamicButton*/}
          {/*      element="div"*/}
          {/*      hideLabel*/}
          {/*      icon={sharedIcons.comments}*/}
          {/*      title={t("comments")}*/}
          {/*    />*/}
          {/*  }*/}
          {/*/>*/}
        </RenderIf>
        {/*<ThemeSelect />*/}
        <ScreenRecorder />
        <CallDrawer />
        <AppHistory />
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
