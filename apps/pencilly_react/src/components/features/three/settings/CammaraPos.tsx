import { useEffect } from "react";

import { useThree } from "@react-three/fiber";

export const CamaraPos = ({ isOrbit }: { isOrbit: boolean }) => {
  const { camera } = useThree();
  useEffect(() => {
    if (isOrbit) {
      // Positioned higher and further back for better overview
      camera.position.set(5, 5, 10);
      camera.lookAt(0, 0, 0);
    } else {
      // Eye-level for first person
      camera.position.set(0, 1.7, 5);
    }
  }, [camera, isOrbit]);
  return null;
};
