/**
 * Edge Connector Module
 * Provides functionality for creating and managing edge connections between shapes
 */

import { pointFrom, pointRotateRads, type GlobalPoint, type LocalPoint, type Radians } from "@excalidraw/math";
import type { AppState } from "../types";
import type {
  ExcalidrawElement,
  ExcalidrawBindableElement,
  ExcalidrawArrowElement,
  NonDeletedExcalidrawElement,
  ElementsMap,
  NonDeletedSceneElementsMap,
} from "@excalidraw/element/types";
import { isBindableElement } from "@excalidraw/element";
import { getElementBounds, getCommonBounds, type Bounds } from "@excalidraw/element/bounds";
import { arrayToMap } from "@excalidraw/common";

export type AnchorPosition = "top" | "right" | "bottom" | "left";

export interface ShapeAnchor {
  position: AnchorPosition;
  x: number;
  y: number;
  elementId: string;
}

export interface EdgeConnectionState {
  isDrawing: boolean;
  sourceAnchor: ShapeAnchor | null;
  currentPoint: GlobalPoint | null;
  targetElement: ExcalidrawBindableElement | null;
  targetAnchor: ShapeAnchor | null;
}

export interface HoveredAnchorState {
  elementId: string;
  position: AnchorPosition;
  anchor: ShapeAnchor;
}

// Constants
export const ANCHOR_RADIUS = 6;
export const ANCHOR_HOVER_RADIUS = 10;
export const ANCHOR_HIT_RADIUS = 12;

/**
 * Calculate anchor points for a bindable element
 */
export const getElementAnchors = (
  element: ExcalidrawBindableElement,
  elementsMap: ElementsMap,
): ShapeAnchor[] => {
  const { x, y, width, height, angle } = element;
  
  // Calculate center
  const cx = x + width / 2;
  const cy = y + height / 2;
  
  // Calculate anchor positions (before rotation)
  const anchors: ShapeAnchor[] = [
    { position: "top", x: cx, y: y, elementId: element.id },
    { position: "right", x: x + width, y: cy, elementId: element.id },
    { position: "bottom", x: cx, y: y + height, elementId: element.id },
    { position: "left", x: x, y: cy, elementId: element.id },
  ];
  
  // Apply rotation if needed
  if (angle !== 0) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    return anchors.map((anchor) => {
      const dx = anchor.x - cx;
      const dy = anchor.y - cy;
      return {
        ...anchor,
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos,
      };
    });
  }
  
  return anchors;
};

/**
 * Get anchors for an element based on its LOCAL (unrotated) bounds, then rotate them
 * This makes anchors appear at the center of the rotated edges, like selection handles
 */
export const getElementAnchorsWithGroupBounds = (
  element: NonDeletedExcalidrawElement,
  elements: readonly NonDeletedExcalidrawElement[],
  elementsMap?: ElementsMap,
): ShapeAnchor[] => {
  const _elementsMap = elementsMap || arrayToMap(elements);
  const groupElements = getGroupElements(element, elements);
  
  // For single element, use element's own coordinates and angle
  if (groupElements.length === 1) {
    const { x, y, width, height, angle } = element;
    const cx = x + width / 2;
    const cy = y + height / 2;
    
    // Anchors at center of each side BEFORE rotation
    const unrotatedAnchors = [
      { position: "top" as AnchorPosition, x: cx, y: y },
      { position: "right" as AnchorPosition, x: x + width, y: cy },
      { position: "bottom" as AnchorPosition, x: cx, y: y + height },
      { position: "left" as AnchorPosition, x: x, y: cy },
    ];
    
    // If rotated, apply rotation to each anchor point
    if (angle !== 0) {
      return unrotatedAnchors.map((anchor) => {
        const rotated = pointRotateRads(
          pointFrom(anchor.x, anchor.y),
          pointFrom(cx, cy),
          angle as Radians,
        );
        return {
          position: anchor.position,
          x: rotated[0],
          y: rotated[1],
          elementId: element.id,
        };
      });
    }
    
    return unrotatedAnchors.map(anchor => ({
      ...anchor,
      elementId: element.id,
    }));
  }
  
  // For grouped elements, calculate group bounds (already axis-aligned from getCommonBounds)
  // Groups don't rotate as a whole in excalidraw, so use axis-aligned bounds
  const bounds = getElementOrGroupBounds(element, elements, _elementsMap);
  
  return [
    { position: "top", x: bounds.x + bounds.width / 2, y: bounds.y, elementId: element.id },
    { position: "right", x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, elementId: element.id },
    { position: "bottom", x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, elementId: element.id },
    { position: "left", x: bounds.x, y: bounds.y + bounds.height / 2, elementId: element.id },
  ];
};

/**
 * Find anchor at given coordinates (considers groups and rotation)
 */
export const getAnchorAtPosition = (
  x: number,
  y: number,
  elements: readonly NonDeletedExcalidrawElement[],
  elementsMap: ElementsMap,
  zoom: number,
): ShapeAnchor | null => {
  const hitRadius = ANCHOR_HIT_RADIUS / zoom;
  const visitedGroups = new Set<string>();
  
  for (const element of elements) {
    if (!isBindableElement(element)) continue;
    
    // Check if element is part of a group we've already checked
    const outermostGroupId = element.groupIds?.[element.groupIds.length - 1];
    if (outermostGroupId && visitedGroups.has(outermostGroupId)) {
      continue;
    }
    
    // Get anchors based on group bounds (with proper rotation handling)
    const anchors = getElementAnchorsWithGroupBounds(element, elements, elementsMap);
    
    for (const anchor of anchors) {
      const distance = Math.sqrt(
        Math.pow(x - anchor.x, 2) + Math.pow(y - anchor.y, 2)
      );
      
      if (distance <= hitRadius) {
        if (outermostGroupId) {
          visitedGroups.add(outermostGroupId);
        }
        return anchor;
      }
    }
  }
  
  return null;
};

