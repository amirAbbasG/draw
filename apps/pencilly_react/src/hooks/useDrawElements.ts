import { useEffect, useState } from "react";

import { ExcalidrawElement } from "@excalidraw/element/types";
import { AppState } from "@excalidraw/excalidraw/types";

export const useDrawElements = (
  drawAPI: DrawAPI,
  onChange?: (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
  ) => void,
) => {
  const [elements, setElements] = useState<DrawElements>([]);

  useEffect(() => {
    if (drawAPI) {
      drawAPI.onChange((elements, appState) => {
        console.log("Ccc");
        onChange?.(elements, appState);
        if (elements) {
          setElements(elements);
        }
      });
    }
  }, [drawAPI]);

  return { elements };
};
