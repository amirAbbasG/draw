import {
  moveAllLeft,
  moveAllRight,
  moveOneLeft,
  moveOneRight,
} from "@excalidraw/element";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";

import {
  LayerDragItem,
  MoveDirection,
} from "@/components/features/draw/layers/types";

export const useLayerActions = (
  drawAPI: DrawAPI,
  elements: readonly ExcalidrawElement[],
) => {
  const selectElement = (id: string) => {
    if (!drawAPI) return;
    const appState = drawAPI.getAppState();
    drawAPI.updateScene({
      appState: {
        ...appState,
        selectedElementIds: { [id]: true },
        selectedGroupIds: {}, // Clear group selection when selecting single element
      },
    });
  };

  const selectGroup = (groupId: string) => {
    if (!drawAPI) return;
    const appState = drawAPI.getAppState();

    // Find all elements that belong to this group
    const groupElements = elements.filter(el => el.groupIds?.includes(groupId));

    // Create selectedElementIds object for all group elements
    const selectedElementIds: Record<string, true> = {};
    groupElements.forEach(el => {
      selectedElementIds[el.id] = true;
    });

    drawAPI.updateScene({
      appState: {
        ...appState,
        selectedElementIds,
        selectedGroupIds: { [groupId]: true },
      },
    });
  };

  const setProperty = (
    id: string,
    property: keyof ExcalidrawElement,
    value: any,
  ) => {
    if (!drawAPI) return;
    const appState = drawAPI.getAppState();

    const selectedElementIds = { ...appState.selectedElementIds };
    if (selectedElementIds[id] && value) {
      delete selectedElementIds[id];
    }

    drawAPI.updateScene({
      elements: elements.map(el => {
        if (el.id === id) {
          return {
            ...el,
            [property]: value,
          };
        }
        return el;
      }),
      appState: {
        ...appState,
        selectedElementIds,
      },
    });
  };

  const setGroupProperty = (
    groupId: string,
    property: keyof ExcalidrawElement,
    value: any,
  ) => {
    if (!drawAPI) return;
    const appState = drawAPI.getAppState();

    drawAPI.updateScene({
      elements: elements.map(el => {
        if (el.groupIds?.includes(groupId)) {
          return {
            ...el,
            [property]: value,
          };
        }
        return el;
      }),
      appState,
    });
  };

  const handleDelete = (id: string) => {
    const appState = drawAPI.getAppState();
    const elements = drawAPI.getSceneElements();

    const newElements = elements.filter(element => element.id !== id);

    drawAPI.updateScene({
      elements: newElements,
      appState: {
        ...appState,
        selectedElementIds: appState.selectedElementIds[id]
          ? Object.fromEntries(
              Object.entries(appState.selectedElementIds).filter(
                ([key]) => key !== id,
              ),
            )
          : appState.selectedElementIds,
      },
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    if (!drawAPI) return;
    const appState = drawAPI.getAppState();
    const currentElements = drawAPI.getSceneElements();

    // Filter out elements that belong to this group
    const newElements = currentElements.filter(
      element => !element.groupIds?.includes(groupId),
    );

    // Clean up selected element IDs
    const newSelectedElementIds = { ...appState.selectedElementIds };
    currentElements.forEach(el => {
      if (el.groupIds?.includes(groupId) && newSelectedElementIds[el.id]) {
        delete newSelectedElementIds[el.id];
      }
    });

    // Clean up selected group IDs
    const newSelectedGroupIds = { ...appState.selectedGroupIds };
    delete newSelectedGroupIds[groupId];

    drawAPI.updateScene({
      elements: newElements,
      appState: {
        ...appState,
        selectedElementIds: newSelectedElementIds,
        selectedGroupIds: newSelectedGroupIds,
      },
    });
  };

  const ungroupElements = (groupId: string) => {
    if (!drawAPI) return;
    const appState = drawAPI.getAppState();

    const updatedElements = elements.map(el => {
      if (el.groupIds?.includes(groupId)) {
        return {
          ...el,
          groupIds: el.groupIds.filter(id => id !== groupId),
        };
      }
      return el;
    });

    // Clean up selected group IDs
    const newSelectedGroupIds = { ...appState.selectedGroupIds };
    delete newSelectedGroupIds[groupId];

    drawAPI.updateScene({
      elements: updatedElements,
      appState: {
        ...appState,
        selectedGroupIds: newSelectedGroupIds,
      },
    });
  };

  // Helper to perform move operations (single or group)
  const performMove = (
    selectedElementIds: Record<string, true>,
    selectedGroupIds: Record<string, true> | undefined,
    dir: "back" | "backward" | "front" | "forward",
  ) => {
    if (!drawAPI) return;
    const appState = drawAPI.getAppState();
    const scene = drawAPI.getScene();

    const state = {
      ...appState,
      selectedElementIds,
      ...(selectedGroupIds ? { selectedGroupIds } : {}),
    } as AppState;

    let newElements: DrawElements | undefined;
    switch (dir) {
      case "backward":
        newElements = moveOneLeft(elements, state, scene);
        break;
      case "forward":
        newElements = moveOneRight(elements, state, scene);
        break;
      case "back":
        newElements = moveAllLeft(elements, state);
        break;
      case "front":
        newElements = moveAllRight(elements, state);
        break;
    }

    if (newElements) {
      drawAPI.updateScene({
        elements: newElements,
      });
    }
  };

  const move = (id: string, dir: MoveDirection) => {
    // Single element move uses performMove with single selectedElementIds
    const selectedElementIds: Record<string, true> = { [id]: true };
    performMove(selectedElementIds, undefined, dir);
  };

  const moveGroup = (groupId: string, dir: MoveDirection) => {
    if (!drawAPI) return;
    // Find all elements in this group
    const groupElements = elements.filter(el => el.groupIds?.includes(groupId));

    // Create selectedElementIds for all group elements
    const selectedElementIds: Record<string, true> = {};
    groupElements.forEach(el => {
      selectedElementIds[el.id] = true;
    });

    const selectedGroupIds: Record<string, true> = { [groupId]: true };

    performMove(selectedElementIds, selectedGroupIds, dir);
  };

  const addElementToGroup = (elementId: string, groupId: string) => {
    if (!drawAPI) return;
    const appState = drawAPI.getAppState();

    const groupMember = elements.find(el => el.groupIds?.includes(groupId));
    if (!groupMember) return;

    const updatedElements = elements.map(el => {
      if (el.id === elementId) {
        const newGroupIds = [...(el.groupIds || []), groupId];
        return { ...el, groupIds: newGroupIds };
      }
      return el;
    });

    drawAPI.updateScene({
      elements: updatedElements,
      appState,
    });
  };

  const removeElementFromGroup = (elementId: string, groupId: string) => {
    if (!drawAPI) return;

    const appState = drawAPI.getAppState();

    const updatedElements = elements.map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          groupIds: (el.groupIds || []).filter(id => id !== groupId),
        };
      }
      return el;
    });

    const remainingMembers = updatedElements.filter(
      el => el.id !== elementId && el.groupIds?.includes(groupId),
    );

    const newSelectedGroupIds = { ...appState.selectedGroupIds };
    if (remainingMembers.length <= 1) {
      delete newSelectedGroupIds[groupId];

      if (remainingMembers.length === 1) {
        const lastMember = remainingMembers[0];
        const idx = updatedElements.findIndex(el => el.id === lastMember.id);
        if (idx !== -1) {
          updatedElements[idx] = {
            ...updatedElements[idx],
            groupIds: (updatedElements[idx].groupIds || []).filter(
              id => id !== groupId,
            ),
          };
        }
      }
    }
    console.log({ updatedElements });

    drawAPI.updateScene({
      elements: updatedElements,
      appState: { ...appState, selectedGroupIds: newSelectedGroupIds },
    });
    return updatedElements;
  };

  const reorderLayerItems = (items: LayerDragItem[]) => {
    if (!drawAPI) return;
    const appState = drawAPI.getAppState();

    const newElements: ExcalidrawElement[] = [];
    const addedIds = new Set<string>();

    console.log(items);

    for (const item of items) {
      if (item.type === "group") {
        item.elementIds.forEach(id => {
          const el = elements.find(e => e.id === id);
          if (el && !addedIds.has(id)) {
            newElements.push({
              ...el,
              groupIds: el.groupIds.includes(item.groupId)
                ? el.groupIds
                : [...(el.groupIds || []), item.groupId],
            });
            addedIds.add(id);
          }
        });
      } else {
        const el = elements.find(e => e.id === item.id);
        if (el && !addedIds.has(item.id)) {
          newElements.push({
            ...el,
            groupIds: [],
          });
          addedIds.add(item.id);
        }
      }
    }

    elements.forEach(el => {
      if (!addedIds.has(el.id)) {
        newElements.push(el);
      }
    });

    drawAPI.updateScene({
      elements: newElements,
      appState,
    });
  };

  return {
    selectElement,
    selectGroup,
    setProperty,
    setGroupProperty,
    handleDelete,
    handleDeleteGroup,
    ungroupElements,
    move,
    moveGroup,
    addElementToGroup,
    removeElementFromGroup,
    reorderLayerItems,
  };
};
