import type { GlobalPoint } from "@excalidraw/math";
import type {
  ExcalidrawBindableElement,
  ExcalidrawElement,
} from "@excalidraw/element/types";
import type { ShapeAnchor } from "./index";

/**
 * State for edge connector interactions
 */
export interface EdgeConnectorState {
  // Hover states
  hoveredElementId: string | null;
  hoveredAnchor: ShapeAnchor | null;

  // Drawing states
  isDrawingEdge: boolean;
  drawingSourceAnchor: ShapeAnchor | null;
  drawingCurrentPoint: GlobalPoint | null;
  drawingTargetElement: ExcalidrawBindableElement | null;
  drawingTargetAnchor: ShapeAnchor | null;

  // Shape selection popup
  showShapeSelector: boolean;
  shapeSelectorPosition: { x: number; y: number } | null;
  pendingEdgeSourceAnchor: ShapeAnchor | null;

  // Edge editing
  selectedEdgeId: string | null;
  isEditingEdge: boolean;
}

/**
 * Available shapes for quick creation
 */
export interface QuickShape {
  type: ExcalidrawElement["type"];
  label: string;
  icon: string;
}


/**
 * Edge connector action types
 */
export type EdgeConnectorAction =
    | { type: "SET_HOVERED_ELEMENT"; elementId: string | null }
    | { type: "SET_HOVERED_ANCHOR"; anchor: ShapeAnchor | null }
    | { type: "START_DRAWING_EDGE"; sourceAnchor: ShapeAnchor }
    | { type: "UPDATE_DRAWING_EDGE"; point: GlobalPoint; targetElement: ExcalidrawBindableElement | null; targetAnchor: ShapeAnchor | null }
    | { type: "FINISH_DRAWING_EDGE" }
    | { type: "CANCEL_DRAWING_EDGE" }
    | { type: "SHOW_SHAPE_SELECTOR"; position: { x: number; y: number }; sourceAnchor: ShapeAnchor }
    | { type: "HIDE_SHAPE_SELECTOR" }
    | { type: "SELECT_EDGE"; edgeId: string | null }
    | { type: "START_EDITING_EDGE" }
    | { type: "FINISH_EDITING_EDGE" }
    | { type: "RESET" };

/**
 * Initial state for edge connector
 */
export const initialEdgeConnectorState: EdgeConnectorState = {
  hoveredElementId: null,
  hoveredAnchor: null,
  isDrawingEdge: false,
  drawingSourceAnchor: null,
  drawingCurrentPoint: null,
  drawingTargetElement: null,
  drawingTargetAnchor: null,
  showShapeSelector: false,
  shapeSelectorPosition: null,
  pendingEdgeSourceAnchor: null,
  selectedEdgeId: null,
  isEditingEdge: false,
};

/**
 * Reducer for edge connector state
 */
export const edgeConnectorReducer = (
    state: EdgeConnectorState,
    action: EdgeConnectorAction,
): EdgeConnectorState => {
  switch (action.type) {
    case "SET_HOVERED_ELEMENT":
      return { ...state, hoveredElementId: action.elementId };

    case "SET_HOVERED_ANCHOR":
      return { ...state, hoveredAnchor: action.anchor };

    case "START_DRAWING_EDGE":
      return {
        ...state,
        isDrawingEdge: true,
        drawingSourceAnchor: action.sourceAnchor,
        drawingCurrentPoint: null,
        drawingTargetElement: null,
        drawingTargetAnchor: null,
      };

    case "UPDATE_DRAWING_EDGE":
      return {
        ...state,
        drawingCurrentPoint: action.point,
        drawingTargetElement: action.targetElement,
        drawingTargetAnchor: action.targetAnchor,
      };

    case "FINISH_DRAWING_EDGE":
    case "CANCEL_DRAWING_EDGE":
      return {
        ...state,
        isDrawingEdge: false,
        drawingSourceAnchor: null,
        drawingCurrentPoint: null,
        drawingTargetElement: null,
        drawingTargetAnchor: null,
      };

    case "SHOW_SHAPE_SELECTOR":
      return {
        ...state,
        showShapeSelector: true,
        shapeSelectorPosition: action.position,
        pendingEdgeSourceAnchor: action.sourceAnchor,
        isDrawingEdge: false,
        drawingSourceAnchor: null,
        drawingCurrentPoint: null,
      };

    case "HIDE_SHAPE_SELECTOR":
      return {
        ...state,
        showShapeSelector: false,
        shapeSelectorPosition: null,
        pendingEdgeSourceAnchor: null,
      };

    case "SELECT_EDGE":
      return { ...state, selectedEdgeId: action.edgeId };

    case "START_EDITING_EDGE":
      return { ...state, isEditingEdge: true };

    case "FINISH_EDITING_EDGE":
      return { ...state, isEditingEdge: false };

    case "RESET":
      return initialEdgeConnectorState;

    default:
      return state;
  }
};
