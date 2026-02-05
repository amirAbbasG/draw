/**
 * Shape Library Utility
 * Provides library shapes for the edge connector shape selector
 */

import { randomId, getUpdatedTimestamp } from "@excalidraw/common";
import type { ExcalidrawElement, ExcalidrawLinearElement } from "@excalidraw/element/types";

// Import library data
// eslint-disable-next-line @typescript-eslint/no-var-requires
const basicShapesLibrary = require("./basic-shapes.json") as { library: ExcalidrawElement[][] };

// Shape definition from library
export interface LibraryShapeDefinition {
  name: string;
  index: number; // Index in the library array
  icon: string; // SVG icon for display
}

// Library shape definitions with icons and indices
// Based on actual basic-shapes.json library structure (verified by inspection)
// Index 0-7: Basic shapes row 1
// Index 8-11: Trapezoids row
// Index 12-15: Stars row
// Index 16: Heart, 17: Cross, 18-19: Arrows
// Index 20: Lightning, 21: Crescent, 22: Boat
// Index 23: Circle (ellipse)
export const LIBRARY_SHAPES: LibraryShapeDefinition[] = [
  // Row 1: Basic triangles and polygons
  { name: "Right Triangle", index: 0, icon: "right-triangle" },
  { name: "Triangle", index: 1, icon: "triangle" },
  { name: "Rounded Rectangle", index: 2, icon: "rounded-rectangle" },
  { name: "Pentagon", index: 3, icon: "pentagon" },
  { name: "Hexagon", index: 4, icon: "hexagon" },
  { name: "Octagon", index: 5, icon: "octagon" },
  { name: "Decagon", index: 6, icon: "decagon" },
  { name: "Dodecagon", index: 7, icon: "dodecagon" },
  // Row 2: Trapezoids and parallelograms
  { name: "Trapezoid", index: 8, icon: "trapezoid" },
  { name: "Parallelogram", index: 9, icon: "parallelogram" },
  { name: "Chevron", index: 10, icon: "chevron" },
  { name: "Notched Chevron", index: 11, icon: "notched-chevron" },
  // Row 3: Teardrop and stars
  { name: "Teardrop", index: 12, icon: "teardrop" },
  { name: "4-Point Star", index: 13, icon: "star-4" },
  { name: "5-Point Star", index: 14, icon: "star-5" },
  { name: "6-Point Star", index: 15, icon: "star-6" },
  // Row 4: Heart and cross
  { name: "Heart", index: 16, icon: "heart" },
  { name: "Cross", index: 17, icon: "cross" },
  // Row 5: Arrows (indices 18-19)
  { name: "Arrow Up", index: 18, icon: "arrow-up" },
  { name: "Arrow Down", index: 19, icon: "arrow-down" },
  // Row 6: Special shapes
  { name: "Lightning", index: 20, icon: "lightning" },
  { name: "Crescent Moon", index: 21, icon: "crescent" },
  { name: "Boat", index: 22, icon: "boat" },
];

// Built-in Excalidraw shapes (not from library)
export const BUILTIN_SHAPES = [
  { name: "Rectangle", type: "rectangle" as const, icon: "rectangle" },
  { name: "Ellipse", type: "ellipse" as const, icon: "ellipse" },
  { name: "Diamond", type: "diamond" as const, icon: "diamond" },
];

/**
 * Result from creating a shape from the library
 * Includes both the visual elements and a separate bindable element for edge connections
 */
export interface LibraryShapeResult {
  elements: ExcalidrawElement[];
  bindableElement: ExcalidrawElement; // Rectangle for binding edges
}

/**
 * Calculate the actual visual bounding box for a library element
 * For line elements, this is calculated from the points array
 * For other elements, it uses the element's x, y, width, height
 */
function getElementVisualBounds(element: ExcalidrawElement): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (element.type === "line" && (element as ExcalidrawLinearElement).points) {
    const points = (element as ExcalidrawLinearElement).points;
    let pMinX = Infinity,
      pMinY = Infinity,
      pMaxX = -Infinity,
      pMaxY = -Infinity;

    for (const [px, py] of points) {
      pMinX = Math.min(pMinX, px);
      pMinY = Math.min(pMinY, py);
      pMaxX = Math.max(pMaxX, px);
      pMaxY = Math.max(pMaxY, py);
    }

    // Points are relative to element.x, element.y
    return {
      minX: element.x + pMinX,
      minY: element.y + pMinY,
      maxX: element.x + pMaxX,
      maxY: element.y + pMaxY,
    };
  }

  // For non-line elements, use the element bounds
  return {
    minX: element.x,
    minY: element.y,
    maxX: element.x + element.width,
    maxY: element.y + element.height,
  };
}

