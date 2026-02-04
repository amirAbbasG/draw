/**
 * EdgeConnectorLayer - A component that overlays edge connector UI on the canvas
 * This component handles rendering anchors, action buttons, and shape selector
 */

import React, { useEffect, useCallback, useMemo, useState, useRef } from "react";
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
import { getElementAnchors, ANCHOR_RADIUS, type ShapeAnchor, type AnchorPosition } from "../../edgeConnector/index";
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

// Helper to convert scene coords to viewport coords relative to the container
const toViewportRelative = (
  sceneX: number,
  sceneY: number,
  appState: AppState,
): { x: number; y: number } => {
  // Use the scroll and zoom to calculate position
  const { scrollX, scrollY, zoom } = appState;
  return {
    x: (sceneX + scrollX) * zoom.value,
    y: (sceneY + scrollY) * zoom.value,
  };
};

// Generate elbow path between two points
const generateElbowPath = (
  x1: number, y1: number,
  x2: number, y2: number,
  sourcePosition: AnchorPosition,
): string => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  // Create orthogonal path based on source anchor position
  if (sourcePosition === "top" || sourcePosition === "bottom") {
    // Vertical first, then horizontal
    const bendY = sourcePosition === "top" ? Math.min(y1, y2) - 20 : Math.max(y1, y2) + 20;
    return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  } else {
    // Horizontal first, then vertical
    const bendX = sourcePosition === "left" ? Math.min(x1, x2) - 20 : Math.max(x1, x2) + 20;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  }
};

// Check if an element is a top-level element (not part of a group that has other visible elements)
const isTopLevelElement = (
  element: NonDeletedExcalidrawElement,
  elements: readonly NonDeletedExcalidrawElement[],
): boolean => {
  // If element has no groupIds, it's top level
  if (!element.groupIds || element.groupIds.length === 0) {
    return true;
  }
  
  // Get the outermost group
  const outermostGroupId = element.groupIds[element.groupIds.length - 1];
  
  // Find all elements in this group
  const groupElements = elements.filter(el => 
    el.groupIds && el.groupIds.includes(outermostGroupId)
  );
  
  // If this element is the first bindable element in the group, show anchors on it
  const firstBindable = groupElements.find(el => isBindableElement(el));
  return firstBindable?.id === element.id;
};

