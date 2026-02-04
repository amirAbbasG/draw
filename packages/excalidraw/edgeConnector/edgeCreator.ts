/**
 * Edge Creator Utility
 * Handles creation of edges (arrows) between shapes
 */

import { pointFrom, type GlobalPoint } from "@excalidraw/math";
import { newArrowElement, newElement } from "@excalidraw/element";
import { bindLinearElement } from "@excalidraw/element";
import type {
  ExcalidrawBindableElement,
  ExcalidrawArrowElement,
  ExcalidrawElbowArrowElement,
  ExcalidrawElement,
  NonDeletedSceneElementsMap,
  OrderedExcalidrawElement,
} from "@excalidraw/element/types";
import type { Scene } from "@excalidraw/element";
import type { AppState } from "../types";
import {
  type ShapeAnchor,
  type AnchorPosition,
  getDuplicateOffset,
  getAnchorDirection,
  DEFAULT_EDGE_COLOR,
} from "./index";

const PADDING = 6;

/**
 * Calculate start position based on anchor
 */
const getEdgeStartPosition = (
  anchor: ShapeAnchor,
  element: ExcalidrawBindableElement,
): { x: number; y: number } => {
  const direction = getAnchorDirection(anchor.position);
  return {
    x: anchor.x + direction.dx * PADDING,
    y: anchor.y + direction.dy * PADDING,
  };
};

/**
 * Calculate end position based on target anchor
 */
const getEdgeEndPosition = (
  anchor: ShapeAnchor,
  element: ExcalidrawBindableElement,
): { x: number; y: number } => {
  const direction = getAnchorDirection(anchor.position);
  return {
    x: anchor.x + direction.dx * PADDING,
    y: anchor.y + direction.dy * PADDING,
  };
};

/**
 * Get opposite anchor position
 */
const getOppositeAnchorPosition = (position: AnchorPosition): AnchorPosition => {
  switch (position) {
    case "top": return "bottom";
    case "bottom": return "top";
    case "left": return "right";
    case "right": return "left";
  }
};

/**
 * Create an edge (elbow arrow) between two anchors
 */
export const createEdgeBetweenAnchors = (
  sourceAnchor: ShapeAnchor,
  targetAnchor: ShapeAnchor,
  sourceElement: ExcalidrawBindableElement,
  targetElement: ExcalidrawBindableElement,
  appState: AppState,
  scene: Scene,
  strokeColor: string = DEFAULT_EDGE_COLOR,
): ExcalidrawElbowArrowElement => {
  const startPos = getEdgeStartPosition(sourceAnchor, sourceElement);
  const endPos = getEdgeEndPosition(targetAnchor, targetElement);
  
  // Calculate relative end point
  const endX = endPos.x - startPos.x;
  const endY = endPos.y - startPos.y;
  
  const bindingArrow = newArrowElement({
    type: "arrow",
    x: startPos.x,
    y: startPos.y,
    startArrowhead: null,
    endArrowhead: appState.currentItemEndArrowhead || "arrow",
    strokeColor: strokeColor,
    strokeStyle: "solid",
    strokeWidth: appState.currentItemStrokeWidth || 1,
    opacity: appState.currentItemOpacity || 100,
    roughness: appState.currentItemRoughness || 1,
    points: [pointFrom(0, 0), pointFrom(endX, endY)],
    elbowed: true,
  });
  
  // Bind arrow to both elements
  bindLinearElement(bindingArrow, sourceElement, "start", scene);
  bindLinearElement(bindingArrow, targetElement, "end", scene);
  
  return bindingArrow;
};

/**
 * Duplicate a shape and create an edge to it
 */
