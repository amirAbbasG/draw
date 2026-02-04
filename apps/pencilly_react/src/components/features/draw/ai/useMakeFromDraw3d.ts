import { useImageTo3dService } from "@/services/useImageTo3dService";
import { useParamsTab } from "@/hooks/useParamsTab";
import { getDrawRequestData } from "@/lib/draw/export";
import {useCheckIsAuth} from "@/hooks/useCheckIsAuth";
import {sharedIcons} from "@/constants/icons";

export const to3dConfig = {
  key: "3d",
  icon: sharedIcons.make_3d,
} as const

export const useMakeFromDraw3d = (
  drawAPI: DrawAPI,
  chooseSelections: boolean = false,
  prompt?: string,
) => {
  const { setActiveParamTab } = useParamsTab();
  const { fnWithAuth } = useCheckIsAuth();


  const { isProcessing, generate } = useImageTo3dService(() => {
    setActiveParamTab("3d_world");
  });

  const make3d = async () => {
    if (!drawAPI || isProcessing) return;
    try {
      const fd = await getDrawRequestData(drawAPI, chooseSelections, prompt);
      await generate(fd);
    } catch (e) {
      console.log(e);
    }
  };
  return { make3d: fnWithAuth(make3d, true), isProcessing };
};
