/**
 * Edge Connector Module
 * Provides functionality for creating and managing edge connections between shapes
 */

import { pointFrom, type GlobalPoint, type LocalPoint } from "@excalidraw/math";
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
 * Find anchor at given coordinates
 */
export const getAnchorAtPosition = (
  x: number,
  y: number,
  elements: readonly NonDeletedExcalidrawElement[],
  elementsMap: ElementsMap,
  zoom: number,
): ShapeAnchor | null => {
  const hitRadius = ANCHOR_HIT_RADIUS / zoom;
  
  for (const element of elements) {
    if (!isBindableElement(element)) continue;
    
    const anchors = getElementAnchors(element, elementsMap);
    
    for (const anchor of anchors) {
      const distance = Math.sqrt(
        Math.pow(x - anchor.x, 2) + Math.pow(y - anchor.y, 2)
      );
      
      if (distance <= hitRadius) {
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
 * Find element at position
 */
export const getElementAtPosition = (
  x: number,
  y: number,
  elements: readonly NonDeletedExcalidrawElement[],
  excludeIds: Set<string> = new Set(),
): NonDeletedExcalidrawElement | null => {
  // Search from top to bottom (reverse order)
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    if (excludeIds.has(element.id)) continue;
    if (!isBindableElement(element)) continue;
    
    if (isPointInElement(x, y, element)) {
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
