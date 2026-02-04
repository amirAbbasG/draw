import * as THREE from "three";

import { useThreeStore } from "@/stores/zustand/three/three-store";

import type { ThreeSettings, TransformMode } from "./types";

export const setUIFocused = (focused: boolean) => {
  useThreeStore.setState(state => {
    state.isUIFocused = focused;
  });
};

export const setCodeEditorOpen = (open: boolean) => {
  useThreeStore.setState(state => {
    state.isCodeEditorOpen = open;
  });
};

export const setSelectedObject = (object: THREE.Object3D | null) => {
  useThreeStore.setState(state => {
    if (!state.isDeleting) {
      state.selectedObject = object;
    }
  });
};

export const setTransformMode = (mode: TransformMode) => {
  useThreeStore.setState(state => {
    state.transformMode = mode;
  });
};

export const setIsDeleting = (isDeleting: boolean) => {
  useThreeStore.setState(state => {
    state.isDeleting = isDeleting;
  });
};

export const setControllerSettings = (settings: Partial<ThreeSettings>) => {
  useThreeStore.setState(state => {
    for (const s in settings) {
      (state.settings as any)[s] = settings[s as keyof ThreeSettings]!;
    }
  });
};
