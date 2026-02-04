import React from "react";

import {
  Bvh,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  Sky,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { useShallow } from "zustand/react/shallow";

import TextTo3D from "@/components/features/three/ai";
import { Crosshair } from "@/components/features/three/Crosshair";
import Index, {
  SceneExporter,
} from "@/components/features/three/export-import";
import { InfiniteGrid } from "@/components/features/three/objects/InfiniteGrid";
import { MeshCreator } from "@/components/features/three/objects/MeshCreator";
import { Ocean } from "@/components/features/three/objects/Ocean";
import { StoredObjects } from "@/components/features/three/objects/StoredObjects";
import { CamaraPos } from "@/components/features/three/settings/CammaraPos";
import FirstPersonController from "@/components/features/three/settings/FirstPersonController";
import { FocusDetector } from "@/components/features/three/settings/FocusDetector";
import SettingsPanel from "@/components/features/three/settings/SettingsPanel";
import WireframeMode from "@/components/features/three/settings/WireframeMode";
import RenderIf from "@/components/shared/RenderIf";
import { useThreeStore } from "@/stores/zustand/three/three-store";

export default function ThreeJSCanvas({
  visible = true,
}: {
  visible?: boolean;
}) {
  const settings = useThreeStore(useShallow(state => state.settings));

  return (
    <>
      <Canvas
        style={{ display: visible ? "block" : "none" }}
        gl={{
          // Preserve the WebGL context to prevent it from being killed
          // when there are too many WebGL instances
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
          // Keep the priority high for this WebGL context
          antialias: true,
          // Attempt to make this context more important than others
          failIfMajorPerformanceCaveat: false,
        }}
      >
        <RenderIf isTrue={settings.showPerformanceMonitor}>
          <Perf className="!top-16 !left-2 !right-auto" />
        </RenderIf>
        <RenderIf isTrue={settings.axesHelper}>
          <axesHelper args={[7]} />
        </RenderIf>
        {/* {visible && <Perf position="top-left" />} */}
        <ambientLight intensity={Math.PI / 2} />
        {/* Add directional light for better material rendering */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={Math.PI * 2}
          castShadow={true}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        {/* Add a secondary fill light from an opposite direction */}
        <directionalLight
          position={[-5, 5, -2]}
          intensity={Math.PI}
          color="#8088ff"
        />
        {/* Add a ground fill light for better overall illumination */}
        <hemisphereLight
          args={["#ffffff", "#737171", 0.1]}
          position={[0, 10, 0]}
        />
        <Sky
          distance={450000}
          sunPosition={[5, 1, 2]}
          inclination={0.1}
          azimuth={0.5}
          rayleigh={0.5}
          turbidity={10}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
        <Bvh>
          <StoredObjects />
        </Bvh>

        <RenderIf isTrue={visible}>
          <CamaraPos isOrbit={settings.controlMode === "orbit"} />
          {settings.controlMode === "first_person" ? (
            <FirstPersonController />
          ) : (
            <>
              <OrbitControls makeDefault enableDamping={false} />
              <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewport labelColor="black" />
              </GizmoHelper>
            </>
          )}
          <MeshCreator />
          <SceneExporter />
          {settings.showOcean ? <Ocean /> : <InfiniteGrid />}
          <WireframeMode enabled={settings.wireframeMode} />
        </RenderIf>
      </Canvas>

      <RenderIf isTrue={visible}>
        <FocusDetector />
        <Crosshair />
        {/* Button to export scene as gltf */}
        <Index />
        <div className="absolute top-4 end-4">
          <SettingsPanel />
        </div>
        <div className="absolute top-4 start-4">
          <TextTo3D />
        </div>
      </RenderIf>
    </>
  );
}
