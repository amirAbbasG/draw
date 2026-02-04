import * as THREE from "three";

import { useObjectStore } from "@/stores/zustand/object/object-store";
import { StoredObject } from "@/stores/zustand/object/types";
import {
  setIsDeleting,
  setSelectedObject,
} from "@/stores/zustand/three/actions";
import { useThreeStore } from "@/stores/zustand/three/three-store";

const threeObjectToStoredObject = (object: THREE.Object3D): StoredObject => {
  console.log(`Storing object: ${object.uuid}, type: ${object.type}`);

  // Use the UUID consistently - critical for object identity
  const id = object.uuid;
  const name = object.userData?.name || `Object ${id.substring(0, 8)}`;
  const position: [number, number, number] = [
    object.position.x,
    object.position.y,
    object.position.z,
  ];
  const rotation: [number, number, number] = [
    object.rotation.x,
    object.rotation.y,
    object.rotation.z,
  ];
  const scale: [number, number, number] = [
    object.scale.x,
    object.scale.y,
    object.scale.z,
  ];

  // Ensure the userData.id is set consistently
  object.userData.id = id;
  object.userData.isSerializedFromCode = true;

  // Store as global reference to prevent garbage collection
  if (!window.__objectReferences) {
    window.__objectReferences = new Map();
  }
  window.__objectReferences.set(id, object);

  if (object instanceof THREE.Mesh) {
    console.log(`Storing mesh: ${id}, geometry: ${object.geometry.type}`);
    // Get original geometry and material to preserve as much data as possible
    const geo = object.geometry;
    const mat = object.material as THREE.Material;

    // Store references to prevent garbage collection
    window.__objectReferences.set(`${id}_geometry`, geo);
    window.__objectReferences.set(`${id}_material`, mat);

    return {
      id,
      type: "mesh",
      name,
      position,
      rotation,
      scale,
      userData: { ...object.userData },
      geometry: {
        type: geo.type,
        parameters: {
          // We store the ID to look it up later
          objectId: id,
        },
      },
      material: {
        type: mat.type,
        color:
          mat instanceof THREE.MeshStandardMaterial
            ? mat.color?.getHexString() || "ffffff"
            : "ffffff",
        parameters: {
          // We store the ID to look it up later
          objectId: id,
        },
      },
    };
  } else if (object instanceof THREE.Group) {
    console.log(`Storing group: ${id}, children: ${object.children.length}`);
    // Process children
    const children: StoredObject[] = [];
    object.children.forEach(child => {
      if (child instanceof THREE.Object3D) {
        children.push(threeObjectToStoredObject(child));
      }
    });

    return {
      id,
      type: "group",
      name,
      position,
      rotation,
      scale,
      userData: { ...object.userData },
      children,
    };
  }

  // Handle generic THREE.Object3D objects
  console.log(`Storing generic object3D: ${id}`);

  // Process children if any
  const children: StoredObject[] = [];
  if (object.children.length > 0) {
    object.children.forEach(child => {
      if (child instanceof THREE.Object3D) {
        children.push(threeObjectToStoredObject(child));
      }
    });
  }

  return {
    id,
    type: "object",
    name,
    position,
    rotation,
    scale,
    userData: { ...object.userData },
    children: children.length > 0 ? children : undefined,
  };
};

// Helper function to prepare materials for proper rendering
const prepareMaterial = (material: THREE.Material) => {
  // Common fixes for materials
  if (material) {
    // Ensure the material is using appropriate side setting (GLTF often uses backside only)
    material.side = THREE.DoubleSide;

    // Ensure color is properly set for common material types
    if (material instanceof THREE.MeshStandardMaterial) {
      // Make sure color has a proper value and not black by default
      if (!material.color || material.color.getHex() === 0x000000) {
        material.color.set(0xcccccc); // Set a light gray as fallback
      }
      // Increase emission for better visibility
      if (material.emissive && material.emissive.getHex() === 0) {
        material.emissive.set(0x111111);
      }
      // Make sure materials reflect light properly
      material.metalness = material.metalness || 0.3;
      material.roughness = material.roughness || 0.7;
    } else if (material instanceof THREE.MeshBasicMaterial) {
      // For basic materials, ensure color is not black
      if (!material.color || material.color.getHex() === 0x000000) {
        material.color.set(0xcccccc);
      }
    } else if (
      material instanceof THREE.MeshPhongMaterial ||
      material instanceof THREE.MeshLambertMaterial
    ) {
      // Ensure the material color isn't black
      if (!material.color || material.color.getHex() === 0x000000) {
        material.color.set(0xcccccc);
      }
    }

    // Ensure textures are properly set up if present
    if ("map" in material && material.map) {
      // Use proper casting for TypeScript
      (material.map as THREE.Texture).colorSpace = THREE.SRGBColorSpace;
      material.needsUpdate = true;
    }

    // Update the material to apply changes
    material.needsUpdate = true;
  }
};

