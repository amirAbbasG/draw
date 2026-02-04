import * as THREE from "three";

export function fitObjectToSize(
  object: THREE.Object3D,
  targetSize = 1,
  alignToGround = true,
  groundY = 0,
) {
  object.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;

  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim <= 0) return;

  // Scale uniformly
  const scale = targetSize / maxDim;
  object.scale.multiplyScalar(scale);
  object.updateMatrixWorld(true);

  // Recenter the object so its center is at origin (x,z centered, y adjusted below)
  const newBox = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  newBox.getCenter(center);
  object.position.sub(center);
  object.updateMatrixWorld(true);

  // Optionally move the object so its bottom sits at `groundY`
  if (alignToGround) {
    const alignedBox = new THREE.Box3().setFromObject(object);
    const minY = alignedBox.min.y;
    // Move up by -minY so bottom becomes groundY (if groundY != 0, shift accordingly)
    object.position.y -= minY - groundY;
    object.updateMatrixWorld(true);
  }
}

export const applyWireframeToObject = (object: THREE.Object3D) => {
  object.traverse((obj: any) => {
    if (obj.isMesh && obj.material) {
      const setWire = (m: any) => {
        if (!m) return;
        // remember original wireframe isn't tracked here, WireframeMode manages global toggling
        m.wireframe = true;
        m.needsUpdate = true;
      };

      if (Array.isArray(obj.material)) {
        obj.material.forEach(setWire);
      } else {
        setWire(obj.material);
      }
    }
  });
};
