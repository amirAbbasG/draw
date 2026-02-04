import { useEffect, useState } from "react";

import { AppState } from "@excalidraw/excalidraw/types";

import {
  deletePageData,
  duplicatePageData,
  loadActivePageId,
  loadPageData,
  loadPagesFromStorage,
  saveActivePageId,
  savePageData,
  savePagesToStorage,
} from "../local-storage";

export interface Page {
  id: string;
  name: string;
}

interface UsePaginateActionsProps {
  drawAPI?: DrawAPI;
  onPageChange?: (pageId: string) => void;
}

export const usePaginationActions = ({
  drawAPI,
  onPageChange,
}: UsePaginateActionsProps = {}) => {
  const [pages, setPages] = useState<Page[]>(() => loadPagesFromStorage());
  const [activePage, setActivePageState] = useState<string>(() => {
    const stored = loadActivePageId();
    return stored || pages[0]?.id || "1";
  });
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Save current canvas data before switching pages
  const saveCurrentPageData = () => {
    if (!drawAPI) return;

    const elements = drawAPI.getSceneElements();
    const appState = drawAPI.getAppState();
    const files = drawAPI.getFiles();

    savePageData(activePage, elements, appState, files);
  };

  // Load page data when switching to a new page
  const loadPageDataToCanvas = (pageId: string) => {
    if (!drawAPI) return;

    const pageData = loadPageData(pageId);

    if (pageData) {
      drawAPI.updateScene({
        elements: pageData.elements,
        appState: pageData.appState as AppState,
      });

      if (pageData.files && Object.keys(pageData.files).length > 0) {
        drawAPI.addFiles(Object.values(pageData.files));
      }
    } else {
      // Clear canvas if no data for this page
      drawAPI.updateScene({
        elements: [],
        appState: {},
      });
    }
  };

  // Update pages list in localStorage whenever it changes
  useEffect(() => {
    savePagesToStorage(pages);
  }, [pages]);

  // Update active page in localStorage whenever it changes
  useEffect(() => {
    saveActivePageId(activePage);
  }, [activePage]);

  const setActivePage = (pageId: string) => {
    if (pageId === activePage) return;

    // Save current page before switching
    saveCurrentPageData();

    // Switch to new page
    setActivePageState(pageId);
    loadPageDataToCanvas(pageId);

    // Call optional callback
    onPageChange?.(pageId);
  };

  const handleAddPage = () => {
    // Save current page before creating new one
    saveCurrentPageData();

    const newPage: Page = {
      id: crypto.randomUUID(),
      name: `Page ${pages.length + 1}`,
    };

    setPages([...pages, newPage]);
    setActivePageState(newPage.id);

    // Clear canvas for new page
    if (drawAPI) {
      drawAPI.updateScene({
        elements: [],
        appState: {},
      });
    }

    onPageChange?.(newPage.id);
  };

  const handleRename = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      setEditValue(page.name);
      setEditingPage(id);
    }
  };

  const handleSaveRename = (id: string) => {
    setPages(pages.map(p => (p.id === id ? { ...p, name: editValue } : p)));
    setEditingPage(null);
    setEditValue("");
  };

  const handleDuplicate = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      const newPageId = crypto.randomUUID();
      const newPage: Page = {
        id: newPageId,
        name: `${page.name} (copy)`,
      };

      // Duplicate the page data in localStorage
      duplicatePageData(id, newPageId);

      const index = pages.findIndex(p => p.id === id);
      const newPages = [...pages];
      newPages.splice(index + 1, 0, newPage);
      setPages(newPages);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = pages.findIndex(p => p.id === id);
    if (index < pages.length - 1) {
      const newPages = [...pages];
      [newPages[index], newPages[index + 1]] = [
        newPages[index + 1],
        newPages[index],
      ];
      setPages(newPages);
    }
  };

  const moveUp = (id: string) => {
    const index = pages.findIndex(p => p.id === id);
    if (index > 0) {
      const newPages = [...pages];
      [newPages[index], newPages[index - 1]] = [
        newPages[index - 1],
        newPages[index],
      ];
      setPages(newPages);
    }
  };

  const handleDelete = (id: string) => {
    if (pages.length > 1) {
      // Delete page data from localStorage
      deletePageData(id);

      const newPages = pages.filter(p => p.id !== id);
      setPages(newPages);

      if (activePage === id) {
        const newActivePageId = newPages[0].id;
        setActivePageState(newActivePageId);
        loadPageDataToCanvas(newActivePageId);
        onPageChange?.(newActivePageId);
      }
    }
  };

  const actionHandlers = {
    rename: handleRename,
    duplicate: handleDuplicate,
    move_up: moveUp,
    move_down: handleMoveDown,
    delete: handleDelete,
  };

  return {
    actionHandlers,
    handleSaveRename,
    handleAddPage,
    pages,
    setPages,
    setActivePageState,
    activePage,
    editingPage,
    setActivePage,
    editValue,
    setEditValue,
    saveCurrentPageData, // Expose for manual saves
  };
};
