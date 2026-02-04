import { useState} from "react";

import { useHotkeys } from "@/hooks/use-hotkeys";
import { useCustomSearchParams } from "@/hooks/useCustomSearchParams";
import { useSaveDraw } from "@/hooks/useSaveDraw";
import { clearObjects } from "@/stores/zustand/object/actions";
import { setActiveHistory, toggleAutoSave } from "@/stores/zustand/ui/actions";
import { sharedIcons } from "@/constants/icons";
import { HISTORY_KEY } from "@/constants/keys";
import { appShortcuts } from "@/constants/shortcuts";

export const actions = [
  {
    id: "new_draw",
    icon: sharedIcons.new_draw,
    divider: false,
    needAuth: false
  },
  {
    id: "auto_save",
    icon: "hugeicons:cloud-saving-done-01",
    divider: false,
    needAuth: true
  },
  {
    id: "save",
    icon: sharedIcons.save,
    divider: true,
    needAuth: true
  },
] as const;

export const useFileActions = (drawAPI: DrawAPI) => {
  const {removeParam} = useCustomSearchParams();
  const [isOpenRestAlert, setIsOpenRestAlert] = useState(false);

  const { handleSave, isPendingSave, autoSave } = useSaveDraw(drawAPI);

  const showRestAlert = () => {
    setIsOpenRestAlert(true);
  };

  const restDraw = async (save?: boolean) => {
    if (save) {
      await handleSave(false);
    }
    drawAPI?.resetScene();
    drawAPI?.resetCursor();
    clearObjects();
    setActiveHistory("");
    removeParam(HISTORY_KEY);
    setIsOpenRestAlert(false);
  };

  const handlers = {
    auto_save: () => toggleAutoSave(),
    new_draw: showRestAlert,
    save: () => handleSave(),
  };

  useHotkeys([
    [appShortcuts.new_draw, showRestAlert],
    [appShortcuts.save_draw, handlers.save],
  ]);

  const selected = {
    auto_save: autoSave,
  };



  return {
    handlers,
    isSaving: isPendingSave,
    selected,
    isOpenRestAlert,
    setIsOpenRestAlert,
    restDraw,
  };
};
