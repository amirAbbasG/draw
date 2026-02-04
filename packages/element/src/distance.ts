import {
  curvePointDistance,
  distanceToLineSegment,
  LocalPoint,
  pointDistance,
  pointFrom,
  pointRotateRads,
} from "@excalidraw/math";
import type { GlobalPoint, Radians } from "@excalidraw/math";
import { ellipse, ellipseDistanceFromPoint } from "@excalidraw/math/ellipse";

import { elementCenterPoint } from "./bounds";
import type {
  ElementsMap,
  ExcalidrawDiamondElement,
  ExcalidrawElement,
  ExcalidrawEllipseElement,
  ExcalidrawFreeDrawElement, ExcalidrawHexagonElement,
  ExcalidrawLinearElement, ExcalidrawPentagonElement,
  ExcalidrawRectanguloidElement,
  ExcalidrawTriangleElement,
} from "./types";
import {
  deconstructDiamondElement,
  deconstructLinearOrFreeDrawElement,
  deconstructRectanguloidElement,
} from "./utils";

export const distanceToElement = (
  element: ExcalidrawElement,
  elementsMap: ElementsMap,
  p: GlobalPoint,
): number => {
  switch (element.type) {
    case "selection":
    case "rectangle":
    case "image":
    case "text":
    case "iframe":
    case "embeddable":
    case "frame":
    case "magicframe":
      return distanceToRectanguloidElement(element, elementsMap, p);
    case "triangle":
      return distanceToTriangleElement(p, element);
    case "pentagon":
      return distanceToPolygonElement(p, element, 5);
    case "hexagon":
      return distanceToPolygonElement(p, element, 6);
    case "diamond":
      return distanceToDiamondElement(element, elementsMap, p);
    case "ellipse":
      return distanceToEllipseElement(element, elementsMap, p);
    case "line":
    case "arrow":
    case "freedraw":
      return distanceToLinearOrFreeDraElement(element, p);
  }
};

/**
 * Returns the distance of a point and the provided rectangular-shaped element,
 * accounting for roundness and rotation
 *
 * @param element The rectanguloid element
 * @param p The point to consider
 * @returns The eucledian distance to the outline of the rectanguloid element
 */
const distanceToRectanguloidElement = (
  element: ExcalidrawRectanguloidElement,
  elementsMap: ElementsMap,
  p: GlobalPoint,
) => {
  const center = elementCenterPoint(element, elementsMap);
  // To emulate a rotated rectangle we rotate the point in the inverse angle
  // instead. It's all the same distance-wise.
  const rotatedPoint = pointRotateRads(p, center, -element.angle as Radians);

  // Get the element's building components we can test against
  const [sides, corners] = deconstructRectanguloidElement(element);

  return Math.min(
    ...sides.map(s => distanceToLineSegment(rotatedPoint, s)),
    ...corners
      .map(a => curvePointDistance(a, rotatedPoint))
      .filter((d): d is number => d !== null),
  );
};

/**
 * Returns the distance of a point and the provided diamond element, accounting
 * for roundness and rotation
 *
 * @param element The diamond element
 * @param p The point to consider
 * @returns The eucledian distance to the outline of the diamond
 */
const distanceToDiamondElement = (
  element: ExcalidrawDiamondElement,
  elementsMap: ElementsMap,
  p: GlobalPoint,
): number => {
  const center = elementCenterPoint(element, elementsMap);

  // Rotate the point to the inverse direction to simulate the rotated diamond
  // points. It's all the same distance-wise.
  const rotatedPoint = pointRotateRads(p, center, -element.angle as Radians);

  const [sides, curves] = deconstructDiamondElement(element);

  return Math.min(
    ...sides.map(s => distanceToLineSegment(rotatedPoint, s)),
    ...curves
      .map(a => curvePointDistance(a, rotatedPoint))
      .filter((d): d is number => d !== null),
  );
};

