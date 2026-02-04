import React, { useEffect, useState } from "react";

import { MainMenu, Sidebar } from "@excalidraw/excalidraw";
import { useTranslations } from "@/i18n";

import { useShallow } from "zustand/react/shallow";

import { VersionItem } from "@/components/features/draw/main-menu/version-history/types";
import { useGetVersionHistory } from "@/components/features/draw/main-menu/version-history/useGetVersionHistory";
import VersionCard from "@/components/features/draw/main-menu/version-history/VersionCard";
import RenderIf from "@/components/shared/RenderIf";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckScrollEnd } from "@/hooks/useCheckScrollEnd";
import { cn, isEmpty } from "@/lib/utils";
import { setObjects } from "@/stores/zustand/object/actions";
import { setActiveVersionId } from "@/stores/zustand/ui/actions";
import { useUiStore } from "@/stores/zustand/ui/ui-store";
import { sharedIcons } from "@/constants/icons";
import { useDrawUsers } from "@/services/user";

interface IProps {
  drawAPI: DrawAPI;
}

const NAME = "version_history";

function VersionHistory({ drawAPI }: IProps) {
  const [docked, setDocked] = useState(false);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetVersionHistory();

  const { containerRef, loadingTargetRef } = useCheckScrollEnd(fetchNextPage);

  const { data: users, isPending: isPendingUsers } = useDrawUsers();
  const t = useTranslations("version_history");

  const [activeVersionId, activeHistory] = useUiStore(
    useShallow(state => [state.activeVersionId, state.activeHistory]),
  );

  const onClickVersion = (version: VersionItem) => {
    // setActiveVersionId(version.id);
    // drawAPI.updateScene({
    //   // appState: version.appState,
    //   elements: version.elements,
    // });
    //
    // drawAPI.addFiles(Object.values(version.files || {}));
    // setObjects(version.objects || []);
  };

  useEffect(() => {
    if (!!data?.length && !activeVersionId && !!activeHistory) {
      setActiveVersionId(data[0]?.id);
    }
  }, [data, activeVersionId, activeHistory]);

  return (
    <Sidebar name={NAME} docked={docked} onDock={setDocked}>
      <Sidebar.Header>
        <AppTypo>{t("title")}</AppTypo>
      </Sidebar.Header>
      <div className="col px-3 py-4 gap-3 overflow-y-auto" ref={containerRef}>
        <RenderIf isTrue={(isLoading && isEmpty(data)) || isPendingUsers}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="w-full rounded h-20" />
          ))}
        </RenderIf>
        {data?.map(item => (
          <VersionCard
            user={users.find(u => u.username === item.username)!}
            createdAt={item.createdAt}
            onClick={() => onClickVersion(item)}
            isActive={activeVersionId === item.id}
            key={item.id}
          />
        ))}

        <div
          ref={loadingTargetRef}
          className={cn("text-sm text-center w-full text-foreground")}
        >
          {isFetchingNextPage ? t("loading") : hasNextPage ? t("no_more") : ""}
        </div>
      </div>
    </Sidebar>
  );
}

VersionHistory.Trigger = ({ drawAPI }: IProps) => {
  const t = useTranslations("version_history");
  return (
    <MainMenu.Item
      onClick={() =>
        drawAPI?.toggleSidebar({
          name: NAME,
        })
      }
      icon={<AppIcon className="size-4" icon={sharedIcons.history} />}
    >
      {t("title")}
    </MainMenu.Item>
  );
};

export default VersionHistory;