/**
 * Get library element by index and create a new instance with offset position
 * Returns the library shape elements AND a transparent rectangle for edge binding
 */
export function createShapeFromLibrary(
  libraryIndex: number,
  x: number,
  y: number,
  width: number = 150,
  height: number = 150,
): LibraryShapeResult | null {
  const library = basicShapesLibrary;

  if (libraryIndex < 0 || libraryIndex >= library.library.length) {
    console.warn(`Invalid library index: ${libraryIndex}`);
    return null;
  }

  const libraryItem = library.library[libraryIndex];
  if (!libraryItem || libraryItem.length === 0) {
    return null;
  }

  // Create a group ID for all elements
  const groupId = randomId();

  // Clone and transform each element in the library item
  const newElements: ExcalidrawElement[] = [];

  // First, calculate the ACTUAL visual bounding box of all elements
  // For line elements, we need to look at the points, not just width/height
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const element of libraryItem) {
    const bounds = getElementVisualBounds(element);
    minX = Math.min(minX, bounds.minX);
    minY = Math.min(minY, bounds.minY);
    maxX = Math.max(maxX, bounds.maxX);
    maxY = Math.max(maxY, bounds.maxY);
  }

  const origWidth = maxX - minX;
  const origHeight = maxY - minY;

  // Calculate scale factors
  const scaleX = width / origWidth;
  const scaleY = height / origHeight;

  for (const element of libraryItem) {
    if (element.type === "line" && (element as ExcalidrawLinearElement).points) {
      // For line elements, we need to:
      // 1. Get the visual bounds from points
      // 2. Normalize the points so they start from the new position
      // 3. Scale the points

      const points = (element as ExcalidrawLinearElement).points;

      // Find the min point values
      let pMinX = Infinity,
        pMinY = Infinity;
      for (const [px, py] of points) {
        pMinX = Math.min(pMinX, px);
        pMinY = Math.min(pMinY, py);
      }

      // Calculate where this element's visual content starts relative to the overall bounding box
      const visualStartX = element.x + pMinX;
      const visualStartY = element.y + pMinY;
      const relX = visualStartX - minX;
      const relY = visualStartY - minY;

      // Normalize and scale points (shift so min point is at 0,0, then scale)
      const scaledPoints = points.map(([px, py]) => [(px - pMinX) * scaleX, (py - pMinY) * scaleY]);

      // Create new element positioned correctly
      const newElement = {
        ...element,
        id: randomId(),
        x: x + relX * scaleX,
        y: y + relY * scaleY,
        width: element.width * scaleX,
        height: element.height * scaleY,
        points: scaledPoints as [number, number][],
        updated: getUpdatedTimestamp(),
        version: 1,
        versionNonce: Math.floor(Math.random() * 1000000000),
        groupIds: [groupId],
      };

      newElements.push(newElement as ExcalidrawElement);
    } else {
      // For non-line elements
      const relX = element.x - minX;
      const relY = element.y - minY;

      const newElement = {
        ...element,
        id: randomId(),
        x: x + relX * scaleX,
        y: y + relY * scaleY,
        width: element.width * scaleX,
        height: element.height * scaleY,
        updated: getUpdatedTimestamp(),
        version: 1,
        versionNonce: Math.floor(Math.random() * 1000000000),
        groupIds: [groupId],
      };

      newElements.push(newElement as ExcalidrawElement);
    }
  }

  // Create a transparent rectangle that covers the shape for edge binding
  // This rectangle will be the bindable element
  const bindableRect: ExcalidrawElement = {
    id: randomId(),
    type: "rectangle",
    x: x,
    y: y,
    width: width,
    height: height,
    angle: 0,
    strokeColor: "transparent",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 0,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 0, // Fully transparent
    groupIds: [groupId],
    frameId: null,
    index: null,
    roundness: null,
    seed: Math.floor(Math.random() * 1000000000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 1000000000),
    isDeleted: false,
    boundElements: null,
    updated: getUpdatedTimestamp(),
    link: null,
    locked: false,
  } as ExcalidrawElement;

  return {
    elements: [bindableRect, ...newElements], // Bindable rect first, then visual elements
    bindableElement: bindableRect,
  };
}

/**
 * Get shape icon SVG by icon name
 */
