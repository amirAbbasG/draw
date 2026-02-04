import type React from "react";
import { useCallback, useState } from "react";

import { ExcalidrawElement } from "@excalidraw/element/types";

import type {
  DragItem,
  DragItemType,
  DropTarget,
  DropType,
  LayerDragItem,
} from "@/components/features/draw/layers/types";

interface UseDragAndDropProps {
  visibleLayerItems: LayerDragItem[];
  addElementToGroup: (elementId: string, groupId: string) => void;
  removeElementFromGroup: (
    elementId: string,
    groupId: string,
  ) => ExcalidrawElement[];
  reorderLayerItems: (newOrder: LayerDragItem[]) => void;
}

export const useDragAndDrop = ({
  addElementToGroup,
  removeElementFromGroup,
  reorderLayerItems,
  visibleLayerItems,
}: UseDragAndDropProps) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const handleDragStart = useCallback(
    (
      e: React.DragEvent,
      type: DragItemType,
      id: string,
      fromGroupId?: string,
    ) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({ type, id, fromGroupId }),
      );
      setDraggedItem({ type, id, fromGroupId });
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDropTarget(null);
  }, []);

  const handleDragOver = useCallback(
    (
      e: React.DragEvent,
      targetType: DropType,
      targetId: string,
      inGroupId?: string,
    ) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      setDropTarget({ type: targetType, targetId, inGroupId });
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (
      e: React.DragEvent,
      targetType: DropType,
      targetId: string,
      inGroupId?: string,
    ) => {
      e.preventDefault();
      e.stopPropagation();

      if (!draggedItem) {
        return;
      }

      const { type: dragType, id: dragId, fromGroupId } = draggedItem;

      console.log("[v0] Processing drop:", {
        dragType,
        dragId,
        fromGroupId,
        targetType,
        targetId,
        inGroupId,
      });

      // Case: Dragging a group - only allow reorder at root level
      if (dragType === "group") {
        if (inGroupId) {
          console.log("[v0] Cannot drop group inside another group");
          setDraggedItem(null);
          setDropTarget(null);
          return;
        }
        reorderAtRootLevel(dragId, targetId, targetType, true);
        setDraggedItem(null);
        setDropTarget(null);
        return;
      }

      // From here, we're dragging an element
      const isDraggingFromGroup = !!fromGroupId;
      const isDroppingInGroup = !!inGroupId;

      console.log("[v0] Element drag:", {
        isDraggingFromGroup,
        isDroppingInGroup,
      });

      // Case 1 & 3: Dropping at root level (before/after root items)
      if (!isDroppingInGroup) {
        if (isDraggingFromGroup) {
          // Case 3: Ungroup element and place at root level
          console.log(
            "[v0] Case 3: Ungrouping element",
            dragId,
            "from",
            fromGroupId,
          );
          removeElementFromGroup(dragId, fromGroupId);
        }
        // Reorder at root level (works for both Case 1 and 3)
        reorderAtRootLevel(dragId, targetId, targetType, false, fromGroupId);
      }
      // Case 2 & 4: Dropping inside a group
      else {
        if (isDraggingFromGroup && fromGroupId === inGroupId) {
          // Case 2: Reorder within the same group
          console.log("[v0] Case 2: Reorder within same group", inGroupId);
          reorderWithinGroup(dragId, targetId, targetType, inGroupId);
        } else {
          // Case 4: Moving from root or different group into this group
          console.log("[v0] Case 4: Moving into group", inGroupId);
          if (isDraggingFromGroup && fromGroupId !== inGroupId) {
            console.log("[v0] Removing from old group", fromGroupId);
            removeElementFromGroup(dragId, fromGroupId);
          }
          console.log("[v0] Adding to group", inGroupId);
          addElementToGroup(dragId, inGroupId);
          setTimeout(() => {
            reorderWithinGroup(dragId, targetId, targetType, inGroupId);
          }, 0);
        }
      }

      setDraggedItem(null);
      setDropTarget(null);
    },
    [
      draggedItem,
      visibleLayerItems,
      addElementToGroup,
      removeElementFromGroup,
      reorderLayerItems,
    ],
  );

  // Helper: Reorder at root level
  const reorderAtRootLevel = useCallback(
    (
      dragId: string,
      targetId: string,
      targetType: DropType,
      isGroup: boolean,
      wasFromGroupId?: string,
    ) => {
      console.log("[v0] reorderAtRootLevel:", {
        dragId,
        targetId,
        targetType,
        isGroup,
        wasFromGroupId,
      });

      let currentItems: LayerDragItem[] = visibleLayerItems.map(item => {
        if (item.type === "group") {
          return {
            type: "group" as const,
            groupId: item.groupId,
            elementIds: item.elementIds,
          };
        }
        return { type: "element" as const, id: item.id };
      });

      // Find drag index
      const dragIndex = currentItems.findIndex(item => {
        if (isGroup) {
          return item.type === "group" && item.groupId === dragId;
        }
        return (
          item.type === "element" && item.id.toString() === dragId.toString()
        );
      });

      // Find target index
      const targetIndex = currentItems.findIndex(item => {
        if (item.type === "group" && item.groupId === targetId) return true;
        return item.type === "element" && item.id === targetId;
      });

      console.log("[v0] indices:", { dragIndex, targetIndex });

      if (targetIndex === -1) {
        console.log("[v0] Target not found, returning");
        return;
      }

      if (dragIndex === -1) {
        // Element was in a group and is now being moved to root
        console.log("[v0] Element was in group, adding to root");
        const newItem = { type: "element" as const, id: dragId };
        const insertIndex =
          targetType === "after" ? targetIndex + 1 : targetIndex;
        currentItems.splice(insertIndex, 0, newItem);
        currentItems = currentItems.map(item => {
          if (item.type === "group" && item.elementIds.includes(dragId)) {
            return {
              ...item,
              elementIds: item.elementIds.filter(id => id !== dragId),
            };
          }
          return item;
        });
      } else if (dragIndex !== targetIndex) {
        // Remove from current position
        const [removed] = currentItems.splice(dragIndex, 1);
        // Calculate new insert position
        const insertIndex =
          targetType === "after"
            ? dragIndex < targetIndex
              ? targetIndex
              : targetIndex + 1
            : dragIndex < targetIndex
              ? targetIndex - 1
              : targetIndex;
        currentItems.splice(insertIndex, 0, removed);
      }

      console.log("[v0] newItems:", currentItems);
      reorderLayerItems(currentItems);
    },
    [visibleLayerItems, reorderLayerItems],
  );

  // Helper: Reorder within a group
  const reorderWithinGroup = useCallback(
    (
      dragId: string,
      targetId: string,
      targetType: DropType,
      groupId: string,
    ) => {
      console.log("[v0] reorderWithinGroup:", {
        dragId,
        targetId,
        targetType,
        groupId,
      });

      const groupItem = visibleLayerItems.find(
        item => item.type === "group" && item.groupId === groupId,
      );

      if (!groupItem || groupItem.type !== "group") {
        console.log("[v0] Group not found");
        return;
      }

      const elementIds = [...groupItem.elementIds];
      console.log("[v0] Current elementIds:", elementIds);

      // If element is not yet in the group (just added), add it
      if (!elementIds.includes(dragId)) {
        const targetIndex = elementIds.indexOf(targetId);
        if (targetIndex !== -1) {
          const insertIndex =
            targetType === "after" ? targetIndex + 1 : targetIndex;
          elementIds.splice(insertIndex, 0, dragId);
        } else {
          elementIds.push(dragId);
        }
      } else {
        // Element is already in group, just reorder
        const dragIndex = elementIds.indexOf(dragId);
        const targetIndex = elementIds.indexOf(targetId);

        if (
          dragIndex !== -1 &&
          targetIndex !== -1 &&
          dragIndex !== targetIndex
        ) {
          const [removed] = elementIds.splice(dragIndex, 1);
          const insertIndex =
            targetType === "after"
              ? dragIndex < targetIndex
                ? targetIndex
                : targetIndex + 1
              : dragIndex < targetIndex
                ? targetIndex - 1
                : targetIndex;
          elementIds.splice(insertIndex, 0, removed);
        }
      }

      console.log("[v0] New elementIds:", elementIds);

      reorderLayerItems(
        visibleLayerItems.map(item => {
          if (item.type === "group" && item.groupId === groupId) {
            return { ...item, elementIds };
          }
          return item;
        }),
      );
    },
    [visibleLayerItems, reorderLayerItems],
  );

  const isDragging = !!draggedItem;

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragging,
    dropTarget,
    draggedItem,
  };
};
