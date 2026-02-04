import {LayerItem} from "@/components/features/draw/layers/types";
import {ExcalidrawElement} from "@excalidraw/element/types";

export const getLayerItems = (elements: readonly ExcalidrawElement[]): LayerItem[] => {
    const items: LayerItem[] = [];
    const addedGroups = new Set<string>();

    elements.forEach(el => {
        if (el.groupIds && el.groupIds.length > 0) {
            const topGroupId = el.groupIds[el.groupIds.length - 1];

            if (!addedGroups.has(topGroupId)) {
                addedGroups.add(topGroupId);
                const groupElements = elements.filter(
                    e => e.groupIds && e.groupIds.includes(topGroupId),
                );
                items.push({
                    type: "group",
                    groupId: topGroupId,
                    elementIds: groupElements.map(e => e.id),
                    elements: groupElements as ExcalidrawElement[],
                });
            }
        } else {
            items.push({
                type: "element",
                id: el.id,
                element: el as ExcalidrawElement,
            });
        }
    });

    return items;
};

export const getVisibleLayerItems = (layerItems: LayerItem[], showInvisible: boolean) => {
    if (showInvisible) return layerItems;

    return layerItems.filter(item => {
        if (item.type === "element") {
            return !item.element.isDeleted;
        } else {
            return item.elements.some(el => !el.isDeleted);
        }
    });
};
export const getItemId = (item: LayerItem) =>
    item.type === "group" ? item.groupId : item.id;


