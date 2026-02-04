import React, { useState, type FC } from "react";

import { useTranslations } from "@/i18n";

import HistoryCard from "@/components/features/history/HistoryCard";
import LoadingSkeleton from "@/components/features/history/LoadingSkeleton";
import { useGetHistory } from "@/components/features/history/useGetHistory";
import AppDrawer from "@/components/shared/AppDrawer";
import DynamicButton from "@/components/shared/DynamicButton";
import { Show } from "@/components/shared/Show";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import { useCheckScrollEnd } from "@/hooks/useCheckScrollEnd";
import { isEmpty } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";

interface IProps {
}

const AppHistory: FC<IProps> = () => {
  const [isOpen, setIsOpen] = useState(false);

  const t = useTranslations("history");
  const [searchText, setSearchText] = useState("");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetHistory(isOpen);

  const { containerRef, loadingTargetRef } = useCheckScrollEnd(fetchNextPage);

  const histories =
    data?.filter(h =>
      h.title.toLowerCase().includes(searchText.toLowerCase()),
    ) || [];


  return (
    <AppDrawer
      title={t("title")}
      open={isOpen}
      setOpen={setIsOpen}
      needsAuth
      Trigger={
        <DynamicButton
          icon={sharedIcons.history}
          title={t("title")}
          hideLabel
        />
      }
    >
      <div className="p-4 pt-0 grid grid-cols-2 gap-2" ref={containerRef}>
        <Input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder={t("search_placeholder")}
          icon={sharedIcons.search}
          wrapperClassName="col-span-full mb-2"
        />
        <Show>
          <Show.When isTrue={isLoading && !isEmpty(histories)}>
            <LoadingSkeleton />
          </Show.When>
          <Show.When
            isTrue={
              !isLoading && !hasNextPage && histories && histories.length === 0
            }
          >
            <div className="centered-col col-span-full gap-3">
              <AppIcon
                icon={sharedIcons.history}
                width={48}
                className="text-foreground-light mt-6"
              />
              <AppTypo color="secondary">{t("no_history")}</AppTypo>
            </div>
          </Show.When>
          <Show.Else>
            {histories.map(h => (
              <HistoryCard
                item={h}
                key={h.id}
                onClose={() => setIsOpen(false)}
              />
            ))}
            <div
              ref={loadingTargetRef}
              className="text-sm text-center w-full text-foreground"
            >
              {isFetchingNextPage
                ? t("loading")
                : hasNextPage
                  ? t("no_more")
                  : ""}
            </div>
          </Show.Else>
        </Show>
      </div>
    </AppDrawer>
  );
};

export default AppHistory;
