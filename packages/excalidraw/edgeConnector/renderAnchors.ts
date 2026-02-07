/**
 * Render anchors for edge connections
 */

import type { ElementsMap, NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import { isBindableElement } from "@excalidraw/element";
import type { InteractiveCanvasAppState } from "../types";
import {
  getElementAnchors,
  ANCHOR_RADIUS,
  ANCHOR_HOVER_RADIUS,
  type ShapeAnchor,
  type AnchorPosition,
} from "./index";
import type { EdgeConnectorState } from "./types";

const ANCHOR_FILL_COLOR = "rgba(105, 101, 219, 0.9)";
const ANCHOR_STROKE_COLOR = "#5e5ad8";
const ANCHOR_HOVER_FILL_COLOR = "rgba(105, 101, 219, 1)";
const ANCHOR_HIGHLIGHT_COLOR = "rgba(105, 101, 219, 0.3)";

/**
 * Render anchors for a single element
 */
const renderElementAnchors = (
    context: CanvasRenderingContext2D,
    element: NonDeletedExcalidrawElement,
    elementsMap: ElementsMap,
    appState: InteractiveCanvasAppState,
    hoveredAnchor: ShapeAnchor | null,
    isDrawingEdge: boolean,
) => {
  if (!isBindableElement(element)) return;

  const anchors = getElementAnchors(element, elementsMap);
  const zoom = appState.zoom.value;

  anchors.forEach((anchor) => {
    const isHovered =
        hoveredAnchor?.elementId === element.id &&
        hoveredAnchor?.position === anchor.position;

    const radius = (isHovered ? ANCHOR_HOVER_RADIUS : ANCHOR_RADIUS) / zoom;

    context.save();

    // Draw highlight ring if hovered
    if (isHovered && !isDrawingEdge) {
      context.beginPath();
      context.arc(anchor.x, anchor.y, (ANCHOR_HOVER_RADIUS + 4) / zoom, 0, Math.PI * 2);
      context.fillStyle = ANCHOR_HIGHLIGHT_COLOR;
      context.fill();
    }

    // Draw anchor circle
    context.beginPath();
    context.arc(anchor.x, anchor.y, radius, 0, Math.PI * 2);
    context.fillStyle = isHovered ? ANCHOR_HOVER_FILL_COLOR : ANCHOR_FILL_COLOR;
    context.fill();
    context.strokeStyle = ANCHOR_STROKE_COLOR;
    context.lineWidth = 1.5 / zoom;
    context.stroke();

    context.restore();
  });
};

/**
 * Render the edge being drawn
 */
export const renderDrawingEdge = (
    context: CanvasRenderingContext2D,
    appState: InteractiveCanvasAppState,
    edgeState: EdgeConnectorState,
) => {
  if (!edgeState.isDrawingEdge || !edgeState.drawingSourceAnchor || !edgeState.drawingCurrentPoint) {
    return;
  }

  const { drawingSourceAnchor, drawingCurrentPoint, drawingTargetAnchor } = edgeState;
  const zoom = appState.zoom.value;

  context.save();
  context.translate(appState.scrollX, appState.scrollY);

  // Determine end point
  const endX = drawingTargetAnchor?.x ?? drawingCurrentPoint[0];
  const endY = drawingTargetAnchor?.y ?? drawingCurrentPoint[1];

  // Calculate orthogonal path
  const path = calculateOrthogonalPath(
      drawingSourceAnchor.x,
      drawingSourceAnchor.y,
      endX,
      endY,
      drawingSourceAnchor.position,
      drawingTargetAnchor?.position || null,
  );

  // Draw the path
  context.beginPath();
  context.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    context.lineTo(path[i].x, path[i].y);
  }

  context.strokeStyle = ANCHOR_STROKE_COLOR;
  context.lineWidth = 2 / zoom;
  context.setLineDash([5 / zoom, 5 / zoom]);
  context.stroke();
  context.setLineDash([]);

  // Draw arrow at end
  drawArrowhead(context, path, zoom);

  // Highlight target anchor if hovering
  if (drawingTargetAnchor) {
    context.beginPath();
    context.arc(drawingTargetAnchor.x, drawingTargetAnchor.y, ANCHOR_HOVER_RADIUS / zoom, 0, Math.PI * 2);
    context.fillStyle = ANCHOR_HOVER_FILL_COLOR;
    context.fill();
    context.strokeStyle = ANCHOR_STROKE_COLOR;
    context.lineWidth = 2 / zoom;
    context.stroke();
  }

  context.restore();
};

