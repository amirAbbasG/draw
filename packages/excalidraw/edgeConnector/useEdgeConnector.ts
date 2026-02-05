/**
 * Hook for managing edge connector state and interactions
 */

import { useReducer, useCallback, useRef, useEffect } from "react";
import { viewportCoordsToSceneCoords, sceneCoordsToViewportCoords } from "@excalidraw/common";
import { pointFrom, type GlobalPoint } from "@excalidraw/math";
import { isBindableElement } from "@excalidraw/element";
import type {
  ExcalidrawElement,
  ExcalidrawBindableElement,
  ElementsMap,
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";
import type { Scene } from "@excalidraw/element";
import type { AppState } from "../types";
import {
  getAnchorAtPosition,
  getClosestAnchor,
  getElementAtPosition,
  type ShapeAnchor,
  isPointInElement,
} from "./index";
import {
  edgeConnectorReducer,
  initialEdgeConnectorState,
  type EdgeConnectorState,
  type EdgeConnectorAction,
} from "./types";
import {
  createEdgeBetweenAnchors,
  duplicateShapeWithEdge,
  createShapeFromSelectionWithEdge,
} from "./edgeCreator";
import type { ShapeSelection } from "../components/EdgeConnector/ShapeSelector";

interface UseEdgeConnectorProps {
  appState: AppState;
  elementsMap: ElementsMap;
  elements: readonly NonDeletedExcalidrawElement[];
  scene: Scene;
  onElementsChange: (elements: ExcalidrawElement[]) => void;
}

export const useEdgeConnector = ({
  appState,
  elementsMap,
  elements,
  scene,
  onElementsChange,
}: UseEdgeConnectorProps) => {
  const [state, dispatch] = useReducer(edgeConnectorReducer, initialEdgeConnectorState);
  const isDrawingRef = useRef(false);

  // Handle scene coordinate updates when drawing
  const handleScenePointerMove = useCallback((sceneX: number, sceneY: number) => {
    if (!state.isDrawingEdge || !state.drawingSourceAnchor) {
      // Check for hovered element
      let hoveredAnchor = getAnchorAtPosition(
        sceneX,
        sceneY,
        elements,
        elementsMap,
        appState.zoom.value,
      );
      
      if (hoveredAnchor) {
        const hoveredElement = elementsMap.get(hoveredAnchor.elementId);
        if (hoveredElement && isBindableElement(hoveredElement)) {
          if (state.hoveredElementId !== hoveredElement.id) {
            dispatch({ type: "SET_HOVERED_ELEMENT", elementId: hoveredElement.id });
          }
          dispatch({ type: "SET_HOVERED_ANCHOR", anchor: hoveredAnchor });
          return;
        }
      }
      
      // Check if hovering element (not anchor) - pass elementsMap for rotation handling
      const hoveredElement = getElementAtPosition(sceneX, sceneY, elements, new Set(), elementsMap);
      if (hoveredElement && isBindableElement(hoveredElement)) {
        if (state.hoveredElementId !== hoveredElement.id) {
          dispatch({ type: "SET_HOVERED_ELEMENT", elementId: hoveredElement.id });
        }
        dispatch({ type: "SET_HOVERED_ANCHOR", anchor: null });
      } else if (state.hoveredElementId) {
        dispatch({ type: "SET_HOVERED_ELEMENT", elementId: null });
        dispatch({ type: "SET_HOVERED_ANCHOR", anchor: null });
      }
      return;
    }
    
    // Drawing mode - find target (pass elementsMap for rotation handling)
    const targetElement = getElementAtPosition(
      sceneX,
      sceneY,
      elements,
      new Set([state.drawingSourceAnchor.elementId]),
      elementsMap,
    );
    
    let targetAnchor: ShapeAnchor | null = null;
    if (targetElement && isBindableElement(targetElement)) {
      const anchor = getAnchorAtPosition(
        sceneX,
        sceneY,
        [targetElement],
        elementsMap,
        appState.zoom.value,
      );
      targetAnchor = anchor || getClosestAnchor(sceneX, sceneY, targetElement, elementsMap);
    }
    
    dispatch({
      type: "UPDATE_DRAWING_EDGE",
      point: pointFrom<GlobalPoint>(sceneX, sceneY),
      targetElement: targetElement as ExcalidrawBindableElement | null,
      targetAnchor,
    });
  }, [state, elementsMap, elements, appState.zoom.value]);

  // Start drawing edge
  const startDrawingEdge = useCallback((anchor: ShapeAnchor) => {
    isDrawingRef.current = true;
    dispatch({ type: "START_DRAWING_EDGE", sourceAnchor: anchor });
  }, []);

  // Finish drawing edge
  const finishDrawingEdge = useCallback((viewportX: number, viewportY: number) => {
    if (!state.isDrawingEdge || !state.drawingSourceAnchor) {
      dispatch({ type: "CANCEL_DRAWING_EDGE" });
      return null;
    }
    
    const sourceElement = elementsMap.get(state.drawingSourceAnchor.elementId);
    if (!sourceElement || !isBindableElement(sourceElement)) {
      dispatch({ type: "CANCEL_DRAWING_EDGE" });
      return null;
    }
    
    // If we have target, create edge
    if (state.drawingTargetElement && state.drawingTargetAnchor) {
      const edge = createEdgeBetweenAnchors(
        state.drawingSourceAnchor,
        state.drawingTargetAnchor,
        sourceElement,
        state.drawingTargetElement,
        appState,
        scene,
      );
      
      dispatch({ type: "FINISH_DRAWING_EDGE" });
      isDrawingRef.current = false;
      onElementsChange([edge]);
      return { type: "connected" as const, edge };
    }
    
    // Dropped on canvas - show shape selector
    if (state.drawingCurrentPoint) {
      dispatch({
        type: "SHOW_SHAPE_SELECTOR",
        position: { x: viewportX, y: viewportY },
        sourceAnchor: state.drawingSourceAnchor,
      });
      isDrawingRef.current = false;
      return { type: "showSelector" as const };
    }
    
    dispatch({ type: "CANCEL_DRAWING_EDGE" });
    isDrawingRef.current = false;
    return null;
  }, [state, elementsMap, appState, scene, onElementsChange]);

  // Cancel drawing
  const cancelDrawing = useCallback(() => {
    dispatch({ type: "CANCEL_DRAWING_EDGE" });
    isDrawingRef.current = false;
  }, []);

  // Duplicate shape with edge (duplicates entire group if part of one)
  const handleDuplicateWithEdge = useCallback((anchor: ShapeAnchor) => {
    const sourceElement = elementsMap.get(anchor.elementId);
    if (!sourceElement || !isBindableElement(sourceElement)) return;
    
    const { newElements, edge } = duplicateShapeWithEdge(
      sourceElement,
      anchor,
      appState,
      scene,
      elements, // Pass all elements to find group members
    );
    
    onElementsChange([...newElements, edge]);
  }, [elementsMap, appState, scene, elements, onElementsChange]);

  // Select shape from popup (supports both built-in and library shapes)
  const handleSelectShape = useCallback((selection: ShapeSelection) => {
    if (!state.pendingEdgeSourceAnchor || !state.shapeSelectorPosition) return;
    
    const sourceElement = elementsMap.get(state.pendingEdgeSourceAnchor.elementId);
    if (!sourceElement || !isBindableElement(sourceElement)) {
      dispatch({ type: "HIDE_SHAPE_SELECTOR" });
      return;
    }
    
    const sceneCoords = viewportCoordsToSceneCoords(
      { clientX: state.shapeSelectorPosition.x, clientY: state.shapeSelectorPosition.y },
      appState,
    );
    
    const { newElements, edge } = createShapeFromSelectionWithEdge(
      selection,
      sceneCoords,
      state.pendingEdgeSourceAnchor,
      sourceElement,
      appState,
      scene,
    );
    
    onElementsChange([...newElements, edge]);
    dispatch({ type: "HIDE_SHAPE_SELECTOR" });
  }, [state, elementsMap, appState, scene, onElementsChange]);

  // Close shape selector
  const closeShapeSelector = useCallback(() => {
    dispatch({ type: "HIDE_SHAPE_SELECTOR" });
  }, []);

  // Reset state
  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    isDrawingRef.current = false;
  }, []);

  return {
    state,
    isDrawing: isDrawingRef.current,
    handleScenePointerMove,
    startDrawingEdge,
    finishDrawingEdge,
    cancelDrawing,
    handleDuplicateWithEdge,
    handleSelectShape,
    closeShapeSelector,
    reset,
  };
};
