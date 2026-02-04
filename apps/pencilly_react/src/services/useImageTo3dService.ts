import { useShallow } from "zustand/react/shallow";

import {
  applyWireframeToObject,
  fitObjectToSize,
} from "@/components/features/three/utils";
import { useMutateWithJob } from "@/hooks/useMutateWithJob";
import { processThreeJsCode } from "@/lib/3d/ai-proccess";
import { addObjectFromCode } from "@/stores/zustand/object/actions";
import { useThreeStore } from "@/stores/zustand/three/three-store";
import { AiResult, GenerateResponse } from "@/types/generate";
import {useCheckIsAuth} from "@/hooks/useCheckIsAuth";

export interface DrawToThreeResult extends AiResult {
  code: string;
}

export type DrawToThreeRes = GenerateResponse<DrawToThreeResult>;

export const useImageTo3dService = (onSuccess?: () => void) => {
  const { fnWithAuth } = useCheckIsAuth();
  const wireframeMode = useThreeStore(
    useShallow(state => state.settings.wireframeMode),
  );

  const { mutateAsync, isPending: isProcessing } = useMutateWithJob({
    url: "/draws/jobs/threejs/",
    method: "post",
  });

  const generate = async (body: any) => {
    try {
      const data = (await mutateAsync({
        body,
      })) as DrawToThreeRes;

      if (data) {
        const code = data.result?.code || "";
        console.log(code);
        const result = addObjectFromCode(processThreeJsCode(code), model => {
          fitObjectToSize(model, 2);
          if (wireframeMode) {
            applyWireframeToObject(model);
          }
        });
        if (result) {
          onSuccess?.();
          setTimeout(() => {
            addObjectFromCode(processThreeJsCode(code));
          }, 500);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  return {
    isProcessing,
    generate:  fnWithAuth(generate, true),
  };
};
