import type { ExcalidrawElement } from "@excalidraw/element/types"

export type MoveDirection = "back" | "backward" | "front" | "forward"

export type LayerDragItem = { type: "element"; id: string } | { type: "group"; groupId: string; elementIds: string[] }

export type LayerItem =
    | { type: "element"; id: string; element: ExcalidrawElement }
    | {
    type: "group"
    groupId: string
    elementIds: string[]
    elements: ExcalidrawElement[]
}

export type DropType = "before" | "after"

export type DragItemType = "element" | "group"

export interface DragItem {
    type: DragItemType
    id: string
    fromGroupId?: string // If dragging from within a group
}

export interface DropTarget {
    type: DropType
    targetId: string
    inGroupId?: string // If dropping on an item inside a group
}
