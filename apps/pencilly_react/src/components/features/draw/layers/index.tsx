import { useState } from "react";

import { MainMenu, Sidebar } from "@excalidraw/excalidraw";

import LayersContent, {
  type LayersContentProps,
} from "@/components/features/draw/layers/LayersContent";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

const NAME = "layers";

function LayersSidebar(props: LayersContentProps) {
  const t = useTranslations("layers");
  const [docked, setDocked] = useState(false);

  return (
    <Sidebar name={NAME} docked={docked} onDock={setDocked}>
      <Sidebar.Header>
        <AppTypo>{t("title")}</AppTypo>
      </Sidebar.Header>
      <LayersContent {...props} />
    </Sidebar>
  );
}

LayersSidebar.Trigger = ({ drawAPI }: { drawAPI: DrawAPI }) => {
  const t = useTranslations("layers");
  return (
    <MainMenu.Item
      onClick={() =>
        drawAPI?.toggleSidebar({
          name: NAME,
        })
      }
      icon={<AppIcon className="size-4" icon={sharedIcons.layers} />}
    >
      {t("title")}
    </MainMenu.Item>
  );
};

export default LayersSidebar;
