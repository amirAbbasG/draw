import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react";

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import FileSaver from "file-saver";
import { useTranslations } from "@/i18n";
import * as THREE from "three";

import { type ExampleItem } from "@/components/features/three/ai/exampes";
import { useImport } from "@/components/features/three/export-import/useImport";
import WireframeMode from "@/components/features/three/settings/WireframeMode";
import DynamicButton from "@/components/shared/DynamicButton";
import { Button } from "@/components/ui/button";
import { sharedIcons } from "@/constants/icons";

interface IProps {
  setPrompt: (val: string) => void;
  item?: ExampleItem;
  onClose: () => void;
}

const Model: FC<{ url: string; desiredSize?: number }> = ({
  url,
  desiredSize = 1,
}) => {
  const { scene } = useGLTF(url) as any;
  const ref = useRef<THREE.Group | null>(null);

  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = desiredSize / maxDim;
    return [s, s, s] as [number, number, number];
  }, [scene, url, desiredSize]);

  return <primitive ref={ref} object={scene} scale={scale} />;
};

const ExampleDetails: FC<IProps> = ({ item, setPrompt, onClose }) => {
  const { gltfImport } = useImport();
  const t = useTranslations("three.ai");
  const [wireframe, setWireframe] = useState(false);
  if (!item) return null;

  const glbUrl = `/3d/${item.glb}`;

  useEffect(() => {
    // optional preload for smoother preview
    try {
      useGLTF.preload(glbUrl);
    } catch {
      // ignore if preload isn't supported in certain setups
    }
  }, [glbUrl]);

  const handleDownloadGlb = () => {
    FileSaver.saveAs(glbUrl, item.glb);
  };

  const onImport = async () => {
    try {
      const res = await fetch(glbUrl);
      if (!res.ok) throw new Error(`Failed to fetch ${glbUrl}: ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], item.glb, {
        type: blob.type || "model/gltf-binary",
      });
      await gltfImport(file);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const onUsePrompt = () => {
    setPrompt(item.prompt);
    onClose();
  };

  return (
    <div className="w-full col gap-4 pt-4">
      <div className="w-full relative">
        <Button
          variant="outline"
          className="absolute top-2 end-2 z-10 bg-background-lighter"
          selected={wireframe}
          onClick={() => setWireframe(!wireframe)}
        >
          {t("wireframe")}
        </Button>
        <Canvas
          className="bg-background rounded w-full !h-[400px] lg:!h-[500px]"
          camera={{ position: [0, 1.5, 3], fov: 40 }}
        >
          <WireframeMode enabled={wireframe} />
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
            color="#ffffff"
          />
          {/* Add a ground fill light for better overall illumination */}
          <hemisphereLight
            args={["#ffffff", "#737171", 0.1]}
            position={[0, 10, 0]}
          />
          <directionalLight position={[5, 10, 7.5]} intensity={1} />
          <Suspense fallback={null}>
            <Model url={glbUrl} />
          </Suspense>
          <OrbitControls />
          <gridHelper />
        </Canvas>
      </div>
      <div className="row gap-2 justify-end">
        <DynamicButton
          icon={sharedIcons.plus}
          variant="secondary"
          onClick={onImport}
          title={t("add_to_scene")}
        />
        <DynamicButton
          icon={sharedIcons.download}
          variant="secondary"
          onClick={handleDownloadGlb}
          title={t("download")}
        />
        <Button icon={sharedIcons.text_ai} onClick={onUsePrompt}>
          {t("use_prompt")}
        </Button>
      </div>
    </div>
  );
};

export default ExampleDetails;
