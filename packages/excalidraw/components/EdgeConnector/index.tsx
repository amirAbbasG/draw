import React, { useReducer, useCallback, useEffect, useRef } from "react";
import { sceneCoordsToViewportCoords, viewportCoordsToSceneCoords } from "@excalidraw/common";
import { pointFrom, type GlobalPoint } from "@excalidraw/math";
import { isBindableElement } from "@excalidraw/element";
import type {
  ExcalidrawElement,
  ExcalidrawBindableElement,
  ElementsMap,
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";
import type { Scene } from "@excalidraw/element";
import type { AppState } from "../../types";
import {
  getElementAnchors,
  getAnchorAtPosition,
  getClosestAnchor,
  getElementAtPosition,
  type ShapeAnchor,
  ANCHOR_HIT_RADIUS,
} from "../../edgeConnector";
import {
  edgeConnectorReducer,
  initialEdgeConnectorState,
  type EdgeConnectorState,
} from "../../edgeConnector/types";
import {
  createEdgeBetweenAnchors,
  duplicateShapeWithEdge,
  createShapeFromSelectionWithEdge,
} from "../../edgeConnector/edgeCreator";
import { AnchorActions } from "./AnchorActions";
import { ShapeSelector, type ShapeSelection } from "./ShapeSelector";
import "./EdgeConnector.scss";

interface EdgeConnectorProps {
  appState: AppState;
  elementsMap: ElementsMap;
  elements: readonly NonDeletedExcalidrawElement[];
  scene: Scene;
  onElementsChange: (elements: ExcalidrawElement[]) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const EdgeConnector: React.FC<EdgeConnectorProps> = ({
                                                              appState,
                                                              elementsMap,
                                                              elements,
                                                              scene,
                                                              onElementsChange,
                                                              containerRef,
                                                            }) => {
  const [state, dispatch] = useReducer(edgeConnectorReducer, initialEdgeConnectorState);
  const isDrawingRef = useRef(false);

  // Find hovered element on pointer move
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewportX = e.clientX - rect.left;
    const viewportY = e.clientY - rect.top;

    const sceneCoords = viewportCoordsToSceneCoords(
        { clientX: e.clientX, clientY: e.clientY },
        appState,
    );

    // Check if we're drawing an edge
    if (state.isDrawingEdge && state.drawingSourceAnchor) {
      const sourceElement = elementsMap.get(state.drawingSourceAnchor.elementId);

      // Find target element (exclude source)
      const targetElement = getElementAtPosition(
          sceneCoords.x,
          sceneCoords.y,
          elements,
          new Set([state.drawingSourceAnchor.elementId]),
      );

      // Find target anchor
      let targetAnchor: ShapeAnchor | null = null;
      if (targetElement && isBindableElement(targetElement)) {
        // Check if near an anchor
        const anchor = getAnchorAtPosition(
            sceneCoords.x,
            sceneCoords.y,
            [targetElement],
            elementsMap,
            appState.zoom.value,
        );

        if (anchor) {
          targetAnchor = anchor;
        } else {
          // Get closest anchor on the target element
          targetAnchor = getClosestAnchor(
              sceneCoords.x,
              sceneCoords.y,
              targetElement,
              elementsMap,
          );
        }
      }

      dispatch({
        type: "UPDATE_DRAWING_EDGE",
        point: pointFrom<GlobalPoint>(sceneCoords.x, sceneCoords.y),
        targetElement: targetElement as ExcalidrawBindableElement | null,
        targetAnchor,
      });
      return;
    }

    // Find hovered element for showing anchors
    let hoveredElement: NonDeletedExcalidrawElement | null = null;
    let hoveredAnchor: ShapeAnchor | null = null;

    // First check if we're hovering an anchor
    hoveredAnchor = getAnchorAtPosition(
        sceneCoords.x,
        sceneCoords.y,
        elements,
        elementsMap,
        appState.zoom.value,
    );

    if (hoveredAnchor) {
      hoveredElement = elementsMap.get(hoveredAnchor.elementId) as NonDeletedExcalidrawElement;
    } else {
      // Check if we're hovering an element
      hoveredElement = getElementAtPosition(sceneCoords.x, sceneCoords.y, elements);
    }

    if (hoveredElement && isBindableElement(hoveredElement)) {
      if (state.hoveredElementId !== hoveredElement.id) {
        dispatch({ type: "SET_HOVERED_ELEMENT", elementId: hoveredElement.id });
      }
      dispatch({ type: "SET_HOVERED_ANCHOR", anchor: hoveredAnchor });
    } else if (state.hoveredElementId) {
      dispatch({ type: "SET_HOVERED_ELEMENT", elementId: null });
      dispatch({ type: "SET_HOVERED_ANCHOR", anchor: null });
    }
  }, [appState, elementsMap, elements, state.isDrawingEdge, state.drawingSourceAnchor, state.hoveredElementId, containerRef]);

  // Handle pointer up (finish drawing edge)
  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!state.isDrawingEdge || !state.drawingSourceAnchor) return;

    const sourceElement = elementsMap.get(state.drawingSourceAnchor.elementId);
    if (!sourceElement || !isBindableElement(sourceElement)) {
      dispatch({ type: "CANCEL_DRAWING_EDGE" });
      return;
    }

    // If we have a target element and anchor, create the edge
    if (state.drawingTargetElement && state.drawingTargetAnchor) {
      const edge = createEdgeBetweenAnchors(
          state.drawingSourceAnchor,
          state.drawingTargetAnchor,
          sourceElement,
          state.drawingTargetElement,
          appState,
          scene,
      );

      onElementsChange([edge]);
      dispatch({ type: "FINISH_DRAWING_EDGE" });
    } else if (state.drawingCurrentPoint) {
      // Dropped on canvas - show shape selector
      if (!containerRef.current) {
        dispatch({ type: "CANCEL_DRAWING_EDGE" });
        return;
      }

      const viewportCoords = sceneCoordsToViewportCoords(
          { sceneX: state.drawingCurrentPoint[0], sceneY: state.drawingCurrentPoint[1] },
          appState,
      );

      dispatch({
        type: "SHOW_SHAPE_SELECTOR",
        position: viewportCoords,
        sourceAnchor: state.drawingSourceAnchor,
      });
    } else {
      dispatch({ type: "CANCEL_DRAWING_EDGE" });
    }

    isDrawingRef.current = false;
  }, [state, elementsMap, appState, scene, onElementsChange, containerRef]);

  // Start drawing edge from anchor
  const handleStartDrawEdge = useCallback((anchor: ShapeAnchor) => {
    isDrawingRef.current = true;
    dispatch({ type: "START_DRAWING_EDGE", sourceAnchor: anchor });
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

  // Handle shape selection from popup (supports built-in and library shapes)
  const handleSelectShape = useCallback((selection: ShapeSelection) => {
    if (!state.pendingEdgeSourceAnchor || !state.shapeSelectorPosition) return;

    const sourceElement = elementsMap.get(state.pendingEdgeSourceAnchor.elementId);
    if (!sourceElement || !isBindableElement(sourceElement)) {
      dispatch({ type: "HIDE_SHAPE_SELECTOR" });
      return;
    }

    // Convert viewport position back to scene coords
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
  }, [state.pendingEdgeSourceAnchor, state.shapeSelectorPosition, elementsMap, appState, scene, onElementsChange]);

  // Close shape selector
  const handleCloseShapeSelector = useCallback(() => {
    dispatch({ type: "HIDE_SHAPE_SELECTOR" });
  }, []);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp, containerRef]);

  // Don't render UI if in view mode
  if (appState.viewModeEnabled) {
    return null;
  }

  // Render anchor actions when hovering an anchor
  const hoveredElement = state.hoveredElementId
      ? elementsMap.get(state.hoveredElementId) as NonDeletedExcalidrawElement | undefined
      : undefined;

  return (
      <>
        {/* Anchor action button */}
        {state.hoveredAnchor && hoveredElement && !state.isDrawingEdge && !state.showShapeSelector && (
            <AnchorActions
                anchor={state.hoveredAnchor}
                appState={appState}
                onDuplicateWithEdge={handleDuplicateWithEdge}
                onStartDrawEdge={handleStartDrawEdge}
            />
        )}

        {/* Shape selector popup */}
        {state.showShapeSelector && state.shapeSelectorPosition && state.pendingEdgeSourceAnchor && (
            <ShapeSelector
                position={state.shapeSelectorPosition}
                anchorPosition={state.pendingEdgeSourceAnchor.position}
                onSelectShape={handleSelectShape}
                onClose={handleCloseShapeSelector}
            />
        )}
      </>
  );
};

export default EdgeConnector;

// Export the state for use in rendering
export { type EdgeConnectorState } from "../../edgeConnector/types";
export { renderEdgeConnectorAnchors, renderDrawingEdge } from "../../edgeConnector/renderAnchors";