const distanceToTriangleElement = (
  p: LocalPoint | GlobalPoint,
  element: ExcalidrawTriangleElement,
) => {
  const cx = element.x + element.width / 2;
  const cy = element.y + element.height / 2;
  const center = pointFrom(cx, cy);

  const top = pointRotateRads(
    pointFrom(element.x + element.width / 2, element.y),
    center,
    element.angle,
  );
  const bottomLeft = pointRotateRads(
    pointFrom(element.x, element.y + element.height),
    center,
    element.angle,
  );
  const bottomRight = pointRotateRads(
    pointFrom(element.x + element.width, element.y + element.height),
    center,
    element.angle,
  );

  const pt: [number, number] = [p[0], p[1]];

  const sign = (
    a: [number, number],
    b: [number, number],
    c: [number, number],
  ) => (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1]);

  const isPointInTriangle = (
    ptv: [number, number],
    v1: [number, number],
    v2: [number, number],
    v3: [number, number],
  ) => {
    const d1 = sign(ptv, v1, v2);
    const d2 = sign(ptv, v2, v3);
    const d3 = sign(ptv, v3, v1);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos); // true if all same sign or zero (on edge)
  };

  const a: [number, number] = [top[0], top[1]];
  const b: [number, number] = [bottomLeft[0], bottomLeft[1]];
  const c: [number, number] = [bottomRight[0], bottomRight[1]];

  if (isPointInTriangle(pt, a, b, c)) {
    return 0;
  }

  const distToSegment = (
    p0: [number, number],
    s1: [number, number],
    s2: [number, number],
  ) => {
    const dx = s2[0] - s1[0];
    const dy = s2[1] - s1[1];
    if (dx === 0 && dy === 0) {
      return pointDistance(pointFrom(p0[0], p0[1]), pointFrom(s1[0], s1[1]));
    }
    const t =
      ((p0[0] - s1[0]) * dx + (p0[1] - s1[1]) * dy) / (dx * dx + dy * dy);
    const tt = Math.max(0, Math.min(1, t));
    const proj: [number, number] = [s1[0] + tt * dx, s1[1] + tt * dy];
    return pointDistance(pointFrom(p0[0], p0[1]), pointFrom(proj[0], proj[1]));
  };

  return Math.min(
    distToSegment(pt, a, b),
    distToSegment(pt, b, c),
    distToSegment(pt, c, a),
  );
};

/**
 * Returns the distance of a point and the provided ellipse element, accounting
 * for roundness and rotation
 *
 * @param element The ellipse element
 * @param p The point to consider
 * @returns The eucledian distance to the outline of the ellipse
 */
const distanceToEllipseElement = (
  element: ExcalidrawEllipseElement,
  elementsMap: ElementsMap,
  p: GlobalPoint,
): number => {
  const center = elementCenterPoint(element, elementsMap);
  return ellipseDistanceFromPoint(
    // Instead of rotating the ellipse, rotate the point to the inverse angle
    pointRotateRads(p, center, -element.angle as Radians),
    ellipse(center, element.width / 2, element.height / 2),
  );
};

const distanceToLinearOrFreeDraElement = (
  element: ExcalidrawLinearElement | ExcalidrawFreeDrawElement,
  p: GlobalPoint,
) => {
  const [lines, curves] = deconstructLinearOrFreeDrawElement(element);
  return Math.min(
    ...lines.map(s => distanceToLineSegment(p, s)),
    ...curves.map(a => curvePointDistance(a, p)),
  );
};

const distanceToPolygonElement = (
    p: LocalPoint | GlobalPoint,
    element: ExcalidrawPentagonElement | ExcalidrawHexagonElement,
    numSides: number,
) => {
  const { width, height, x, y, angle } = element;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const center = pointFrom(cx, cy);
  const radius = Math.min(width, height) / 2;

  // Generate vertices
  const vertices: [number, number][] = [];
  for (let i = 0; i < numSides; i++) {
    const a = (Math.PI * 2 * i) / numSides - Math.PI / 2;
    const vx = cx + radius * Math.cos(a) * (width / (radius * 2));
    const vy = cy + radius * Math.sin(a) * (height / (radius * 2));
    const [rx, ry] = pointRotateRads(pointFrom(vx, vy), center, angle);
    vertices.push([rx, ry]);
  }

  const pt: [number, number] = [p[0], p[1]];

  // Check if inside polygon
  const sign = (a: [number, number], b: [number, number], c: [number, number]) =>
      (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1]);

  // Simple point-in-polygon using ray casting
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i][0], yi = vertices[i][1];
    const xj = vertices[j][0], yj = vertices[j][1];
    if (((yi > pt[1]) !== (yj > pt[1])) &&
        (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  if (inside) return 0;

  // Calculate distance to each edge
  const distToSegment = (p0: [number, number], s1: [number, number], s2: [number, number]) => {
    const dx = s2[0] - s1[0];
    const dy = s2[1] - s1[1];
    if (dx === 0 && dy === 0) {
      return pointDistance(pointFrom(p0[0], p0[1]), pointFrom(s1[0], s1[1]));
    }
    const t = ((p0[0] - s1[0]) * dx + (p0[1] - s1[1]) * dy) / (dx * dx + dy * dy);
    const tt = Math.max(0, Math.min(1, t));
    const proj: [number, number] = [s1[0] + tt * dx, s1[1] + tt * dy];
    return pointDistance(pointFrom(p0[0], p0[1]), pointFrom(proj[0], proj[1]));
  };

  let minDist = Infinity;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    minDist = Math.min(minDist, distToSegment(pt, vertices[i], vertices[j]));
  }

  return minDist;
};