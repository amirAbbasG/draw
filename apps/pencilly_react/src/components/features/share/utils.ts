import { ExcalidrawElement } from "@excalidraw/element/types";
import { BinaryFiles, Collaborator } from "@excalidraw/excalidraw/types";


export function getStatusColor(collaborator: Collaborator): string {
  if (collaborator.isInCall) return "bg-green-500";
  if (collaborator.userState === "active") return "bg-green-500";
  if (collaborator.userState === "idle") return "bg-yellow-500";
  return "bg-muted-foreground/50";
}

// Lightweight fingerprint for elements (avoid deep comparison)
export const getElementsFingerprint = (
  elements: readonly ExcalidrawElement[],
) => {
  if (!elements.length) return "empty";
  // Use length + first/last element IDs + versions for quick comparison
  const first = elements[0];
  const last = elements[elements.length - 1];
  return `${elements.length}-${first.id}-${first.version || 0}-${last.id}-${last.version || 0}`;
};

// Lightweight fingerprint for files
export const getFilesFingerprint = (files: BinaryFiles) => {
  const keys = Object.keys(files);
  if (!keys.length) return "empty";
  return `${keys.length}-${keys.join(",")}`;
};
