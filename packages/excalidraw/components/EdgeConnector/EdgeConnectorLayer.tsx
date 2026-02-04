/**
 * EdgeConnectorLayer - A component that overlays edge connector UI on the canvas
 * This component handles rendering anchors, action buttons, and shape selector
 */

import React, { useEffect, useCallback, useMemo } from "react";
import { sceneCoordsToViewportCoords, viewportCoordsToSceneCoords } from "@excalidraw/common";
import { isBindableElement } from "@excalidraw/element";
import type {
  ExcalidrawElement,
  ExcalidrawBindableElement,
  ElementsMap,
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";
import type { Scene } from "@excalidraw/element";
import type { AppState } from "../../types";
import { useEdgeConnector } from "../../edgeConnector/useEdgeConnector";
import { getElementAnchors, ANCHOR_RADIUS, type ShapeAnchor } from "../../edgeConnector/index";
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

// Helper to convert scene coords to viewport coords
const toViewport = (
  sceneX: number,
  sceneY: number,
  appState: AppState,
): { x: number; y: number } => {
  return sceneCoordsToViewportCoords(
    { sceneX, sceneY },
    appState,
  );
};

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
    console.log("[v0] onPointerMove - client:", e.clientX, e.clientY, "scene:", sceneCoords.x.toFixed(1), sceneCoords.y.toFixed(1), 
      "appState offset:", appState.offsetLeft, appState.offsetTop, "scroll:", appState.scrollX, appState.scrollY, "zoom:", appState.zoom.value);
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

  // Set up event listeners on window to capture all pointer moves
  useEffect(() => {
    console.log("[v0] Setting up EdgeConnector event listeners on window, elements count:", elements.length);
    
    // Use window level to ensure we capture all pointer events
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onPointerMove, onPointerUp, onKeyDown]);

  // Log state changes
  useEffect(() => {
    console.log("[v0] EdgeConnector state:", {
      hoveredElementId: state.hoveredElementId,
      hoveredAnchor: state.hoveredAnchor,
      isDrawingEdge: state.isDrawingEdge,
    });
  }, [state.hoveredElementId, state.hoveredAnchor, state.isDrawingEdge]);

  // Don't render in view mode
  if (appState.viewModeEnabled) {
    return null;
  }

  // Get the hovered element
  const hoveredElement = state.hoveredElementId
    ? elementsMap.get(state.hoveredElementId) as NonDeletedExcalidrawElement | undefined
    : undefined;

  // Calculate anchor positions in viewport coords for hovered element
  const anchorPositions = useMemo(() => {
    if (!hoveredElement || !isBindableElement(hoveredElement)) {
      return [];
    }
    
    const anchors = getElementAnchors(hoveredElement as ExcalidrawBindableElement, elementsMap);
    return anchors.map((anchor) => {
      const viewportPos = toViewport(anchor.x, anchor.y, appState);
      return {
        ...anchor,
        viewportX: viewportPos.x,
        viewportY: viewportPos.y,
      };
    });
  }, [hoveredElement, elementsMap, appState]);

  // Render edge preview line when drawing
  const renderEdgePreview = () => {
    if (!state.isDrawingEdge || !state.drawingSourceAnchor || !state.drawingCurrentPoint) {
      return null;
    }

    const sourceViewport = toViewport(
      state.drawingSourceAnchor.x,
      state.drawingSourceAnchor.y,
      appState,
    );
    const currentViewport = toViewport(
      state.drawingCurrentPoint[0],
      state.drawingCurrentPoint[1],
      appState,
    );

    return (
      <svg
        className="edge-preview-svg"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1000,
        }}
      >
        <line
          x1={sourceViewport.x}
          y1={sourceViewport.y}
          x2={currentViewport.x}
          y2={currentViewport.y}
          stroke="#4f6bed"
          strokeWidth={2}
          strokeDasharray="5,5"
        />
        <circle
          cx={currentViewport.x}
          cy={currentViewport.y}
          r={6}
          fill="#4f6bed"
        />
      </svg>
    );
  };

  return (
    <div className="edge-connector-layer" style={{ pointerEvents: "none", position: "absolute", inset: 0, zIndex: 100 }}>
      {/* Render anchor circles when hovering over an element */}
      {hoveredElement && !state.isDrawingEdge && !state.showShapeSelector && anchorPositions.map((anchor) => {
        const isHovered = state.hoveredAnchor?.position === anchor.position && 
                          state.hoveredAnchor?.elementId === anchor.elementId;
        return (
          <div
            key={`${anchor.elementId}-${anchor.position}`}
            className={`edge-anchor ${isHovered ? "edge-anchor--hovered" : ""}`}
            style={{
              position: "absolute",
              left: anchor.viewportX - ANCHOR_RADIUS,
              top: anchor.viewportY - ANCHOR_RADIUS,
              width: ANCHOR_RADIUS * 2,
              height: ANCHOR_RADIUS * 2,
              borderRadius: "50%",
              backgroundColor: isHovered ? "#4f6bed" : "#fff",
              border: "2px solid #4f6bed",
              pointerEvents: "auto",
              cursor: "crosshair",
              transform: "translate(0, 0)",
              transition: "transform 0.1s, background-color 0.1s",
              zIndex: isHovered ? 101 : 100,
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log("[v0] Starting edge draw from anchor:", anchor.position);
              startDrawingEdge(anchor);
            }}
          />
        );
      })}

      {/* Anchor action button when hovering on anchor */}
      {state.hoveredAnchor && hoveredElement && !state.isDrawingEdge && !state.showShapeSelector && (
        <AnchorActions
          anchor={state.hoveredAnchor}
          appState={appState}
          onDuplicateWithEdge={handleDuplicateWithEdge}
          onStartDrawEdge={startDrawingEdge}
        />
      )}

      {/* Edge preview line when drawing */}
      {renderEdgePreview()}

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
