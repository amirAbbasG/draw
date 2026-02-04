import { useRef } from "react";

import { useTranslations } from "@/i18n";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import {
  applyWireframeToObject,
  fitObjectToSize,
} from "@/components/features/three/utils";
import { addObjectWithGltf } from "@/stores/zustand/object/actions";
import { useThreeStore } from "@/stores/zustand/three/three-store";

export const useImport = () => {
  const t = useTranslations("three");
  const wireframeMode = useThreeStore(
    useShallow(state => state.settings.wireframeMode),
  );

  const inputRef = useRef<HTMLInputElement>(null);

  // Function to test importing a GLTF model
  const gltfImport = async (file?: File) => {
    if (!file) return;

    if (!/\.(gltf|glb)$/i.test(file.name)) {
      toast.error(
        t("invalid_file_error") ?? "Please select a .gltf or .glb file.",
      );
      // clear the input so the same file can be reselected later
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      await addObjectWithGltf(objectUrl, model => {
        fitObjectToSize(model, 2);
        if (wireframeMode) {
          applyWireframeToObject(model);
        }
      });
    } catch (error) {
      console.error("Error importing GLTF:", error);
      toast.error(
        (t("failed_import_error") ?? "Failed to import model") +
          " " +
          (error as Error).message,
      );
    } finally {
      // revoke the blob URL and reset input so same file can be chosen again
      URL.revokeObjectURL(objectUrl);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const openUpload = () => {
    inputRef.current?.click();
  };

  return {
    inputRef,
    gltfImport,
    openUpload,
  };
};