// Get the bounding box of a group of elements
const getGroupBoundingBox = (
  element: NonDeletedExcalidrawElement,
  elements: readonly NonDeletedExcalidrawElement[],
): { x: number; y: number; width: number; height: number } | null => {
  if (!element.groupIds || element.groupIds.length === 0) {
    return null;
  }
  
  const outermostGroupId = element.groupIds[element.groupIds.length - 1];
  const groupElements = elements.filter(el => 
    el.groupIds && el.groupIds.includes(outermostGroupId)
  );
  
  if (groupElements.length <= 1) {
    return null;
  }
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  for (const el of groupElements) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  }
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const EdgeConnectorLayer: React.FC<EdgeConnectorLayerProps> = ({
  appState,
  elementsMap,
  elements,
  scene,
  onElementsChange,
  containerRef,
}) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const [isOverUI, setIsOverUI] = useState(false);
  
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

  // Check if pointer is over UI elements (modals, popups, toolbars)
  const checkIfOverUI = useCallback((e: PointerEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return false;
    
    // Check if over any UI element
    const isOverUIElement = !!(
      target.closest('.App-menu') ||
      target.closest('.layer-ui__wrapper') ||
      target.closest('.sidebar') ||
      target.closest('.modal') ||
      target.closest('.popup') ||
      target.closest('.Dialog') ||
      target.closest('[class*="toolbar"]') ||
      target.closest('[class*="Toolbar"]') ||
      target.closest('.shape-selector-popup') ||
      target.closest('.anchor-actions')
    );
    
    return isOverUIElement;
  }, []);

  // Handle pointer move
  const onPointerMove = useCallback((e: PointerEvent) => {
    // Check if over UI
    const overUI = checkIfOverUI(e);
    setIsOverUI(overUI);
    
    if (overUI && !state.isDrawingEdge) {
      // Clear hover state when over UI
      handleScenePointerMove(-99999, -99999);
      return;
    }
    
    const sceneCoords = viewportCoordsToSceneCoords(
      { clientX: e.clientX, clientY: e.clientY },
      appState,
    );
    handleScenePointerMove(sceneCoords.x, sceneCoords.y);
  }, [appState, handleScenePointerMove, checkIfOverUI, state.isDrawingEdge]);

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
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onPointerMove, onPointerUp, onKeyDown]);

  // Don't render in view mode
  if (appState.viewModeEnabled) {
    return null;
  }

  // Get the hovered element
  const hoveredElement = state.hoveredElementId
    ? elementsMap.get(state.hoveredElementId) as NonDeletedExcalidrawElement | undefined
    : undefined;

  // Check if hovered element should show anchors (not part of a group with others)
  const shouldShowAnchors = hoveredElement && 
    isBindableElement(hoveredElement) && 
    isTopLevelElement(hoveredElement, elements);

  // Calculate anchor positions in viewport coords for hovered element
  const anchorPositions = useMemo(() => {
    if (!hoveredElement || !isBindableElement(hoveredElement) || !shouldShowAnchors) {
      return [];
    }
    
    // Check if part of a group - use group bounds
    const groupBounds = getGroupBoundingBox(hoveredElement, elements);
    
    let anchors: ShapeAnchor[];
    if (groupBounds) {
      // Create a fake element with group bounds for anchor calculation
      const fakeElement = {
        ...hoveredElement,
        x: groupBounds.x,
        y: groupBounds.y,
        width: groupBounds.width,
        height: groupBounds.height,
        angle: 0,
      } as ExcalidrawBindableElement;
      anchors = getElementAnchors(fakeElement, elementsMap);
    } else {
      anchors = getElementAnchors(hoveredElement as ExcalidrawBindableElement, elementsMap);
    }
    
    return anchors.map((anchor) => {
      const viewportPos = toViewportRelative(anchor.x, anchor.y, appState);
      return {
        ...anchor,
        viewportX: viewportPos.x,
        viewportY: viewportPos.y,
      };
    });
  }, [hoveredElement, shouldShowAnchors, elementsMap, elements, appState]);

  // Render edge preview line when drawing
  const renderEdgePreview = () => {
    if (!state.isDrawingEdge || !state.drawingSourceAnchor || !state.drawingCurrentPoint) {
      return null;
    }

    const sourceViewport = toViewportRelative(
      state.drawingSourceAnchor.x,
      state.drawingSourceAnchor.y,
      appState,
    );
    const currentViewport = toViewportRelative(
      state.drawingCurrentPoint[0],
      state.drawingCurrentPoint[1],
      appState,
    );

    // Generate elbow path
    const pathD = generateElbowPath(
      sourceViewport.x, sourceViewport.y,
      currentViewport.x, currentViewport.y,
      state.drawingSourceAnchor.position,
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
          overflow: "visible",
        }}
      >
        <path
          d={pathD}
          stroke="#4f6bed"
          strokeWidth={2}
          strokeDasharray="5,5"
          fill="none"
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

  // Don't show anchors when shape selector is open or over UI
  const showAnchors = shouldShowAnchors && !state.isDrawingEdge && !state.showShapeSelector && !isOverUI;

  return (
    <div 
      ref={layerRef}
      className="edge-connector-layer" 
      style={{ 
        pointerEvents: "none", 
        position: "absolute", 
        inset: 0, 
        zIndex: 5, // Lower z-index to not cover UI
        overflow: "hidden",
      }}
    >
      {/* Render anchor circles when hovering over an element */}
      {showAnchors && anchorPositions.map((anchor) => {
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
              transition: "background-color 0.1s",
              zIndex: isHovered ? 11 : 10,
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              startDrawingEdge(anchor);
            }}
          />
        );
      })}

      {/* Anchor action button when hovering on anchor */}
      {state.hoveredAnchor && shouldShowAnchors && !state.isDrawingEdge && !state.showShapeSelector && !isOverUI && (
        <AnchorActions
          anchor={state.hoveredAnchor}
          appState={appState}
          onDuplicateWithEdge={handleDuplicateWithEdge}
          onStartDrawEdge={startDrawingEdge}
        />
      )}

      {/* Edge preview line when drawing */}
      {renderEdgePreview()}

      {/* Shape selector popup - render in a portal-like way with high z-index */}
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
