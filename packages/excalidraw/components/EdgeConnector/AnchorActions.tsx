import React from "react";
import { sceneCoordsToViewportCoords } from "@excalidraw/common";
import type { ShapeAnchor, AnchorPosition } from "../../edgeConnector";
import type { AppState } from "../../types";

import "./EdgeConnector.scss";

interface AnchorActionsProps {
  anchor: ShapeAnchor;
  appState: AppState;
  onDuplicateWithEdge: (anchor: ShapeAnchor) => void;
  onStartDrawEdge: (anchor: ShapeAnchor) => void;
}

const getArrowIcon = (position: AnchorPosition): string => {
  switch (position) {
    case "top":
      return "M12 5l-7 7h4v5h6v-5h4z";
    case "bottom":
      return "M12 19l7-7h-4v-5h-6v5h-4z";
    case "left":
      return "M5 12l7 7v-4h5v-6h-5v-4z";
    case "right":
      return "M19 12l-7-7v4h-5v6h5v4z";
  }
};

const getButtonOffset = (position: AnchorPosition): { x: number; y: number } => {
  const OFFSET = 28;
  switch (position) {
    case "top":
      return { x: 0, y: -OFFSET };
    case "bottom":
      return { x: 0, y: OFFSET };
    case "left":
      return { x: -OFFSET, y: 0 };
    case "right":
      return { x: OFFSET, y: 0 };
  }
};

export const AnchorActions: React.FC<AnchorActionsProps> = ({
  anchor,
  appState,
  onDuplicateWithEdge,
  onStartDrawEdge,
}) => {
  const viewportCoords = sceneCoordsToViewportCoords(
    { sceneX: anchor.x, sceneY: anchor.y },
    appState,
  );
  
  const offset = getButtonOffset(anchor.position);
  
  const style: React.CSSProperties = {
    position: "absolute",
    left: viewportCoords.x + offset.x - 14, // Half of button width
    top: viewportCoords.y + offset.y - 14, // Half of button height
    zIndex: 100,
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDuplicateWithEdge(anchor);
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      e.stopPropagation();
      e.preventDefault();
      onStartDrawEdge(anchor);
    }
  };

  return (
    <div className="anchor-actions" style={style}>
      <button
        className="anchor-action-btn"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        title="Click to duplicate with edge, drag to draw edge"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d={getArrowIcon(anchor.position)} fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};

export default AnchorActions;
