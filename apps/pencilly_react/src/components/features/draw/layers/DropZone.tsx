import React, { type FC } from "react";

import { cn } from "@/lib/utils";

interface IProps {
  canShowIndicator: boolean;
  isDragging: boolean;
  isDraggingThis: boolean;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  side?: "after" | "before";
}

const DropZone: FC<IProps> = ({
  canShowIndicator,
  handleDragOver,
  handleDrop,
  isDragging,
  isDraggingThis,
  handleDragLeave,
  side = "after",
}) => {
  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-20 transition-all  ",
        isDragging ? "h-4 " : "h-0 pointer-events-none",
        side === "after"
          ? "translate-y-1/2 bottom-0"
          : "-translate-y-1/2 top-0",
      )}
      onDragOver={e => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDraggingThis) {
          handleDragOver(e);
        }
      }}
      onDragLeave={handleDragLeave}
      onDrop={e => {
        if (!isDraggingThis) {
          handleDrop(e);
        }
      }}
    >
      <div
        className={cn(
          "absolute left-0 right-0  top-1/2 -translate-y-1/2 h-1.5 rounded-full transition-all duration-150",
          canShowIndicator ? "bg-primary/80" : "bg-transparent",
        )}
        style={{
          boxShadow: canShowIndicator
            ? "0 0 2px 1px var(--color-primary)"
            : undefined,
        }}
      />
    </div>
  );
};

export default DropZone;
