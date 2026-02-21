import React, {useCallback, useRef, useState} from "react";

export const useDraggable = (containerWidth: number = 300,  containerHeight: number = 200) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef({
        isDragging: false,
        hasMoved: false,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
    });
    const [position, setPosition] = useState({
        x:
            typeof window !== "undefined" ? window.innerWidth - containerWidth - 20 : 20,
        y:
            typeof window !== "undefined"
                ? window.innerHeight - containerHeight - 20
                : 20,
    });

    // Drag handlers
    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            // Don't drag if clicking on buttons
            if ((e.target as HTMLElement).closest("button")) return;

            dragRef.current = {
                isDragging: true,
                hasMoved: false,
                startX: e.clientX,
                startY: e.clientY,
                offsetX: e.clientX - position.x,
                offsetY: e.clientY - position.y,
            };
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
        },
        [position],
    );

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragRef.current.isDragging) return;

        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        // Only count as "moved" if dragged more than 5px
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            dragRef.current.hasMoved = true;
        }

        const newX = Math.max(
            0,
            Math.min(
                window.innerWidth - containerWidth,
                e.clientX - dragRef.current.offsetX,
            ),
        );
        const newY = Math.max(
            0,
            Math.min(
                window.innerHeight - containerHeight,
                e.clientY - dragRef.current.offsetY,
            ),
        );
        setPosition({ x: newX, y: newY });
    }, []);



    const handlePointerUp = useCallback((_e: React.PointerEvent) => {
        const wasDragging = dragRef.current.hasMoved;
        dragRef.current.isDragging = false;

        // If user didn't drag (just a click), do nothing here;
        // double-click will handle maximize
    }, []);

    return {
        position,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        containerRef
    }

}