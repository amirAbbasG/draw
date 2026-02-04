import React from "react";

import { useTranslations } from "@/i18n";

import AppTabs from "@/components/ui/custom/app-tabs";
import {useMediaQuery} from "usehooks-ts";

const headerTabs: ViewTabs[] = ["2d_canvas", "3d_world"];

type TabNames = "2d_canvas" | "3d_world" | "2d_canvas_mobile" | "3d_world_mobile";

const Tabs = () => {
  const t = useTranslations("header");
  const isUpMobile = useMediaQuery("(min-width: 640px)");


  return (
    <AppTabs
      tabs={headerTabs.map(tab => ({
        title: t((tab + (isUpMobile ? "" : "_mobile")) as TabNames),
        tabKey: tab,
      }))}
      className="!rounded h-8 p-0.5"
      itemClassName="!rounded-[6px] h-full   max-sm:!text-[10px]"
    />
  );
};

export default Tabs;
