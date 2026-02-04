// Component to handle scene export
import { useEffect } from "react";

import { useThree } from "@react-three/fiber";

export function SceneExporter() {
  const { scene } = useThree();

  // Store scene reference in a global variable for external access
  useEffect(() => {
    // @ts-ignore - We're adding a custom property to window
    window.__threeScene = scene;
  }, [scene]);

  return null;
}
