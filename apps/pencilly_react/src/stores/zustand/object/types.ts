export interface Geometry {
  type: string;
  parameters: Record<string, any>;
}

export interface Material {
  type: string;
  color: string;
  parameters: Record<string, any>;
}

export interface StoredObject {
  id: string;
  type: "mesh" | "group" | "object";
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  userData: Record<string, any>;
  // For a mesh, define its geometry and material
  geometry?: Geometry;
  material?: Material;
  // For a group, define its children
  children?: StoredObject[];
}

export interface ObjectStoreState {
  // Storage
  objects: StoredObject[];
  meshCount: number;
}
