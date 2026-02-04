import React from "react";

import { useTranslations } from "@/i18n";

import { useExport } from "@/components/features/three/export-import/useExport";
import { useImport } from "@/components/features/three/export-import/useImport";
import { Button } from "@/components/ui/button";
import { sharedIcons } from "@/constants/icons";

const ExportAndImport = () => {
  const t = useTranslations("three");

  const { exportScene } = useExport();
  const { inputRef, gltfImport, openUpload } = useImport();

  return (
    <div className="absolute left-4 bottom-4 z-50 row gap-2">
      <Button icon={sharedIcons.download} onClick={exportScene}>
        {t("export")}
      </Button>
      <Button
        variant="secondary"
        icon={sharedIcons.upload}
        onClick={openUpload}
      >
        {t("import")}
      </Button>
      <input
        type="file"
        ref={inputRef}
        hidden
        accept=".gltf,.glb"
        onChange={e => gltfImport(e.target.files?.[0])}
      />
    </div>
  );
};

export default ExportAndImport;
export { SceneExporter } from "@/components/features/three/export-import/SceneExporter";