/**
 * Find the closest anchor to a point on an element
 */
export const getClosestAnchor = (
  x: number,
  y: number,
  element: ExcalidrawBindableElement,
  elementsMap: ElementsMap,
): ShapeAnchor => {
  const anchors = getElementAnchors(element, elementsMap);
  
  let closestAnchor = anchors[0];
  let minDistance = Infinity;
  
  for (const anchor of anchors) {
    const distance = Math.sqrt(
      Math.pow(x - anchor.x, 2) + Math.pow(y - anchor.y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestAnchor = anchor;
    }
  }
  
  return closestAnchor;
};

/**
 * Get direction vector for an anchor position
 */
export const getAnchorDirection = (
  position: AnchorPosition,
): { dx: number; dy: number } => {
  switch (position) {
    case "top":
      return { dx: 0, dy: -1 };
    case "right":
      return { dx: 1, dy: 0 };
    case "bottom":
      return { dx: 0, dy: 1 };
    case "left":
      return { dx: -1, dy: 0 };
  }
};

/**
 * Calculate offset position for duplicating a shape in a direction
 */
export const getDuplicateOffset = (
  position: AnchorPosition,
  sourceElement: ExcalidrawBindableElement,
  gap: number = 100,
): { x: number; y: number } => {
  const direction = getAnchorDirection(position);
  
  return {
    x: sourceElement.x + direction.dx * (sourceElement.width + gap),
    y: sourceElement.y + direction.dy * (sourceElement.height + gap),
  };
};

/**
 * Check if point is inside an element's bounding box
 */
export const isPointInElement = (
  x: number,
  y: number,
  element: ExcalidrawElement,
  padding: number = 0,
): boolean => {
  return (
    x >= element.x - padding &&
    x <= element.x + element.width + padding &&
    y >= element.y - padding &&
    y <= element.y + element.height + padding
  );
};

/**
 * Get all elements in the same group as the given element
 */
export const getGroupElements = (
  element: NonDeletedExcalidrawElement,
  elements: readonly NonDeletedExcalidrawElement[],
): NonDeletedExcalidrawElement[] => {
  if (!element.groupIds || element.groupIds.length === 0) {
    return [element];
  }
  
  // Get outermost group
  const outermostGroupId = element.groupIds[element.groupIds.length - 1];
  return elements.filter(el => 
    el.groupIds && el.groupIds.includes(outermostGroupId)
  );
};

/**
 * Get the bounding box of an element or its group
 * Uses proper bounds calculation that accounts for rotation
 */
export const getElementOrGroupBounds = (
  element: NonDeletedExcalidrawElement,
  elements: readonly NonDeletedExcalidrawElement[],
  elementsMap?: ElementsMap,
): { x: number; y: number; width: number; height: number } => {
  const _elementsMap = elementsMap || arrayToMap(elements);
  
  // Get group elements
  const groupElements = getGroupElements(element, elements);
  
  if (groupElements.length === 1) {
    // Single element - use proper bounds calculation (handles rotation)
    const [minX, minY, maxX, maxY] = getElementBounds(element, _elementsMap);
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
  
  // Multiple elements (group) - use getCommonBounds which handles rotation
  const [minX, minY, maxX, maxY] = getCommonBounds(groupElements, _elementsMap);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * Check if point is in element or its group bounds (with proper rotation handling)
 */
export const isPointInElementOrGroup = (
  x: number,
  y: number,
  element: NonDeletedExcalidrawElement,
  elements: readonly NonDeletedExcalidrawElement[],
  elementsMap?: ElementsMap,
  padding: number = 0,
): boolean => {
  const bounds = getElementOrGroupBounds(element, elements, elementsMap);
  return (
    x >= bounds.x - padding &&
    x <= bounds.x + bounds.width + padding &&
    y >= bounds.y - padding &&
    y <= bounds.y + bounds.height + padding
  );
};

/**
 * Find element at position (considers groups and rotation)
 */
export const getElementAtPosition = (
  x: number,
  y: number,
  elements: readonly NonDeletedExcalidrawElement[],
  excludeIds: Set<string> = new Set(),
  elementsMap?: ElementsMap,
): NonDeletedExcalidrawElement | null => {
  // Track visited group IDs to avoid returning multiple elements from same group
  const visitedGroups = new Set<string>();
  const _elementsMap = elementsMap || arrayToMap(elements);
  
  // Search from top to bottom (reverse order)
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    if (excludeIds.has(element.id)) continue;
    if (!isBindableElement(element)) continue;
    
    // Check if element is part of a group we've already checked
    const outermostGroupId = element.groupIds?.[element.groupIds.length - 1];
    if (outermostGroupId && visitedGroups.has(outermostGroupId)) {
      continue;
    }
    
    // Check if point is in element or its group bounds (with rotation handling)
    if (isPointInElementOrGroup(x, y, element, elements, _elementsMap)) {
      if (outermostGroupId) {
        visitedGroups.add(outermostGroupId);
      }
      return element;
    }
  }
  
  return null;
};

// Edge colors for selection
export const EDGE_COLORS = [
  "#1e1e1e", // Black
  "#e03131", // Red
  "#2f9e44", // Green
  "#1971c2", // Blue
  "#f08c00", // Orange
  "#6741d9", // Purple
  "#099268", // Teal
  "#e64980", // Pink
];

export const DEFAULT_EDGE_COLOR = "#1e1e1e";

// Re-export types and utilities
export * from "./types";
export * from "./edgeCreator";
export * from "./renderAnchors";
export * from "./useEdgeConnector";
