import React, { useEffect, useState, type FC } from "react";

import {  isEqual } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

import LibraryCard from "@/components/features/draw/library/LibraryCard";
import RenderIf from "@/components/shared/RenderIf";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCheckScrollEnd } from "@/hooks/useCheckScrollEnd";
import { setIsLibraryOpen } from "@/stores/zustand/ui/actions";
import { useUiStore } from "@/stores/zustand/ui/ui-store";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import libraries from "./libraries.json";

interface IProps {
  drawAPI: DrawAPI;
}

const ITEMS_PER_LOAD = 30;

const DrawLibrary: FC<IProps> = ({ drawAPI }) => {
  const isLibraryOpen = useUiStore(useShallow(state => state.isLibraryOpen));
  const t = useTranslations("library");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [searchText, setSearchText] = useState("");
  const [pendingUrl, setPendingUrl] = useState("");

  const { containerRef, loadingTargetRef } = useCheckScrollEnd(() => {
    setVisibleCount(count => count + ITEMS_PER_LOAD);
  }, isLibraryOpen);

  const filteredLibraries = libraries.filter(
    item =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase()) ||
      item.itemNames?.some(name =>
        name.toLowerCase().includes(searchText.toLowerCase()),
      ),
  );

  const onAddLibrary = async (url: string) => {
    if (!drawAPI || !!pendingUrl) return;
    setPendingUrl(url);
    try {
      await drawAPI.updateLibrary({
        libraryItems: async (currentItems: any[]) => {
          const libraryUrl = decodeURIComponent(url);
          const res = await fetch(libraryUrl);
          if (!res.ok) throw new Error("Failed to fetch library");
          const blob = await res.blob();
          const text = await blob.text();
          const data = JSON.parse(text) as any;
          const incoming =
            data.libraryItems ?? data.library ?? data.items ?? [];

          const existingIds = new Set(currentItems.map(it => it.id));

          return incoming.filter((it: any) => {
            if (Array.isArray(it)) {
              return !currentItems.some(existingItem => {
                const newIds = it.map(e => e.id);
                const existingIds = existingItem.elements.map((e: any) => e.id);
                return isEqual(newIds, existingIds);
              });
            }
            return !existingIds.has(it.id);
          });
        },
        merge: true,
        defaultStatus: "published",
        openLibraryMenu: true,
      });

      setIsLibraryOpen(false);
    } catch (e) {
      console.log(e);
    } finally {
      setPendingUrl("");
    }
  };

  useEffect(() => {
    if (!isLibraryOpen) {
      setSearchText("");
      setVisibleCount(ITEMS_PER_LOAD);
    }
  }, [isLibraryOpen]);

  return (
    <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
      <DialogContent className="max-w-full md:max-w-[95vw] pt-0 gap-0 overflow-x-hidden responsive-dialog h-[95dvh] max-h-[95dvh] overflow-y-auto z-80">
        <DialogHeader className="bg-popover sticky -top-[1px] z-10  py-4 ">
          <div className="spacing-row">
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogCloseButton />
          </div>
          <DialogDescription>{t("description")}</DialogDescription>
          <Input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder={t("search")}
            className="lg:h-10 lg:text-base "
            wrapperClassName="mx-auto mt-2 max-w-md"
            icon={sharedIcons.search}
          />
        </DialogHeader>

        <RenderIf isTrue={isLibraryOpen}>
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3  gap-4 w-full"
            ref={containerRef}
          >
            {filteredLibraries.slice(0, visibleCount).map(item => (
              <LibraryCard
                item={item}
                onAdd={onAddLibrary}
                key={item.id}
                pendingUrl={pendingUrl}
              />
            ))}
          </div>
          <div
            ref={loadingTargetRef}
            className="pt-2 text-center w-full text-foreground"
          >
            {filteredLibraries.length > visibleCount
              ? t("loading")
              : filteredLibraries.length === 0
                ? t("not_found")
                : t("no_more_results")}
          </div>
        </RenderIf>
      </DialogContent>
    </Dialog>
  );
};

export default DrawLibrary;
