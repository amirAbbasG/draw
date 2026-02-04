import { clearElementsForLocalStorage } from "@excalidraw/element";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import { getUsedFiles } from "@/lib/draw/export";
import { clearAppStateForLocalStorage, getDefaultAppState } from "./app-state";
import { STORAGE_KEYS } from "@/components/features/draw/local-storage";


