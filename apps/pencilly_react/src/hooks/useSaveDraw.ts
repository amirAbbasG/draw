import { useEffect, useState } from "react";

import { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import { useShallow } from "zustand/react/shallow";

import {
  loadPageData,
  loadPagesFromStorage,
} from "@/components/features/draw/local-storage";
import { useHistoryActions } from "@/components/features/history/useHistoryActions";
import { useDebounceEffect } from "@/hooks/useDebounceEffect";
import { getDrawBlob, getExportData } from "@/lib/draw/export";
import { useObjectStore } from "@/stores/zustand/object/object-store";
import { useUiStore } from "@/stores/zustand/ui/ui-store";

export const useSaveDraw = (
  drawAPI: DrawAPI,
  activeAutoSave: boolean = true,
) => {
  const objects = useObjectStore(useShallow(state => state.objects));
  const [changeTrack, setChangeTrack] = useState("");
  const [title, activeHistory, autoSave] = useUiStore(
    useShallow(state => [state.title, state.activeHistory, state.autoSave]),
  );
  const { updateHistory, isPendingUpdate, isPendingCreate, createHistory } =
    useHistoryActions();

  const handleSave = async (setAsActive?: boolean) => {
    if (!drawAPI) return;
    const pages = loadPagesFromStorage();

    const elements: Record<string, DrawElements> = {};
    const appState: Record<string, AppState & { pageName: string }> = {};
    const files: Record<string, BinaryFiles> = {};

    for (const page of pages) {
      const pageData = loadPageData(page.id);
      elements[page.id] = pageData?.elements || [];
      appState[page.id] = {
        ...((pageData?.appState || {}) as AppState),
        pageName: page.name,
      };
      files[page.id] = pageData?.files || {};
    }

    const drawBlob = await getDrawBlob(drawAPI);
    const image = new File([drawBlob], "preview.png", { type: "image/png" });
    const data = {
      title: title || "Untitled",
      elements,
      appState,
      files,
      objects,
    };

    if (activeHistory) {
      return updateHistory({
        image,
        id: activeHistory,
        data,
      });
    } else {
      return createHistory({
        data,
        image,
        setAsActive,
      });
    }
  };

  useEffect(() => {
    if (drawAPI && autoSave && activeAutoSave) {
      drawAPI?.onChange(() => {
        setChangeTrack(Date.now().toString());
      });
    }
  }, [drawAPI, autoSave, activeAutoSave]);

  useDebounceEffect(
    () => {
      if (autoSave && activeAutoSave) {
        void handleSave();
      }
    },
    [objects, changeTrack],
    3000,
  );

  return {
    handleSave,
    isPendingSave: isPendingCreate || isPendingUpdate,
    autoSave,
  };
};
