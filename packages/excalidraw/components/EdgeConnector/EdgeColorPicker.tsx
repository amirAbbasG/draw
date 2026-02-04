import React from "react";
import { EDGE_COLORS } from "../../edgeConnector";

import "./EdgeConnector.scss";

interface EdgeColorPickerProps {
  position: { x: number; y: number };
  currentColor: string;
  onSelectColor: (color: string) => void;
  onClose: () => void;
}

export const EdgeColorPicker: React.FC<EdgeColorPickerProps> = ({
  position,
  currentColor,
  onSelectColor,
  onClose,
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };
  
  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleColorClick = (color: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectColor(color);
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
        className="edge-color-picker"
        style={{
          left: position.x,
          top: position.y + 10,
        }}
        onClick={handlePopupClick}
      >
        <div style={{ 
          fontSize: 12, 
          color: "var(--color-text-secondary, #666)",
          marginBottom: 8,
          fontWeight: 500,
        }}>
          Edge color
        </div>
        <div className="edge-color-grid">
          {EDGE_COLORS.map((color) => (
            <button
              key={color}
              className={`edge-color-item ${currentColor === color ? "selected" : ""}`}
              style={{ backgroundColor: color }}
              onClick={handleColorClick(color)}
              title={color}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default EdgeColorPicker;
