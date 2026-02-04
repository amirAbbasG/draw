import { KEYS } from "@excalidraw/common";

import type { AppClassProperties } from "../types";
import {
  ArrowIcon,
  DiamondIcon,
  EllipseIcon,
  EraserIcon,
  FreedrawIcon, HexagonIcon,
  ImageIcon,
  LineIcon, PentagonIcon,
  RectangleIcon,
  SelectionIcon,
  TextIcon, TriangleIcon,
} from "./icons";

export const SHAPES = [
  {
    icon: SelectionIcon,
    value: "selection",
    key: KEYS.V,
    numericKey: null,
    fillable: true,
  },
  {
    icon: ImageIcon,
    value: "image",
    key: KEYS["I"],
    numericKey:  null,
    fillable: false,
  },
  {
    icon: TextIcon,
    value: "text",
    key: KEYS.T,
    numericKey: null,
    fillable: false,
  },

  {
    icon: FreedrawIcon,
    value: "freedraw",
    key: [KEYS.P, KEYS.X],
    numericKey: KEYS["1"],
    fillable: false,
  },
  {
    icon: RectangleIcon,
    value: "rectangle",
    key: KEYS.R,
    numericKey: KEYS["2"],
    fillable: true,
  },
  {
    icon: DiamondIcon,
    value: "diamond",
    key: KEYS.D,
    numericKey: KEYS["3"],
    fillable: true,
  },

  {
    icon: EllipseIcon,
    value: "ellipse",
    key: KEYS.O,
    numericKey: KEYS["4"],
    fillable: true,
  },
  {
    value: "triangle",
    icon: TriangleIcon, // You'll need to import or create this icon
    key: null,
    numericKey: KEYS["5"], // or another numeric key
    fillable: true,
  },
  {
    icon: PentagonIcon, // Create this icon
    value: "pentagon",
    key: null,
    numericKey: KEYS["6"], // or assign a key
    fillable: true,
  },
  {
    icon: HexagonIcon, // Create this icon
    value: "hexagon",
    key: null,
    numericKey: KEYS["7"],
    fillable: true,
  },
  {
    icon: ArrowIcon,
    value: "arrow",
    key: KEYS.A,
    numericKey: KEYS["8"],
    fillable: true,
  },
  {
    icon: LineIcon,
    value: "line",
    key: KEYS.L,
    numericKey: KEYS["9"],
    fillable: true,
  },
  {
    icon: EraserIcon,
    value: "eraser",
    key: KEYS.E,
    numericKey: KEYS["0"],
    fillable: false,
  },
] as const;

export const getToolbarTools = (app: AppClassProperties) => {
  return app.state.preferredSelectionTool.type === "lasso"
    ? ([
        {
          value: "lasso",
          icon: SelectionIcon,
          key: KEYS.V,
          numericKey: KEYS["1"],
          fillable: true,
        },
        ...SHAPES.slice(1),
      ] as const)
    : SHAPES;
};

export const findShapeByKey = (key: string, app: AppClassProperties) => {
  const shape = getToolbarTools(app).find((shape, _index) => {
    return (
      (shape.numericKey != null && key === shape.numericKey.toString()) ||
      (shape.key &&
        (typeof shape.key === "string"
          ? shape.key === key
          : (shape.key as readonly string[]).includes(key)))
    );
  });
  return shape?.value || null;
};