export const duplicateShapeWithEdge = (
  sourceElement: ExcalidrawBindableElement,
  sourceAnchor: ShapeAnchor,
  appState: AppState,
  scene: Scene,
): { newElement: ExcalidrawElement; edge: ExcalidrawElbowArrowElement } => {
  // Calculate position for new element
  const offset = getDuplicateOffset(sourceAnchor.position, sourceElement);
  
  // Create duplicate element
  const newShape = newElement({
    type: sourceElement.type as any,
    x: offset.x,
    y: offset.y,
    width: sourceElement.width,
    height: sourceElement.height,
    roundness: sourceElement.roundness,
    roughness: sourceElement.roughness,
    backgroundColor: sourceElement.backgroundColor,
    strokeColor: sourceElement.strokeColor,
    strokeWidth: sourceElement.strokeWidth,
    opacity: sourceElement.opacity,
    fillStyle: sourceElement.fillStyle,
    strokeStyle: sourceElement.strokeStyle,
  });
  
  // Calculate target anchor (opposite side)
  const targetPosition = getOppositeAnchorPosition(sourceAnchor.position);
  const targetAnchor: ShapeAnchor = {
    position: targetPosition,
    x: offset.x + (targetPosition === "right" ? newShape.width : targetPosition === "left" ? 0 : newShape.width / 2),
    y: offset.y + (targetPosition === "bottom" ? newShape.height : targetPosition === "top" ? 0 : newShape.height / 2),
    elementId: newShape.id,
  };
  
  // Create edge
  const edge = createEdgeBetweenAnchors(
    sourceAnchor,
    targetAnchor,
    sourceElement,
    newShape as ExcalidrawBindableElement,
    appState,
    scene,
  );
  
  return { newElement: newShape, edge };
};

/**
 * Create a new shape at position and connect with edge
 */
export const createShapeWithEdge = (
  shapeType: ExcalidrawElement["type"],
  position: { x: number; y: number },
  sourceAnchor: ShapeAnchor,
  sourceElement: ExcalidrawBindableElement,
  appState: AppState,
  scene: Scene,
): { newElement: ExcalidrawElement; edge: ExcalidrawElbowArrowElement } => {
  // Default shape size
  const defaultSize = { width: 100, height: 100 };
  
  // Center the shape at the position
  const newShape = newElement({
    type: shapeType as any,
    x: position.x - defaultSize.width / 2,
    y: position.y - defaultSize.height / 2,
    width: defaultSize.width,
    height: defaultSize.height,
    roughness: appState.currentItemRoughness || 1,
    backgroundColor: appState.currentItemBackgroundColor || "transparent",
    strokeColor: appState.currentItemStrokeColor || "#1e1e1e",
    strokeWidth: appState.currentItemStrokeWidth || 1,
    opacity: appState.currentItemOpacity || 100,
    fillStyle: appState.currentItemFillStyle || "hachure",
    strokeStyle: appState.currentItemStrokeStyle || "solid",
  });
  
  // Calculate closest anchor on new shape
  const targetPosition = getOppositeAnchorPosition(sourceAnchor.position);
  const targetAnchor: ShapeAnchor = {
    position: targetPosition,
    x: newShape.x + (targetPosition === "right" ? newShape.width : targetPosition === "left" ? 0 : newShape.width / 2),
    y: newShape.y + (targetPosition === "bottom" ? newShape.height : targetPosition === "top" ? 0 : newShape.height / 2),
    elementId: newShape.id,
  };
  
  // Create edge
  const edge = createEdgeBetweenAnchors(
    sourceAnchor,
    targetAnchor,
    sourceElement,
    newShape as ExcalidrawBindableElement,
    appState,
    scene,
  );
  
  return { newElement: newShape, edge };
};

/**
 * Update edge color
 */
export const updateEdgeColor = (
  edge: ExcalidrawArrowElement,
  color: string,
  scene: Scene,
): void => {
  scene.mutateElement(edge, { strokeColor: color });
};

/**
 * Check if element is an edge/arrow
 */
export const isEdgeElement = (element: ExcalidrawElement): element is ExcalidrawArrowElement => {
  return element.type === "arrow";
};