/**
 * Calculate orthogonal (right-angled) path between two points
 */
const calculateOrthogonalPath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    sourcePosition: AnchorPosition,
    targetPosition: AnchorPosition | null,
): Array<{ x: number; y: number }> => {
  const path: Array<{ x: number; y: number }> = [{ x: x1, y: y1 }];

  const OFFSET = 20;

  // Add intermediate points based on source direction
  switch (sourcePosition) {
    case "top":
      path.push({ x: x1, y: y1 - OFFSET });
      break;
    case "bottom":
      path.push({ x: x1, y: y1 + OFFSET });
      break;
    case "left":
      path.push({ x: x1 - OFFSET, y: y1 });
      break;
    case "right":
      path.push({ x: x1 + OFFSET, y: y1 });
      break;
  }

  // Calculate mid points for orthogonal routing
  const lastPoint = path[path.length - 1];

  if (targetPosition) {
    // Route based on target direction
    switch (targetPosition) {
      case "top":
        path.push({ x: x2, y: lastPoint.y });
        path.push({ x: x2, y: y2 - OFFSET });
        break;
      case "bottom":
        path.push({ x: x2, y: lastPoint.y });
        path.push({ x: x2, y: y2 + OFFSET });
        break;
      case "left":
        path.push({ x: lastPoint.x, y: y2 });
        path.push({ x: x2 - OFFSET, y: y2 });
        break;
      case "right":
        path.push({ x: lastPoint.x, y: y2 });
        path.push({ x: x2 + OFFSET, y: y2 });
        break;
    }
  } else {
    // Simple routing to cursor
    if (sourcePosition === "top" || sourcePosition === "bottom") {
      path.push({ x: x2, y: lastPoint.y });
    } else {
      path.push({ x: lastPoint.x, y: y2 });
    }
  }

  path.push({ x: x2, y: y2 });

  return path;
};

/**
 * Draw arrowhead at the end of the path
 */
const drawArrowhead = (
    context: CanvasRenderingContext2D,
    path: Array<{ x: number; y: number }>,
    zoom: number,
) => {
  if (path.length < 2) return;

  const end = path[path.length - 1];
  const prev = path[path.length - 2];

  const angle = Math.atan2(end.y - prev.y, end.x - prev.x);
  const arrowLength = 10 / zoom;
  const arrowWidth = 6 / zoom;

  context.save();
  context.translate(end.x, end.y);
  context.rotate(angle);

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(-arrowLength, -arrowWidth);
  context.lineTo(-arrowLength, arrowWidth);
  context.closePath();

  context.fillStyle = ANCHOR_STROKE_COLOR;
  context.fill();

  context.restore();
};

/**
 * Main function to render all anchors for hovered elements
 */
export const renderEdgeConnectorAnchors = (
    context: CanvasRenderingContext2D,
    appState: InteractiveCanvasAppState,
    elementsMap: ElementsMap,
    edgeState: EdgeConnectorState,
) => {
  const { hoveredElementId, hoveredAnchor, isDrawingEdge } = edgeState;

  if (!hoveredElementId && !isDrawingEdge) return;

  context.save();
  context.translate(appState.scrollX, appState.scrollY);

  // Render anchors for hovered element
  if (hoveredElementId) {
    const element = elementsMap.get(hoveredElementId);
    if (element && !element.isDeleted) {
      renderElementAnchors(
          context,
          element as NonDeletedExcalidrawElement,
          elementsMap,
          appState,
          hoveredAnchor,
          isDrawingEdge,
      );
    }
  }

  // Also render anchors for target element when drawing
  if (isDrawingEdge && edgeState.drawingTargetElement) {
    const targetElement = edgeState.drawingTargetElement;
    if (targetElement && !targetElement.isDeleted) {
      renderElementAnchors(
          context,
          targetElement,
          elementsMap,
          appState,
          edgeState.drawingTargetAnchor,
          isDrawingEdge,
      );
    }
  }

  context.restore();

  // Render the edge being drawn
  renderDrawingEdge(context, appState, edgeState);
};
