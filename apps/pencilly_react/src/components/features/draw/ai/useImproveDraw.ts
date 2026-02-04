import { isExcalidrawElement } from "@excalidraw/element";

import { useCheckIsAuth } from "@/hooks/useCheckIsAuth";
import { useMutateWithJob } from "@/hooks/useMutateWithJob";
import { getDrawRequestData, getExportData } from "@/lib/draw/export";
import { sharedIcons } from "@/constants/icons";
import { AiResult, GenerateResponse } from "@/types/generate";

export const improveConfig = {
  key: "improve",
  icon: sharedIcons.wand,
} as const;

export interface ImproveDrawResult extends AiResult {
  code: string;
}

export type ImproveDrawRes = GenerateResponse<ImproveDrawResult>;

export const useImproveDraw = (
  drawAPI: DrawAPI,
  onSuccess: () => void,
  chooseSelections: boolean = false,
) => {
  const { fnWithAuth } = useCheckIsAuth();
  const { mutateAsync, isPending: isImproving } = useMutateWithJob({
    url: "/draws/jobs/enhance/code/",
    method: "post",
  });

  const improve = async (prompt: string) => {
    if (!drawAPI || isImproving) return;
    const { elements: selectedElements } = getExportData(
      drawAPI,
      chooseSelections,
    );
    try {
      const fd = await getDrawRequestData(
        drawAPI,
        chooseSelections,
        prompt,
        "",
        {
          code: JSON.stringify(selectedElements),
        },
      );

      const data = (await mutateAsync({
        body: fd,
      })) as ImproveDrawRes;

      if (!data) return;

      const { elements, appState } = getExportData(drawAPI);
      const newElement = JSON.parse(data.result?.code || "[]") || [];
      if (Array.isArray(newElement)) {
        const validElements = newElement.filter(el => isExcalidrawElement(el));
        drawAPI.updateScene({
          elements: [...elements, ...validElements],
          appState: {
            ...appState,
            selectedElementIds: {},
          },
        });
        onSuccess?.();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return {
    improve: fnWithAuth(improve, true),
    isImproving,
  };
};