export function getShapeIconSvg(iconName: string): string {
  const svgStart = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">';
  const svgEnd = '</svg>';
  
  switch (iconName) {
    case "rectangle":
      return `${svgStart}<rect x="3" y="3" width="18" height="18" rx="1" fill="#ced4da" />${svgEnd}`;
    case "rounded-rectangle":
      return `${svgStart}<rect x="3" y="3" width="18" height="18" rx="4" fill="#ced4da" />${svgEnd}`;
    case "ellipse":
      return `${svgStart}<ellipse cx="12" cy="12" rx="9" ry="9" fill="#ced4da" />${svgEnd}`;
    case "diamond":
      return `${svgStart}<path d="M12 2 L22 12 L12 22 L2 12 Z" fill="#ced4da" />${svgEnd}`;
    case "right-triangle":
      return `${svgStart}<path d="M3 21 L21 21 L3 3 Z" fill="#ced4da" />${svgEnd}`;
    case "triangle":
      return `${svgStart}<path d="M12 3 L21 21 L3 21 Z" fill="#ced4da" />${svgEnd}`;
    case "pentagon":
      return `${svgStart}<path d="M12 2 L22 9 L18 21 L6 21 L2 9 Z" fill="#ced4da" />${svgEnd}`;
    case "hexagon":
      return `${svgStart}<path d="M12 2 L21 6 L21 18 L12 22 L3 18 L3 6 Z" fill="#ced4da" />${svgEnd}`;
    case "octagon":
      return `${svgStart}<path d="M8 2 L16 2 L22 8 L22 16 L16 22 L8 22 L2 16 L2 8 Z" fill="#ced4da" />${svgEnd}`;
    case "decagon":
      return `${svgStart}<circle cx="12" cy="12" r="9" fill="#ced4da" />${svgEnd}`;
    case "dodecagon":
      return `${svgStart}<circle cx="12" cy="12" r="9" fill="#ced4da" />${svgEnd}`;
    case "trapezoid":
      return `${svgStart}<path d="M5 21 L19 21 L22 3 L2 3 Z" fill="#ced4da" />${svgEnd}`;
    case "parallelogram":
      return `${svgStart}<path d="M6 3 L22 3 L18 21 L2 21 Z" fill="#ced4da" />${svgEnd}`;
    case "chevron":
      return `${svgStart}<path d="M2 3 L16 3 L22 12 L16 21 L2 21 L8 12 Z" fill="#ced4da" />${svgEnd}`;
    case "notched-chevron":
      return `${svgStart}<path d="M2 3 L16 3 L22 12 L16 21 L2 21 L6 12 Z" fill="#ced4da" />${svgEnd}`;
    case "teardrop":
      return `${svgStart}<path d="M12 2 C12 2 20 10 20 14 A8 8 0 1 1 4 14 C4 10 12 2 12 2 Z" fill="#ced4da" />${svgEnd}`;
    case "star-4":
      return `${svgStart}<path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#ced4da" />${svgEnd}`;
    case "star-5":
      return `${svgStart}<path d="M12 2 L14 9 L21 9 L16 14 L18 21 L12 17 L6 21 L8 14 L3 9 L10 9 Z" fill="#ced4da" />${svgEnd}`;
    case "star-6":
      return `${svgStart}<path d="M12 2 L14 8 L20 6 L16 12 L20 18 L14 16 L12 22 L10 16 L4 18 L8 12 L4 6 L10 8 Z" fill="#ced4da" />${svgEnd}`;
    case "heart":
      return `${svgStart}<path d="M12 21 C12 21 4 14 4 9 A4 4 0 0 1 12 9 A4 4 0 0 1 20 9 C20 14 12 21 12 21 Z" fill="#ced4da" />${svgEnd}`;
    case "cross":
      return `${svgStart}<path d="M8 2 L16 2 L16 8 L22 8 L22 16 L16 16 L16 22 L8 22 L8 16 L2 16 L2 8 L8 8 Z" fill="#ced4da" />${svgEnd}`;
    case "arrow-up":
      return `${svgStart}<path d="M12 2 L20 10 L16 10 L16 22 L8 22 L8 10 L4 10 Z" fill="#ced4da" />${svgEnd}`;
    case "arrow-down":
      return `${svgStart}<path d="M12 22 L20 14 L16 14 L16 2 L8 2 L8 14 L4 14 Z" fill="#ced4da" />${svgEnd}`;
    case "lightning":
      return `${svgStart}<path d="M13 2 L4 14 L11 14 L9 22 L20 10 L13 10 Z" fill="#ced4da" />${svgEnd}`;
    case "crescent":
      return `${svgStart}<path d="M18 12 A8 8 0 1 1 6 4 A6 6 0 0 0 18 12 Z" fill="#ced4da" />${svgEnd}`;
    case "boat":
      return `${svgStart}<path d="M3 18 L12 22 L21 18 L18 12 L6 12 Z" fill="#ced4da" />${svgEnd}`;
    default:
      return `${svgStart}<rect x="3" y="3" width="18" height="18" rx="1" fill="#ced4da" />${svgEnd}`;
  }
}

/**
 * Get the total number of shapes available in the library
 */
export function getLibraryShapeCount(): number {
  return basicShapesLibrary.library.length;
}
