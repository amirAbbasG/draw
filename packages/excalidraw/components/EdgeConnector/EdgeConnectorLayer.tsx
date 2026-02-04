/**
 * EdgeConnectorLayer - A component that overlays edge connector UI on the canvas
 * This component handles rendering anchors, action buttons, and shape selector
 */

import React, { useEffect, useCallback } from "react";
import { sceneCoordsToViewportCoords, viewportCoordsToSceneCoords } from "@excalidraw/common";
import { isBindableElement } from "@excalidraw/element";
import type {
  ExcalidrawElement,
  ElementsMap,
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";
import type { Scene } from "@excalidraw/element";
import type { AppState } from "../../types";
import { useEdgeConnector } from "../../edgeConnector/useEdgeConnector";
import { AnchorActions } from "./AnchorActions";
import { ShapeSelector } from "./ShapeSelector";

import "./EdgeConnector.scss";

interface EdgeConnectorLayerProps {
  appState: AppState;
  elementsMap: ElementsMap;
  elements: readonly NonDeletedExcalidrawElement[];
  scene: Scene;
  onElementsChange: (elements: ExcalidrawElement[]) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const EdgeConnectorLayer: React.FC<EdgeConnectorLayerProps> = ({
  appState,
  elementsMap,
  elements,
  scene,
  onElementsChange,
  containerRef,
}) => {
  const {
    state,
    handleScenePointerMove,
    startDrawingEdge,
    finishDrawingEdge,
    cancelDrawing,
    handleDuplicateWithEdge,
    handleSelectShape,
    closeShapeSelector,
  } = useEdgeConnector({
    appState,
    elementsMap,
    elements,
    scene,
    onElementsChange,
  });

  // Handle pointer move
  const onPointerMove = useCallback((e: PointerEvent) => {
    const sceneCoords = viewportCoordsToSceneCoords(
      { clientX: e.clientX, clientY: e.clientY },
      appState,
    );
    handleScenePointerMove(sceneCoords.x, sceneCoords.y);
  }, [appState, handleScenePointerMove]);

  // Handle pointer up (finish drawing)
  const onPointerUp = useCallback((e: PointerEvent) => {
    if (state.isDrawingEdge) {
      finishDrawingEdge(e.clientX, e.clientY);
    }
  }, [state.isDrawingEdge, finishDrawingEdge]);

  // Handle escape key
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (state.isDrawingEdge) {
        cancelDrawing();
      }
      if (state.showShapeSelector) {
        closeShapeSelector();
      }
    }
  }, [state.isDrawingEdge, state.showShapeSelector, cancelDrawing, closeShapeSelector]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onPointerMove, onPointerUp, onKeyDown, containerRef]);

  // Don't render in view mode
  if (appState.viewModeEnabled) {
    return null;
  }

  // Get the hovered element
  const hoveredElement = state.hoveredElementId
    ? elementsMap.get(state.hoveredElementId) as NonDeletedExcalidrawElement | undefined
    : undefined;

  return (
    <div className="edge-connector-layer" style={{ pointerEvents: "none" }}>
      {/* Anchor action button when hovering */}
      {state.hoveredAnchor && hoveredElement && !state.isDrawingEdge && !state.showShapeSelector && (
        <AnchorActions
          anchor={state.hoveredAnchor}
          appState={appState}
          onDuplicateWithEdge={handleDuplicateWithEdge}
          onStartDrawEdge={startDrawingEdge}
        />
      )}

      {/* Shape selector popup */}
      {state.showShapeSelector && state.shapeSelectorPosition && state.pendingEdgeSourceAnchor && (
        <ShapeSelector
          position={state.shapeSelectorPosition}
          anchorPosition={state.pendingEdgeSourceAnchor.position}
          onSelectShape={handleSelectShape}
          onClose={closeShapeSelector}
        />
      )}
    </div>
  );
};

export default EdgeConnectorLayer;
