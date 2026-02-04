import type { FC } from "react";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import DropZone from "@/components/features/draw/layers/DropZone";
import LayersMenu from "@/components/features/draw/layers/LayersMenu";
import type { MoveDirection } from "@/components/features/draw/layers/types";
import type { useDragAndDrop } from "@/components/features/draw/layers/useDragAndDrop";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import LayerCard from "./LayerCard";

interface GroupCardProps {
  dragAPI: ReturnType<typeof useDragAndDrop>;
  groupId: string;
  elements: (ExcalidrawElement & { isSelected?: boolean })[];
  isSelected: boolean;
  isCollapsed: boolean;
  isDragging?: boolean;
  onToggleCollapse: () => void;
  selectGroup: () => void;
  selectElement: (id: string) => void;
  setProperty: (
    id: string,
    property: keyof ExcalidrawElement,
    value: any,
  ) => void;
  setGroupProperty: (property: keyof ExcalidrawElement, value: any) => void;
  onDeleteElement: (id: string) => void;
  onDeleteGroup: () => void;
  onUngroupElements: () => void;
  moveElement: (id: string, direction: MoveDirection) => void;
  moveGroup: (direction: MoveDirection) => void;
}

const GroupCard: FC<GroupCardProps> = ({
  groupId,
  elements,
  isSelected,
  isCollapsed,
  isDragging,
  onToggleCollapse,
  selectGroup,
  selectElement,
  setProperty,
  setGroupProperty,
  onDeleteElement,
  onDeleteGroup,
  onUngroupElements,
  moveElement,
  moveGroup,
  dragAPI,
}) => {
  const t = useTranslations("layers");

  const allLocked = elements.every(el => el.locked);
  const allHidden = elements.every(el => el.isDeleted);
  const someHidden = elements.some(el => el.isDeleted);

  const {
    dropTarget,
    handleDragOver,
    handleDrop,
    handleDragStart,
    handleDragEnd,
    handleDragLeave,
    draggedItem,
  } = dragAPI;

  const isDraggingActive = !!draggedItem;

  const isDropTargetMatch = (type: "before" | "after", elementId: string) => {
    return (
      dropTarget?.type === type &&
      dropTarget.targetId === elementId &&
      dropTarget.inGroupId === groupId
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Group Header - Draggable */}
      <div
        draggable
        onDragStart={e => handleDragStart(e, "group", groupId)}
        onDragEnd={handleDragEnd}
        className={cn(
          "flex items-center gap-1 border rounded p-2 hover:bg-muted/50 transition-all duration-200 cursor-grab active:cursor-grabbing",
          someHidden && !allHidden && "opacity-75",
          allHidden && "opacity-50",
          isSelected && "border-primary bg-primary/10",
          isDragging && "opacity-50",
        )}
        onClick={selectGroup}
      >
        <AppIconButton
          title={isCollapsed ? t("expand") : t("collapse")}
          icon={
            isCollapsed ? "hugeicons:arrow-right-01" : "hugeicons:arrow-down-01"
          }
          size="xs"
          className="!p-0 !w-fit !h-fit"
          onClick={e => {
            e.stopPropagation();
            onToggleCollapse();
          }}
        />

        <AppIcon
          className="stroke-2 size-8 p-1.5 me-1 rounded-md text-primary bg-primary/10"
          icon="hugeicons:folder-01"
        />

        <div className="flex flex-col flex-1 min-w-0 me-auto">
          <AppTypo className="capitalize font-medium">
            {t("group")} ({elements.length})
          </AppTypo>
          <AppTypo className="truncate max-w-16" variant="xs" color="secondary">
            {groupId}
          </AppTypo>
        </div>

        <LayersMenu
          isLocked={allLocked}
          isHidden={allHidden}
          setProperty={setGroupProperty}
          move={moveGroup}
          onDelete={onDeleteGroup}
          onUngroupElements={onUngroupElements}
        />
      </div>

      {/* Group children with drop zones */}
      {!isCollapsed && (
        <div className="flex flex-col gap-1.5 pl-4 border-l-2 border-muted ml-4">
          {elements.map((el, index) => {
            const isDraggingThis = draggedItem?.id === el.id;
            const canShowBeforeIndicator =
              !isDraggingThis && isDropTargetMatch("before", el.id);
            const canShowAfterIndicator =
              !isDraggingThis && isDropTargetMatch("after", el.id);

            return (
              <div key={el.id} className="relative">
                <DropZone
                  canShowIndicator={canShowBeforeIndicator}
                  isDragging={isDraggingActive}
                  isDraggingThis={isDraggingThis}
                  handleDrop={e => handleDrop(e, "before", el.id, groupId)}
                  handleDragOver={e =>
                    handleDragOver(e, "before", el.id, groupId)
                  }
                  handleDragLeave={handleDragLeave}
                  side="before"
                />

                <div
                  draggable
                  onDragStart={e =>
                    handleDragStart(e, "element", el.id, groupId)
                  }
                  onDragEnd={e => {
                    e.stopPropagation();
                    handleDragEnd();
                  }}
                  className={cn(
                    "cursor-grab active:cursor-grabbing transition-opacity",
                    isDraggingThis && "opacity-50",
                  )}
                >
                  <LayerCard
                    item={el}
                    setProperty={(property, value) =>
                      setProperty(el.id, property, value)
                    }
                    selectElement={() => selectElement(el.id)}
                    onDelete={() => onDeleteElement(el.id)}
                    move={direction => moveElement(el.id, direction)}
                  />
                </div>

                {index === elements.length - 1 && (
                  <DropZone
                    canShowIndicator={canShowAfterIndicator}
                    isDragging={isDraggingActive}
                    isDraggingThis={isDraggingThis}
                    handleDrop={e => handleDrop(e, "after", el.id, groupId)}
                    handleDragOver={e =>
                      handleDragOver(e, "after", el.id, groupId)
                    }
                    handleDragLeave={handleDragLeave}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupCard;