export const incrementMeshCount = (isDeleting: boolean) => {
  useObjectStore.setState(state => {
    state.meshCount = state.meshCount + 1;
  });
};

export const addObject = (object: THREE.Object3D) => {
  const storedObject = threeObjectToStoredObject(object);
  useObjectStore.setState(state => {
    state.objects.push(storedObject);
    state.meshCount = state.meshCount + 1;
  });
};

export const updateObject = (id: string, updates: Partial<StoredObject>) => {
  useObjectStore.setState(state => {
    const obj = state.objects.find(o => o.id === id);
    if (obj) {
      Object.entries(updates).map(
        ([key, value]) => ((obj as any)[key as keyof StoredObject] = value),
      );
    }
  });
};

export const removeObject = (id: string) => {
  const appState = useThreeStore.getState();
  const { selectedObject } = appState;
  useObjectStore.setState(state => {
    state.objects = state.objects.filter(obj => obj.id !== id);
  });

  if (
    selectedObject &&
    (selectedObject.uuid === id || selectedObject.userData?.id === id)
  ) {
    setSelectedObject(null);

    // Wait a tick before clearing the deletion flag to ensure all updates have propagated
    setTimeout(() => {
      setIsDeleting(false);
    }, 10);
  } else {
    // Not deleting the selected object, so just turn off deleting flag
    setTimeout(() => {
      setIsDeleting(false);
    }, 10);
  }
};

export const clearObjects = () => {
  useObjectStore.setState(state => {
    state.objects = [];
    state.meshCount = 0;
  });
};

export const setObjects = (objects: StoredObject[]) => {
  useObjectStore.setState(state => {
    state.objects = objects;
    state.meshCount = objects.length;
  });
};

export const addObjectFromCode = (
  code: string,
  onBeforeAdd?: (model: THREE.Object3D) => void,
) => {
  try {
    // Create a function from the code string
    const createObjectFunction = new Function("THREE", code);

    // Execute the function with THREE library as parameter
    const object = createObjectFunction(THREE) as THREE.Object3D;

    // Check that the object is a valid THREE.Object3D type (Mesh, Group, or generic Object3D)
    if (!(object instanceof THREE.Object3D)) {
      console.log("object:", object);
      console.error(
        "The code must return a THREE.Object3D, THREE.Mesh, or THREE.Group object",
      );
      return null;
    }

    // Log the specific type for debugging
    if (object instanceof THREE.Mesh) {
      console.log("Adding Mesh from code");
    } else if (object instanceof THREE.Group) {
      console.log("Adding Group from code");
    } else {
      console.log("Adding generic Object3D from code");
    }

    // Set properties
    object.userData.isUserCreated = true;
    object.userData.name = `User Object ${useObjectStore.getState().meshCount + 1}`;
    onBeforeAdd?.(object);
    // Add to store - threeObjectToStoredObject will handle the specific type
    addObject(object);

    return object;
  } catch (err) {
    console.error("Error executing code:", err);
    return null;
  }
};

export const addObjectWithGltf = async (
  url: string,
  onBeforeAdd?: (model: THREE.Object3D) => void,
) => {
  try {
    // Dynamically import GLTFLoader
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        url,
        gltf => {
          const model = gltf.scene;

          if (!(model instanceof THREE.Object3D)) {
            console.error(
              "The GLTF file did not return a valid THREE.Object3D",
            );
            resolve(null);
            return;
          }

          // Fix materials - traverse the model and ensure materials are properly configured
          model.traverse(object => {
            if (object instanceof THREE.Mesh) {
              // Enable shadows
              object.castShadow = true;
              object.receiveShadow = true;

              // Fix materials
              if (object.material) {
                // If it's a single material
                if (!Array.isArray(object.material)) {
                  prepareMaterial(object.material);
                } else {
                  // If it's an array of materials
                  object.material.forEach(mat => prepareMaterial(mat));
                }
              }
            }
          });

          // Set properties
          model.userData.isUserCreated = true;
          model.userData.name = `GLTF Model ${useObjectStore.getState().meshCount + 1}`;

          // Position the model slightly above the ground to prevent clipping
          model.position.set(0, 1, 0);

          onBeforeAdd?.(model);

          // Add to store
          addObject(model);
          console.log("Added GLTF model to scene:", model);

          resolve(model);
        },
        // Progress callback
        xhr => {
          console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        // Error callback
        error => {
          console.error("Error loading GLTF model:", error);
          reject(error);
        },
      );
    });
  } catch (err) {
    console.error("Error importing or loading GLTF model:", err);
    return null;
  }
};
