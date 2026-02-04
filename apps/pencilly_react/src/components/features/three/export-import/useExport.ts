import { useTranslations } from "@/i18n";
import { toast } from "sonner";
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

export const useExport = () => {
  const t = useTranslations("three");

  const exportScene = () => {
    // @ts-ignore - Access the scene from the global variable
    const scene = window.__threeScene;
    if (!scene) return;

    // Create a temporary scene with only user-created objects
    const exportScene = new THREE.Scene();

    // Clone only user-created objects
    scene.traverse((object: THREE.Object3D) => {
      if (object.userData && object.userData.isUserCreated === true) {
        console.log(
          "Found user object to export:",
          object.userData.name || "Unnamed object",
        );
        const clonedObject = object.clone();
        exportScene.add(clonedObject);
      }
    });

    // Check if we found any user objects
    if (exportScene.children.length === 0) {
      console.warn("No user-created objects found to export");
      toast.error(t("no_object_error"));
      return;
    }

    const exporter = new GLTFExporter();
    exporter.parse(
      exportScene,
      (gltf: any) => {
        console.log("GLTF export successful:", gltf);
        const blob = new Blob([JSON.stringify(gltf)], {
          type: "application/json",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "scene.gltf";
        link.click();
      },
      (error: ErrorEvent) => {
        console.error("An error happened during export:", error);
        toast.error(t("failed_export_error") + error.message);
      },
      { binary: false },
    );
  };

  return {
    exportScene,
  };
};
