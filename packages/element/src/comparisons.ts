import type { ElementOrToolType } from "@excalidraw/excalidraw/types";

export const hasBackground = (type: ElementOrToolType) =>
  type === "rectangle" ||
  type === "iframe" ||
  type === "embeddable" ||
  type === "ellipse" ||
  type === "diamond" ||
  type === "triangle" ||
  type === "pentagon" ||
  type === "hexagon" ;

export const hasStrokeColor = (type: ElementOrToolType) =>
  type === "rectangle" ||
  type === "triangle" ||
  type === "pentagon" ||
  type === "hexagon" ||
  type === "ellipse" ||
  type === "diamond" ||
  type === "freedraw" ||
  type === "arrow" ||
  type === "line" ||
  type === "text";

export const hasStrokeWidth = (type: ElementOrToolType) =>
  type === "rectangle" ||
  type === "triangle" ||
  type === "pentagon" ||
  type === "hexagon" ||
  type === "iframe" ||
  type === "embeddable" ||
  type === "ellipse" ||
  type === "diamond" ||
  type === "freedraw" ||
  type === "arrow" ||
  type === "line";

export const hasStrokeStyle = (type: ElementOrToolType) =>
  type === "rectangle" ||
  type === "triangle" ||
  type === "pentagon" ||
  type === "hexagon" ||
  type === "iframe" ||
  type === "embeddable" ||
  type === "ellipse" ||
  type === "diamond" ||
  type === "arrow" ||
  type === "line";

export const canChangeRoundness = (type: ElementOrToolType) =>
  type === "rectangle" ||
  type === "triangle" ||
  type === "pentagon" ||
  type === "hexagon" ||
  type === "iframe" ||
  type === "embeddable" ||
  type === "line" ||
  type === "diamond" ||
  type === "image";

export const toolIsArrow = (type: ElementOrToolType) => type === "arrow";

export const canHaveArrowheads = (type: ElementOrToolType) => type === "arrow";
