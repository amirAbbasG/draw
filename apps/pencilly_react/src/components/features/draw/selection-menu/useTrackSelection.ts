import { useCallback, useRef, useState } from "react";

import { getCommonBounds } from "@excalidraw/element";

export interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  itemId?: string;
}

const boundsEqual = (a: SelectionBounds, b: SelectionBounds) =>
  a.visible === b.visible &&
  a.x === b.x &&
  a.y === b.y &&
  a.width === b.width &&
  a.height === b.height;

const initialBounds: SelectionBounds = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  visible: false,
};

// FNV-1a 32-bit
const fnv1a = (str: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = ((h >>> 0) * 0x01000193) >>> 0;
  }
  // return as unsigned hex for compactness
  return (h >>> 0).toString(16);
};

const buildFingerprint = (
  elms: DrawElements,
  selectedIds: Record<string, any> | undefined | null,
  selectedGroupIds: Record<string, any> | undefined | null,
) => {
  // canonicalize elements: id:version (version may be undefined)
    const elmParts = elms
        .map(e => `${e.id}:${(e as any).version ?? 0}:${e.isDeleted ? 1 : 0}`)
        .sort();
  const selIds = selectedIds ? Object.keys(selectedIds).sort().join(",") : "";
  const selGroupIds = selectedGroupIds
    ? Object.keys(selectedGroupIds).sort().join(",")
    : "";
  const base = `${elmParts.length}|${elmParts.join("|")}|S:${selIds}|G:${selGroupIds}`;
  return fnv1a(base);
};

export const useTrackSelection = () => {
  const [selectionBounds, setSelectionBounds] =
    useState<SelectionBounds>(initialBounds);
  const [elements, setElements] = useState<DrawElements>([]);

  const prevBoundsRef = useRef<SelectionBounds>(initialBounds);
  const prevFingerprintRef = useRef<string>("");

  const handleChange = useCallback(
    (elms: DrawElements, appState: Partial<DrawAppState> | null) => {
      const selectedIds = appState?.selectedElementIds;
      const selectedGroupIds = appState?.selectedGroupIds; // fix: use actual group ids if present

      // Build decorated elements once
      const newElements = elms.map(el => ({
        ...el,
        isSelected: !!selectedIds?.[el.id],
      }));

      // compute fingerprint
      const fp = buildFingerprint(elms, selectedIds, selectedGroupIds);

      if (prevFingerprintRef.current !== fp) {
        prevFingerprintRef.current = fp;
        setElements(newElements);
      }

      const zoomLevel = appState?.zoom?.value ?? 1;

      const setDefaultData = () => {
        const next: SelectionBounds = {
          ...prevBoundsRef.current,
          visible: false,
        };
        if (!boundsEqual(prevBoundsRef.current, next)) {
          prevBoundsRef.current = next;
          setSelectionBounds(next);
        }
      };

      if (!appState) {
        setDefaultData();
        return;
      }

      const selectedIdKeys = selectedIds ? Object.keys(selectedIds) : [];

      if (selectedIdKeys.length === 0) {
        setDefaultData();
        return;
      }

      const selected = elms.filter(
        el => selectedIdKeys.includes(el.id) && !el.locked && !el.isDeleted,
      );

      if (selected.length === 0) {
        setDefaultData();
        return;
      }

      const [minX, minY, maxX, maxY] = getCommonBounds(selected);

      const next: SelectionBounds = {
        x: (minX + (appState.scrollX || 0)) * zoomLevel,
        y: (minY + (appState.scrollY || 0)) * zoomLevel,
        width: (maxX - minX) * zoomLevel,
        height: (maxY - minY) * zoomLevel,
        visible: true,
        itemId: selected.length === 1 ? selected[0].id : undefined,
      };

      if (!boundsEqual(prevBoundsRef.current, next)) {
        prevBoundsRef.current = next;
        setSelectionBounds(next);
      }
    },
    [],
  );

  const resetBounds = useCallback(() => {
    prevFingerprintRef.current = "";
    prevBoundsRef.current = initialBounds;
    setSelectionBounds(initialBounds);
    setElements([]);
  }, []);

  return {
    handleChange,
    selectionBounds,
    setSelectionBounds,
    resetBounds,
    elements,
  };
};
