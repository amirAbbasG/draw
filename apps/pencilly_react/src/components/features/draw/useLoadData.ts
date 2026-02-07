import { useEffect, useRef } from "react";

import { resolvablePromise, ResolvablePromise } from "@excalidraw/common";
import { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";

import {
  importLibraryFromLocalStorage,
  initializeScene,
} from "@/components/features/draw/local-storage";
import { HistoryItem } from "@/components/features/history/types";
import { ROOM_KEY } from "@/components/features/share/constants";
import { useCustomSearchParams } from "@/hooks/useCustomSearchParams";
import { useLoadHistory } from "@/hooks/useLoadHistory";
import { isEmpty } from "@/lib/utils";

export const useLoadData = (
  drawAPI: DrawAPI,
  onLoad: (elms: DrawElements, appState: Partial<DrawAppState> | null) => void,
  setData: (data: HistoryItem) => void,
) => {
  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise =
      resolvablePromise<ExcalidrawInitialDataState | null>();
  }

  const { currentValue: room } = useCustomSearchParams(ROOM_KEY);

  const { getHistory, activeHistory, paramHistory } = useLoadHistory();

  const setHistoryData = async () => {
    const data = await getHistory();
    if (data) {
      setData(data);
    }
  };

  useEffect(() => {
    if (activeHistory && drawAPI && !room) {
      void setHistoryData();
      initialStatePromiseRef.current.promise.resolve({});
    }
  }, [activeHistory, drawAPI]);

  useEffect(() => {
    if (room) {
      initialStatePromiseRef.current.promise.resolve({});
      return;
    }

    // Only initialize from localStorage if not loading from history
    if (!paramHistory) {
      void initializeScene().then(scene => {
        initialStatePromiseRef.current.promise.resolve({
          elements: scene.elements,
          appState: scene.appState,
          files: scene.files,
        });
        onLoad(scene.elements, scene.appState);
      });
    }
  }, [paramHistory]);

  useEffect(() => {
    if (drawAPI) {
      const localLibrary = importLibraryFromLocalStorage();
      if (localLibrary && !isEmpty(localLibrary)) {
        void drawAPI.updateLibrary({
          libraryItems: localLibrary,
          openLibraryMenu: false,
          merge: false,
        });
      }
    }
  }, [drawAPI]);

  return {
    initialStatePromiseRef,
  };
};
