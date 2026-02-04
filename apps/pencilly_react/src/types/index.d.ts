import type { Dispatch, ReactNode, SetStateAction } from "react";

import { NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { AppState } from "@excalidraw/excalidraw/types";

import { useCollaboration } from "@/hooks/collaboration/useCollaboration";
import { getPathname } from "@/i18n/navigation";
import type {usePaginationActions} from "@/components/features/draw/pagination/usePaginationActions";



declare global {
  type PropsWithChildren<P extends any = {}> = P & {
    children?: ReactNode | ReactNode[];
  };

  type StateSetter<T> = Dispatch<SetStateAction<T>>;

  type Href = Parameters<typeof getPathname>[0]["href"];

  type DrawAPI = ExcalidrawImperativeAPI | null;

  type ViewTabs = "2d_canvas" | "3d_world";

  type DrawElement = NonDeletedExcalidrawElement & {
    isSelected?: boolean;
  }
  type DrawElements = readonly DrawElement[];
  type DrawAppState =  AppState;
  type CollabAPI = ReturnType<typeof useCollaboration>;
  type PaginationAPI = ReturnType<typeof usePaginationActions>
}
