import React, { useEffect, useRef } from "react";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AnchorPosition } from "../../edgeConnector";

import "./EdgeConnector.scss";

interface ShapeSelectorProps {
  position: { x: number; y: number };
  anchorPosition: AnchorPosition;
  onSelectShape: (shapeType: ExcalidrawElement["type"]) => void;
  onClose: () => void;
}

// Shape icons SVG paths
const getShapeIcon = (type: string): React.ReactNode => {
  const svgProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  
  switch (type) {
    case "rectangle":
      return (
        <svg {...svgProps}>
          <rect x="3" y="3" width="18" height="18" rx="1" />
        </svg>
      );
    case "roundedRectangle":
      return (
        <svg {...svgProps}>
          <rect x="3" y="3" width="18" height="18" rx="4" />
        </svg>
      );
    case "ellipse":
      return (
        <svg {...svgProps}>
          <ellipse cx="12" cy="12" rx="9" ry="9" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...svgProps}>
          <path d="M12 2 L22 12 L12 22 L2 12 Z" />
        </svg>
      );
    case "triangle":
      return (
        <svg {...svgProps}>
          <path d="M12 3 L22 21 L2 21 Z" />
        </svg>
      );
    case "triangleDown":
      return (
        <svg {...svgProps}>
          <path d="M12 21 L2 3 L22 3 Z" />
        </svg>
      );
    case "hexagon":
      return (
        <svg {...svgProps}>
          <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" />
        </svg>
      );
    case "pentagon":
      return (
        <svg {...svgProps}>
          <path d="M12 2 L22 9 L18 22 L6 22 L2 9 Z" />
        </svg>
      );
    case "parallelogram":
      return (
        <svg {...svgProps}>
          <path d="M6 3 L22 3 L18 21 L2 21 Z" />
        </svg>
      );
    case "trapezoid":
      return (
        <svg {...svgProps}>
          <path d="M5 21 L2 3 L22 3 L19 21 Z" />
        </svg>
      );
    case "cylinder":
      return (
        <svg {...svgProps}>
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5 L4 19 C4 21 8 22 12 22 C16 22 20 21 20 19 L20 5" />
        </svg>
      );
    case "database":
      return (
        <svg {...svgProps}>
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5 L4 19 C4 21 8 22 12 22 C16 22 20 21 20 19 L20 5" />
          <path d="M4 12 C4 14 8 15 12 15 C16 15 20 14 20 12" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...svgProps}>
          <path d="M6 19 C2 19 1 16 3 14 C1 12 2 9 5 9 C5 5 9 4 12 6 C14 3 19 3 20 7 C23 7 24 11 21 13 C24 15 23 19 19 19 Z" />
        </svg>
      );
    case "star":
      return (
        <svg {...svgProps}>
          <path d="M12 2 L14 9 L21 9 L16 14 L18 21 L12 17 L6 21 L8 14 L3 9 L10 9 Z" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...svgProps}>
          <path d="M14 2 L22 12 L14 22 L14 16 L2 16 L2 8 L14 8 Z" />
        </svg>
      );
    case "callout":
      return (
        <svg {...svgProps}>
          <path d="M3 3 L21 3 L21 15 L10 15 L6 21 L6 15 L3 15 Z" />
        </svg>
      );
    default:
      return (
        <svg {...svgProps}>
          <rect x="3" y="3" width="18" height="18" rx="1" />
        </svg>
      );
  }
};

// All available shapes - organized in rows
const ALL_SHAPES: Array<{ type: string; label: string; excalidrawType: ExcalidrawElement["type"] }> = [
  // Row 1: Basic shapes
  { type: "rectangle", label: "Rectangle", excalidrawType: "rectangle" },
  { type: "roundedRectangle", label: "Rounded Rectangle", excalidrawType: "rectangle" },
  { type: "ellipse", label: "Ellipse/Circle", excalidrawType: "ellipse" },
  { type: "diamond", label: "Diamond", excalidrawType: "diamond" },
  // Row 2: Polygons
  { type: "triangle", label: "Triangle", excalidrawType: "triangle" },
  { type: "triangleDown", label: "Triangle Down", excalidrawType: "triangle" },
  { type: "pentagon", label: "Pentagon", excalidrawType: "pentagon" },
  { type: "hexagon", label: "Hexagon", excalidrawType: "hexagon" },
  // Row 3: Special shapes
  { type: "parallelogram", label: "Parallelogram", excalidrawType: "rectangle" },
  { type: "trapezoid", label: "Trapezoid", excalidrawType: "rectangle" },
  { type: "cylinder", label: "Cylinder", excalidrawType: "rectangle" },
  { type: "database", label: "Database", excalidrawType: "rectangle" },
  // Row 4: Misc
  { type: "cloud", label: "Cloud", excalidrawType: "ellipse" },
  { type: "star", label: "Star", excalidrawType: "diamond" },
  { type: "arrow", label: "Arrow Shape", excalidrawType: "rectangle" },
  { type: "callout", label: "Callout", excalidrawType: "rectangle" },
];

export const ShapeSelector: React.FC<ShapeSelectorProps> = ({
  position,
  anchorPosition,
  onSelectShape,
  onClose,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    // Use capture phase to get the event before it's consumed
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [onClose]);
  
  // Prevent the popup from being closed immediately
  const handlePopupMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleShapeClick = (shape: typeof ALL_SHAPES[0]) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectShape(shape.excalidrawType);
  };

  // Calculate position to keep popup on screen
  const popupWidth = 200;
  const popupHeight = 280;
  let left = position.x - popupWidth / 2;
  let top = position.y + 10;
  
  // Adjust if off screen
  if (left < 10) left = 10;
  if (left + popupWidth > window.innerWidth - 10) left = window.innerWidth - popupWidth - 10;
  if (top + popupHeight > window.innerHeight - 10) top = position.y - popupHeight - 10;

  return (
    <div
      ref={popupRef}
      className="shape-selector-popup"
      style={{
        position: "fixed",
        left,
        top,
        width: popupWidth,
        zIndex: 10000,
        backgroundColor: "var(--island-bg-color, #fff)",
        borderRadius: 8,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
        padding: 12,
        pointerEvents: "auto",
      }}
      onMouseDown={handlePopupMouseDown}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ 
        fontSize: 12, 
        color: "var(--color-text-secondary, #666)",
        marginBottom: 10,
        fontWeight: 600,
        textAlign: "center",
      }}>
        Select a shape
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 6,
      }}>
        {ALL_SHAPES.map((shape) => (
          <button
            key={shape.type}
            style={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--color-border, #e0e0e0)",
              borderRadius: 6,
              backgroundColor: "var(--button-bg, #fff)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              color: "var(--color-text, #333)",
            }}
            onClick={handleShapeClick(shape)}
            onMouseDown={(e) => e.stopPropagation()}
            title={shape.label}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-primary-light, #e8f0fe)";
              e.currentTarget.style.borderColor = "var(--color-primary, #4f6bed)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--button-bg, #fff)";
              e.currentTarget.style.borderColor = "var(--color-border, #e0e0e0)";
            }}
          >
            <div style={{ width: 24, height: 24 }}>
              {getShapeIcon(shape.type)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShapeSelector;
