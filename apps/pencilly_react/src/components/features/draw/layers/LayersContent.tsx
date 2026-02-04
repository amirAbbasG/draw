import { useMemo, useState } from "react";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import DropZone from "@/components/features/draw/layers/DropZone";
import GroupCard from "@/components/features/draw/layers/GroupCard";
import LayerCard from "@/components/features/draw/layers/LayerCard";
import { useDragAndDrop } from "@/components/features/draw/layers/useDragAndDrop";
import { useLayerActions } from "@/components/features/draw/layers/useLayerActions";
import {
  getItemId,
  getLayerItems,
  getVisibleLayerItems,
} from "@/components/features/draw/layers/utils";
import RenderIf from "@/components/shared/RenderIf";
import { Show } from "@/components/shared/Show";
import AppTypo from "@/components/ui/custom/app-typo";
import { Switch } from "@/components/ui/switch";
import { cn, isEmpty } from "@/lib/utils";
import { LAYER_CONTENT_ID } from "@/constants/keys";
import { useTranslations } from "@/i18n";

export interface LayersContentProps {
  drawAPI: DrawAPI;
  elements: readonly ExcalidrawElement[];
}

const LayersContent = ({ drawAPI, elements }: LayersContentProps) => {
  const t = useTranslations("layers");
  const [showInvisible, setShowInvisible] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const {
    handleDelete,
    handleDeleteGroup,
    move,
    moveGroup,
    selectElement,
    selectGroup,
    setProperty,
    setGroupProperty,
    ungroupElements,
    addElementToGroup,
    removeElementFromGroup,
    reorderLayerItems,
  } = useLayerActions(drawAPI, elements);

  const appState = drawAPI?.getAppState();
  const selectedGroupIds = appState?.selectedGroupIds || {};

  const layerItems = useMemo(() => getLayerItems(elements), [elements]);

  const visibleLayerItems = useMemo(
    () => getVisibleLayerItems(layerItems, showInvisible),
    [layerItems, showInvisible],
  );

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const dragAPI = useDragAndDrop({
    visibleLayerItems,
    addElementToGroup,
    removeElementFromGroup,
    reorderLayerItems,
  });

  const {
    dropTarget,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    handleDrop,
    isDragging,
    draggedItem,
    handleDragLeave,
  } = dragAPI;

  const isDropTargetMatch = (type: "before" | "after", itemId: string) => {
    return (
      dropTarget?.type === type &&
      dropTarget.targetId === itemId &&
      !dropTarget.inGroupId
    );
  };

  return (
    <div className="flex flex-col px-3 py-4 gap-3" id={LAYER_CONTENT_ID}>
      <Show>
        <Show.When isTrue={isEmpty(elements)}>
          <AppTypo className="text-center mt-4" color="secondary">
            {t("layers_empty_message")}
          </AppTypo>
        </Show.When>
        <Show.Else>
          <div className="flex items-center justify-between mb-2">
            <AppTypo type="label">{t("show_invisible_layers")}</AppTypo>
            <Switch
              checked={showInvisible}
              onCheckedChange={setShowInvisible}
            />
          </div>
          <RenderIf
            isTrue={
              !isEmpty(elements) && isEmpty(visibleLayerItems) && !showInvisible
            }
          >
            <AppTypo className="text-center mt-4" color="secondary">
              {t("no_visible_layers")}
            </AppTypo>
          </RenderIf>

          <div
            className={cn("flex flex-col gap-1.5", isDragging && "select-none")}
          >
            {visibleLayerItems.map((item, index) => {
              const itemId = getItemId(item);
              const isDraggingThis =
                draggedItem &&
                ((draggedItem.type === "group" &&
                  item.type === "group" &&
                  draggedItem.id === item.groupId) ||
                  (draggedItem.type === "element" &&
                    item.type === "element" &&
                    draggedItem.id === item.id));

              const canShowBeforeIndicator =
                !isDraggingThis && isDropTargetMatch("before", itemId);
              const canShowAfterIndicator =
                !isDraggingThis && isDropTargetMatch("after", itemId);

              return (
                <div key={itemId} className="relative">
                  <DropZone
                    canShowIndicator={canShowBeforeIndicator}
                    isDragging={isDragging}
                    isDraggingThis={isDraggingThis}
                    handleDrop={e => handleDrop(e, "before", itemId)}
                    handleDragOver={e => handleDragOver(e, "before", itemId)}
                    handleDragLeave={handleDragLeave}
                    side="before"
                  />

                  {item.type === "group" ? (
                    <GroupCard
                      dragAPI={dragAPI}
                      groupId={item.groupId}
                      elements={item.elements}
                      isSelected={!!selectedGroupIds[item.groupId]}
                      isCollapsed={collapsedGroups.has(item.groupId)}
                      isDragging={!!isDraggingThis}
                      onToggleCollapse={() => toggleGroupCollapse(item.groupId)}
                      selectGroup={() => selectGroup(item.groupId)}
                      selectElement={selectElement}
                      setProperty={(id, property, value) =>
                        setProperty(id, property, value)
                      }
                      setGroupProperty={(property, value) =>
                        setGroupProperty(item.groupId, property, value)
                      }
                      onDeleteElement={handleDelete}
                      onDeleteGroup={() => handleDeleteGroup(item.groupId)}
                      onUngroupElements={() => ungroupElements(item.groupId)}
                      moveElement={move}
                      moveGroup={dir => moveGroup(item.groupId, dir)}
                    />
                  ) : (
                    <div
                      draggable
                      onDragStart={e => handleDragStart(e, "element", item.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "transition-opacity cursor-grab active:cursor-grabbing",
                        isDraggingThis && "opacity-50",
                      )}
                    >
                      <LayerCard
                        item={item.element}
                        setProperty={(property, value) =>
                          setProperty(item.id, property, value)
                        }
                        selectElement={() => selectElement(item.id)}
                        onDelete={() => handleDelete(item.id)}
                        move={direction => move(item.id, direction)}
                      />
                    </div>
                  )}

                  {index === visibleLayerItems.length - 1 && (
                    <DropZone
                      canShowIndicator={canShowAfterIndicator}
                      isDragging={isDragging}
                      isDraggingThis={isDraggingThis}
                      handleDrop={e => handleDrop(e, "after", itemId)}
                      handleDragOver={e => handleDragOver(e, "after", itemId)}
                      handleDragLeave={handleDragLeave}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Show.Else>
      </Show>
    </div>
  );
};

export default LayersContent;
