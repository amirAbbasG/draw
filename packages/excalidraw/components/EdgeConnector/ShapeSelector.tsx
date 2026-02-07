import React, { useEffect, useRef } from "react";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AnchorPosition } from "../../edgeConnector";
import {
    LIBRARY_SHAPES,
    BUILTIN_SHAPES,
    getShapeIconSvg,
    type LibraryShapeDefinition,
} from "../../edgeConnector/shapeLibrary";

import "./EdgeConnector.scss";

// Shape selection can be either a built-in type or a library index
export type ShapeSelection =
    | { type: "builtin"; shapeType: ExcalidrawElement["type"] }
    | { type: "library"; libraryIndex: number };

interface ShapeSelectorProps {
    position: { x: number; y: number };
    anchorPosition: AnchorPosition;
    onSelectShape: (selection: ShapeSelection) => void;
    onClose: () => void;
}

// Combined shape list for display
interface DisplayShape {
    id: string;
    name: string;
    icon: string;
    selection: ShapeSelection;
}

// Create display shapes list
const createDisplayShapes = (): DisplayShape[] => {
    const shapes: DisplayShape[] = [];

    // Add built-in shapes first
    for (const builtin of BUILTIN_SHAPES) {
        shapes.push({
            id: `builtin-${builtin.type}`,
            name: builtin.name,
            icon: builtin.icon,
            selection: { type: "builtin", shapeType: builtin.type },
        });
    }

    // Add library shapes (skip index 2 as it's rounded rectangle similar to rectangle)
    for (const libShape of LIBRARY_SHAPES) {
        // Skip duplicate of rectangle
        if (libShape.index === 2) continue;

        shapes.push({
            id: `library-${libShape.index}`,
            name: libShape.name,
            icon: libShape.icon,
            selection: { type: "library", libraryIndex: libShape.index },
        });
    }

    return shapes;
};

const DISPLAY_SHAPES = createDisplayShapes();

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

    const handleShapeClick = (shape: DisplayShape) => (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onSelectShape(shape.selection);
    };

    // Calculate position to keep popup on screen
    const columns = 5;
    const popupWidth = columns * 44 + 24; // 44px per button + padding
    const rows = Math.ceil(DISPLAY_SHAPES.length / columns);
    const popupHeight = rows * 44 + 50; // 44px per row + header + padding
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
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: 4,
            }}>
                {DISPLAY_SHAPES.map((shape) => (
                    <button
                        key={shape.id}
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
                            padding: 0,
                        }}
                        onClick={handleShapeClick(shape)}
                        onMouseDown={(e) => e.stopPropagation()}
                        title={shape.name}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--color-primary-light, #e8f0fe)";
                            e.currentTarget.style.borderColor = "var(--color-primary, #4f6bed)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--button-bg, #fff)";
                            e.currentTarget.style.borderColor = "var(--color-border, #e0e0e0)";
                        }}
                    >
                        <div
                            style={{ width: 24, height: 24 }}
                            dangerouslySetInnerHTML={{ __html: getShapeIconSvg(shape.icon) }}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ShapeSelector;
