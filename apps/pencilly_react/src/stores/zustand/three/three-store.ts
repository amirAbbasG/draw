import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { create } from "zustand/react";

import { createSelectors } from "@/stores/zustand/createSelectors";

import { ThreeState } from "./types";

const initialState: ThreeState = {
  isUIFocused: false,
  isCodeEditorOpen: false,
  selectedObject: null,
  transformMode: "translate",
  isDeleting: false,
  settings: {
    speed: 10,
    sensitivity: 0.002,
    showOcean: false,
    showPerformanceMonitor: false,
    wireframeMode: false,
    axesHelper: false,
    controlMode: "orbit",
  },
};

export const useThreeStoreSelector = create<ThreeState>()(
  devtools(
    immer(() => initialState),
    { name: "three", store: "three" },
  ),
);

export const useThreeStore = createSelectors(useThreeStoreSelector);
