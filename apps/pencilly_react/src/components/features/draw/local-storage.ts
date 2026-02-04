import { clearElementsForLocalStorage } from "@excalidraw/element";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import type {AppState, BinaryFiles, LibraryItems} from "@excalidraw/excalidraw/types";

import { getUsedFiles } from "@/lib/draw/export";

import { clearAppStateForLocalStorage, getDefaultAppState } from "./app-state";

export type MaybePromise<T> = T | Promise<T>;

export interface PageData {
  elements: ExcalidrawElement[];
  appState: Partial<AppState>;
  files: BinaryFiles;
}
export interface StoredPage {
  id: string;
  name: string;
}

export const STORAGE_KEYS = {
  LOCAL_STORAGE_ELEMENTS: "pencilly-elements",
  LOCAL_STORAGE_APP_STATE: "pencilly-state",
  LOCAL_STORAGE_Files: "pencilly-files",
  LIBRARY_STORAGE: "pencilly-library",
  PAGES_LIST: "pencilly-pages-list",
  ACTIVE_PAGE: "pencilly-active-page",
  PAGE_DATA_PREFIX: "pencilly-page-data-",
} as const;



// Save the list of pages
export const savePagesToStorage = (pages: StoredPage[]) => {
  try {
    localStorage.setItem(
        STORAGE_KEYS.PAGES_LIST,
        JSON.stringify(pages)
    );
  } catch (error) {
    console.error("Failed to save pages list:", error);
  }
};

// Load the list of pages
export const loadPagesFromStorage = (): StoredPage[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PAGES_LIST);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load pages list:", error);
  }
  // Return default page if nothing stored
  return [{ id: "1", name: "Page 1" }];
};

// Save active page ID
export const saveActivePageId = (pageId: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PAGE, pageId);
  } catch (error) {
    console.error("Failed to save active page:", error);
  }
};

// Load active page ID
export const loadActivePageId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PAGE);
  } catch (error) {
    console.error("Failed to load active page:", error);
    return null;
  }
};

// Save data for a specific page AND merge to main storage
export const savePageData = (
    pageId: string,
    elements: DrawElements,
    appState: AppState,
    files: BinaryFiles
) => {
  const key = `${STORAGE_KEYS.PAGE_DATA_PREFIX}${pageId}`;
  try {
    const cleanedElements = clearElementsForLocalStorage(elements);
    const cleanedAppState = clearAppStateForLocalStorage(appState);
    const cleanedFiles = getUsedFiles(files, elements);

    const data: PageData = {
      elements: cleanedElements,
      appState: cleanedAppState,
      files: cleanedFiles,
    };

    // Save to page-specific storage
    localStorage.setItem(key, JSON.stringify(data));

    // Also save to main storage for backward compatibility
    mergeAllPagesToMainStorage();
  } catch (error) {
    console.error(`Failed to save data for page ${pageId}:`, error);
  }
};

// Merge all pages data into main localStorage
export const mergeAllPagesToMainStorage = () => {
  try {
    const pages = loadPagesFromStorage();
    const activePageId = loadActivePageId();

    // Get current active page data
    if (activePageId) {
      const pageData = loadPageData(activePageId);
      if (pageData) {
        // Save active page to main storage
        localStorage.setItem(
            STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS,
            JSON.stringify(pageData.elements)
        );
        localStorage.setItem(
            STORAGE_KEYS.LOCAL_STORAGE_APP_STATE,
            JSON.stringify(pageData.appState)
        );

        if (pageData.files && Object.keys(pageData.files).length > 0) {
          localStorage.setItem(
              STORAGE_KEYS.LOCAL_STORAGE_Files,
              JSON.stringify(pageData.files)
          );
        } else {
          localStorage.removeItem(STORAGE_KEYS.LOCAL_STORAGE_Files);
        }
      }
    }
  } catch (error) {
    console.error("Failed to merge pages to main storage:", error);
  }
};

// Load data for a specific page
export const loadPageData = (pageId: string): PageData | null => {
  const key = `${STORAGE_KEYS.PAGE_DATA_PREFIX}${pageId}`;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const data = JSON.parse(stored) as PageData;

    // Process elements
    let elements: ExcalidrawElement[] = [];
    if (data.elements) {
      elements = clearElementsForLocalStorage(data.elements);
    }

    // Process appState
    let appState = null;
    if (data.appState) {
      appState = {
        ...getDefaultAppState(),
        ...clearAppStateForLocalStorage(data.appState),
      };
    }

    // Process files
    let files: BinaryFiles = {};
    if (data.files) {
      files = getUsedFiles(data.files, elements);
    }

    return { elements, appState, files };
  } catch (error) {
    console.error(`Failed to load data for page ${pageId}:`, error);
    return null;
  }
};

// Delete data for a specific page
export const deletePageData = (pageId: string) => {
  const key = `${STORAGE_KEYS.PAGE_DATA_PREFIX}${pageId}`;
  try {
    localStorage.removeItem(key);
    mergeAllPagesToMainStorage();
  } catch (error) {
    console.error(`Failed to delete data for page ${pageId}:`, error);
  }
};

// Duplicate page data from one page to another
export const duplicatePageData = (sourcePageId: string, targetPageId: string) => {
  const sourceData = loadPageData(sourcePageId);
  if (sourceData) {
    savePageData(
        targetPageId,
        sourceData.elements,
        sourceData.appState as AppState,
        sourceData.files
    );
  }
};

// Clear all pagination data (useful for reset)
export const clearAllPaginationData = () => {
  try {
    const pages = loadPagesFromStorage();
    pages.forEach(page => deletePageData(page.id));
    localStorage.removeItem(STORAGE_KEYS.PAGES_LIST);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PAGE);
  } catch (error) {
    console.error("Failed to clear pagination data:", error);
  }
};

// Get storage size for all pages (useful for debugging)
export const getPaginationStorageSize = (): number => {
  try {
    const pages = loadPagesFromStorage();
    let totalSize = 0;

    pages.forEach(page => {
      const key = `${STORAGE_KEYS.PAGE_DATA_PREFIX}${page.id}`;
      const data = localStorage.getItem(key);
      totalSize += data?.length || 0;
    });

    return totalSize;
  } catch (error) {
    console.error("Failed to calculate storage size:", error);
    return 0;
  }
};


export const setLocalstorageLibraryData = (items: LibraryItems) => {
  try {
    localStorage.setItem(
        STORAGE_KEYS.LIBRARY_STORAGE,
        JSON.stringify(items),
    );
  } catch (error: any) {
    console.error(error);
  }
}

export const importLibraryFromLocalStorage = (): LibraryItems | null => {
    let savedLibrary = null;
    try {
        savedLibrary = localStorage.getItem(STORAGE_KEYS.LIBRARY_STORAGE);
    } catch (error: any) {
        // Unable to access localStorage
        console.error(error);
    }

    let libraryItems: LibraryItems | null = null;
    if (savedLibrary) {
        try {
            libraryItems = JSON.parse(savedLibrary) as LibraryItems;
        } catch (error: any) {
            console.error(error);
            // Do nothing because libraryItems is already null
        }
    }
    return libraryItems;
}