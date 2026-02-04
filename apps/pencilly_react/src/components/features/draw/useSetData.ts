import { restore } from "@excalidraw/excalidraw";
import {AppState} from "@excalidraw/excalidraw/types";

import {
  clearAllPaginationData,
  loadActivePageId,
  saveActivePageId,
  savePageData,
  savePagesToStorage,
} from "@/components/features/draw/local-storage";
import { HistoryItem } from "@/components/features/history/types";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import { isEmpty } from "@/lib/utils";
import { setObjects } from "@/stores/zustand/object/actions";
import { setTitle } from "@/stores/zustand/ui/actions";

export const useSetData = (drawAPI: DrawAPI, paginationAPI: PaginationAPI) => {
  const isDark = useIsDarkMode();

  const getPageData = (data: HistoryItem, pageId: string)=> {
    const appState = (data.appState?.[pageId] || {}) as AppState;
    const elements = data.elements?.[pageId] || [];
    const files = data.files?.[pageId] || {};

    return [elements, appState, files] as const
  };

  const setData = (data: HistoryItem) => {
    const activePageId = loadActivePageId();
    const currentPageId =
      activePageId && !!data.appState[activePageId]
        ? activePageId
        : Object.keys(data.appState || {})[0];
    const [firstElements, firstAppState, firstFiles] = getPageData(
      data,
      currentPageId,
    );
    clearAllPaginationData();
    const pages = data.appState
      ? Object.keys(data.appState || {}).map(pageId => ({
          id: pageId,
          name: data.appState[pageId]?.pageName || " Page",
        }))
      : [{ id: "1", name: " Page" }];

    savePagesToStorage(pages);
    saveActivePageId(currentPageId);
    pages.forEach(page => {
      const pageData = getPageData(data, page.id);
      savePageData(page.id, ...pageData);
    });
    paginationAPI.setPages(pages);
    paginationAPI.setActivePageState(currentPageId);

    const { appState, elements, files } = restore(
      {
        elements: firstElements || [],
        appState: {
          ...(firstAppState || {}),
          collaborators: new Map(),
          openDialog: null,
          openSidebar: null,
          openMenu: null,
          openPopup: null,
          theme: isDark ? "dark" : "light",
        },
        files: firstFiles || {},
      },
      null,
      null,
    );
    drawAPI.updateScene({
      elements,
      appState: appState as AppState,
    });
    if (!isEmpty(files)) {
      drawAPI.addFiles(Object.values(files));
    }
    setObjects(data?.objects || []);
    setTitle(data?.title || "");
  };
  return { setData };
};
