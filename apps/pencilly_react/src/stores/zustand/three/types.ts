import * as THREE from "three";

export type TransformMode = "translate" | "rotate" | "scale";
export type ControlMode = "first_person" | "orbit";

export interface ThreeSettings {
  speed: number;
  sensitivity: number;
  showOcean: boolean;
  showPerformanceMonitor: boolean;
  controlMode: ControlMode;
  wireframeMode: boolean;
  axesHelper: boolean;
}

export interface ThreeState {
  isUIFocused: boolean;
  isCodeEditorOpen: boolean;
  selectedObject: THREE.Object3D | null;
  transformMode: TransformMode;
  isDeleting: boolean;
  settings: ThreeSettings;
}
