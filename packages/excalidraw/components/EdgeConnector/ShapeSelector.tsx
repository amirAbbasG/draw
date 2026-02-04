import React from "react";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { ShapeAnchor, AnchorPosition } from "../../edgeConnector";
import { QUICK_SHAPES, type QuickShape } from "../../edgeConnector/types";

import "./EdgeConnector.scss";

interface ShapeSelectorProps {
  position: { x: number; y: number };
  anchorPosition: AnchorPosition;
  onSelectShape: (shapeType: ExcalidrawElement["type"]) => void;
  onClose: () => void;
}

// Shape icons SVG paths
const getShapeIcon = (type: ExcalidrawElement["type"]): React.ReactNode => {
  switch (type) {
    case "rectangle":
      return (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      );
    case "ellipse":
      return (
        <svg viewBox="0 0 24 24">
          <ellipse cx="12" cy="12" rx="9" ry="9" />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M12 2 L22 12 L12 22 L2 12 Z" />
        </svg>
      );
    case "triangle":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M12 3 L22 21 L2 21 Z" />
        </svg>
      );
    case "hexagon":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M12 2 L20 6 L20 18 L12 22 L4 18 L4 6 Z" />
        </svg>
      );
    case "pentagon":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M12 2 L22 9 L18 22 L6 22 L2 9 Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      );
  }
};

// Additional shapes
const ALL_SHAPES: Array<{ type: ExcalidrawElement["type"]; label: string }> = [
  { type: "rectangle", label: "Rectangle" },
  { type: "ellipse", label: "Ellipse" },
  { type: "diamond", label: "Diamond" },
  { type: "triangle", label: "Triangle" },
  { type: "hexagon", label: "Hexagon" },
  { type: "pentagon", label: "Pentagon" },
];

// Calculate popup offset based on anchor position
const getPopupOffset = (position: AnchorPosition): { x: number; y: number } => {
  const OFFSET = 20;
  switch (position) {
    case "top":
      return { x: -100, y: -180 };
    case "bottom":
      return { x: -100, y: OFFSET };
    case "left":
      return { x: -220, y: -60 };
    case "right":
      return { x: OFFSET, y: -60 };
  }
};

export const ShapeSelector: React.FC<ShapeSelectorProps> = ({
  position,
  anchorPosition,
  onSelectShape,
  onClose,
}) => {
  const offset = getPopupOffset(anchorPosition);
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };
  
  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleShapeClick = (type: ExcalidrawElement["type"]) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectShape(type);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="shape-selector-backdrop"
        onClick={handleBackdropClick}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        }}
      />
      
      {/* Popup */}
      <div
        className={`shape-selector-popup position-${anchorPosition}`}
        style={{
          left: position.x + offset.x,
          top: position.y + offset.y,
        }}
        onClick={handlePopupClick}
      >
        <div className="shape-selector-header" style={{ 
          fontSize: 12, 
          color: "var(--color-text-secondary, #666)",
          marginBottom: 8,
          fontWeight: 500,
        }}>
          Select shape
        </div>
        <div className="shape-selector-grid">
          {ALL_SHAPES.map((shape) => (
            <button
              key={shape.type}
              className="shape-selector-item"
              onClick={handleShapeClick(shape.type)}
              title={shape.label}
            >
              {getShapeIcon(shape.type)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ShapeSelector;
