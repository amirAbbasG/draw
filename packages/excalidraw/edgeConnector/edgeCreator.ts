/**
 * Edge Creator Utility
 * Handles creation of edges (arrows) between shapes
 */

import { pointFrom, type GlobalPoint } from "@excalidraw/math";
import { newArrowElement, newElement, deepCopyElement } from "@excalidraw/element";
import { bindLinearElement } from "@excalidraw/element";
import { getCommonBounds, getElementBounds } from "@excalidraw/element/bounds";
import { arrayToMap, randomId, getUpdatedTimestamp } from "@excalidraw/common";
import type {
  ExcalidrawBindableElement,
  ExcalidrawArrowElement,
  ExcalidrawElbowArrowElement,
  ExcalidrawElement,
  NonDeletedExcalidrawElement,
  NonDeletedSceneElementsMap,
  OrderedExcalidrawElement,
  ElementsMap,
} from "@excalidraw/element/types";
import type { Scene } from "@excalidraw/element";
import type { AppState } from "../types";
import {
  type ShapeAnchor,
  type AnchorPosition,
  getAnchorDirection,
  DEFAULT_EDGE_COLOR,
  getGroupElements,
  getElementOrGroupBounds,
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
 * Calculate offset for duplicating in a direction based on bounds
 */
const getDuplicateOffsetFromBounds = (
  position: AnchorPosition,
  bounds: { x: number; y: number; width: number; height: number },
  gap: number = 100,
): { x: number; y: number } => {
  const direction = getAnchorDirection(position);
  
  return {
    x: direction.dx * (bounds.width + gap),
    y: direction.dy * (bounds.height + gap),
  };
};

/**
 * Duplicate a shape (or group of shapes) and create an edge to it
 */
export const duplicateShapeWithEdge = (
  sourceElement: ExcalidrawBindableElement,
  sourceAnchor: ShapeAnchor,
  appState: AppState,
  scene: Scene,
  allElements: readonly NonDeletedExcalidrawElement[],
): { newElements: ExcalidrawElement[]; edge: ExcalidrawElbowArrowElement } => {
  const elementsMap = arrayToMap(allElements);
  
  // Get all elements in the group (or just the single element)
  const groupElements = getGroupElements(sourceElement, allElements);
  
  // Get the bounds of the entire group
  const bounds = getElementOrGroupBounds(sourceElement, allElements, elementsMap);
  
  // Calculate offset for new elements
  const offset = getDuplicateOffsetFromBounds(sourceAnchor.position, bounds);
  
  // Generate new group ID mappings for the duplicated group
  const groupIdMap = new Map<string, string>();
  if (groupElements.length > 1) {
    // Get all unique groupIds from the group
    const allGroupIds = new Set<string>();
    for (const el of groupElements) {
      el.groupIds?.forEach(gid => allGroupIds.add(gid));
    }
    // Create new IDs for each group
    allGroupIds.forEach(oldId => groupIdMap.set(oldId, randomId()));
  }
  
  // Duplicate all elements in the group
  const newElements: ExcalidrawElement[] = [];
  let firstBindableElement: ExcalidrawBindableElement | null = null;
  
  for (const element of groupElements) {
    // Deep copy the element
    const duplicated = deepCopyElement(element);
    
    // Assign new ID and update timestamp
    duplicated.id = randomId();
    duplicated.updated = getUpdatedTimestamp();
    
    // Apply offset position
    duplicated.x = element.x + offset.x;
    duplicated.y = element.y + offset.y;
    
    // Update groupIds with new IDs
    if (duplicated.groupIds && duplicated.groupIds.length > 0) {
      duplicated.groupIds = duplicated.groupIds.map((gid: string) => 
        groupIdMap.get(gid) || gid
      );
    }
    
    newElements.push(duplicated);
    
    // Track the first bindable element for the edge connection
    if (!firstBindableElement && (duplicated.type === "rectangle" || duplicated.type === "ellipse" || duplicated.type === "diamond" || duplicated.type === "image")) {
      firstBindableElement = duplicated as ExcalidrawBindableElement;
    }
  }
  
  // If no bindable element found, use the first element
  if (!firstBindableElement && newElements.length > 0) {
    firstBindableElement = newElements[0] as ExcalidrawBindableElement;
  }
  
  // Calculate new bounds for target anchor
  const newBounds = {
    x: bounds.x + offset.x,
    y: bounds.y + offset.y,
    width: bounds.width,
    height: bounds.height,
  };
  
  // Calculate target anchor (opposite side of the new group bounds)
  const targetPosition = getOppositeAnchorPosition(sourceAnchor.position);
  const targetAnchor: ShapeAnchor = {
    position: targetPosition,
    x: newBounds.x + (targetPosition === "right" ? newBounds.width : targetPosition === "left" ? 0 : newBounds.width / 2),
    y: newBounds.y + (targetPosition === "bottom" ? newBounds.height : targetPosition === "top" ? 0 : newBounds.height / 2),
    elementId: firstBindableElement?.id || newElements[0].id,
  };
  
  // Create edge from source anchor to the new group
  const edge = createEdgeBetweenAnchors(
    sourceAnchor,
    targetAnchor,
    sourceElement,
    firstBindableElement || (newElements[0] as ExcalidrawBindableElement),
    appState,
    scene,
  );
  
  return { newElements, edge };
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
