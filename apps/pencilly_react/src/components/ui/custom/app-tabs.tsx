import React, { type FC } from "react";

import { useSearchParams } from "react-router";

import RenderIf from "@/components/shared/RenderIf";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

export interface TabItem {
  id?: string;
  title: string;
  tabKey: string;
  filedType?: string;
  icon?: string;
}

interface IProps {
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  tabs: TabItem[];
  className?: string;
  itemClassName?: string;
  tabKey?: string;
}

const AppTabs: FC<IProps> = ({
  onTabChange,
  activeTab,
  tabs,
  className,
  itemClassName,
  tabKey = "tab",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get(tabKey) || tabs[0]?.tabKey;

  const currentTab = onTabChange ? activeTab : tabParam;

  const onChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    } else {
      // preserve other existing params
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set(tabKey, value);
      setSearchParams(newParams, { replace: true });
    }
  };

  return (
    <nav
      className={cn(
        "w-fit mx-auto max-w-full row p-1 bg-background border-[0.5px] rounded-2xl overflow-x-auto hidden-scrollbar",
        className,
      )}
    >
      {tabs.map(item => {
        const isActive = currentTab === item.tabKey;

        return (
          <div
            key={item?.id || item.tabKey}
            className={cn(
              "row justify-center flex-1 w-full py-1 px-4  gap-1.5 cursor-pointer  rounded-xl transition-all duration-200  max-w-max min-w-fit",
              isActive && "bg-background-lighter shadow-sm",
              itemClassName,
            )}
            onClick={() => onChange(item.tabKey)}
          >
            <RenderIf isTrue={!!item.icon}>
              <AppIcon
                icon={item.icon!}
                width={16}
                className={isActive ? "text-foreground-darker" : "text-foreground"}
              />
            </RenderIf>
            <AppTypo
              className={cn(
                "text-nowrap text-xs sm:text-sm",
                isActive && "text-foreground-darker",
              )}
            >
              {item.title}
            </AppTypo>
          </div>
        );
      })}
    </nav>
  );
};

export default AppTabs;
