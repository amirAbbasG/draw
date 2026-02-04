import { useEffect } from "react";

import { useThree } from "@react-three/fiber";

// ...keep your existing imports

// Add this component to the file
const WireframeMode = ({ enabled }: { enabled: boolean }) => {
  const { scene } = useThree();

  useEffect(() => {
    if (!scene) return;

    const materials = new Set<any>();
    scene.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m: any) => materials.add(m));
        } else {
          materials.add(obj.material);
        }
      }
    });

    const prev = new Map<any, boolean>();
    materials.forEach(m => {
      prev.set(m, !!m.wireframe);
      m.wireframe = enabled;
      m.needsUpdate = true;
    });

    return () => {
      materials.forEach(m => {
        if (prev.has(m)) {
          m.wireframe = prev.get(m);
          m.needsUpdate = true;
        }
      });
    };
  }, [scene, enabled]);

  return null;
};

export default WireframeMode;
