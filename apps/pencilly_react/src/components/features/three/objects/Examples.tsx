import React, { useEffect, useRef } from "react";

import * as THREE from "three";

export function ExampleCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData = {
        isUserCreated: true,
        name: "Example Cube",
      };
    }
  }, []);

  return (
    <mesh ref={meshRef} position={[2, 1, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

export function ExampleGroup() {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData = {
        isUserCreated: true,
        name: "Example Group",
      };
    }
  }, []);

  return (
    <group ref={groupRef} position={[-2, 1, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="cyan" />
      </mesh>
      <mesh position={[0.7, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
      <mesh position={[0.35, 0.7, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.3, 0.3, 0.8]} />
        <meshStandardMaterial color="lime" />
      </mesh>
    </group>
  );
}
