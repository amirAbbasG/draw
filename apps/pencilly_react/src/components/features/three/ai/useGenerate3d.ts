import { useEffect, useState } from "react";

import { useShallow } from "zustand/react/shallow";

import { useImageTo3dService } from "@/services/useImageTo3dService";
// import {
//   imageBasePrompt,
//   imageSystemPrompt,
//   textBasePrompt,
//   textSystemPrompt,
// } from "@/components/features/three/ai/prompts";
import {
  applyWireframeToObject,
  fitObjectToSize,
} from "@/components/features/three/utils";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useMutateWithJob } from "@/hooks/useMutateWithJob";
import { processThreeJsCode } from "@/lib/3d/ai-proccess";
import { addObjectFromCode } from "@/stores/zustand/object/actions";
import { useThreeStore } from "@/stores/zustand/three/three-store";
import { AiResult, GenerateResponse } from "@/types/generate";
import {useCheckIsAuth} from "@/hooks/useCheckIsAuth";

export interface TextToThreeResult extends AiResult {
  code: string;
}

export type TextToThreeRes = GenerateResponse<TextToThreeResult>;

export type AiTabs = "text_to_3d" | "image_to_3d";

interface Form {
  prompt: string;
  count: number;
  image?: File;
}

const formInitialState: Form = {
  prompt: "",
  count: 1,
};

export const useGenerate3d = () => {
  const { fnWithAuth } = useCheckIsAuth();
  const [form, setForm] = useState(formInitialState);
  const [activeTab, setActiveTab] = useState<AiTabs>("text_to_3d");
  const { showCatchError } = useErrorToast();
  const wireframeMode = useThreeStore(
    useShallow(state => state.settings.wireframeMode),
  );

  const restForm = () => {
    setForm(formInitialState);
  };

  const { isProcessing: isProcessingImage, generate: gnerateByImage } =
    useImageTo3dService(restForm);

  const { mutateAsync, isPending: isProcessing } =
    useMutateWithJob<TextToThreeRes>({
      url: "/draws/jobs/threejs/prompt/",
      method: "post",
    });

  useEffect(() => {
    return () => restForm();
  }, []);

  const generate = async () => {
    try {
      if (activeTab === "text_to_3d") {
        const data = (await mutateAsync({
          body: {
            // prompt: `${textSystemPrompt}\n\n${textBasePrompt}\n\nDescription: ${form.prompt}`,
            prompt: form.prompt,
          },
        })) as TextToThreeRes;

        if (data) {
          addObjectFromCode(
            processThreeJsCode(data.result?.code || ""),
            model => {
              fitObjectToSize(model, 2);
              if (wireframeMode) {
                applyWireframeToObject(model);
              }
            },
          );
          restForm();
        }
      } else {
        if (!form.image) return;
        const fd = new FormData();
        fd.append("image", form.image);
        // fd.append("prompt", `${imageSystemPrompt} \n\n${imageBasePrompt}`);
        fd.append("prompt", "");
        fd.append("image_base64", "");
        fd.append("webhook_url", "");
        await gnerateByImage(fd);
      }
    } catch (e) {
      console.log(e);
      showCatchError(e);
    } finally {
    }
  };

  const onChange = (data: Partial<Form>) => {
    setForm(prev => ({ ...prev, ...data }));
  };

  return {
    generate:  fnWithAuth(generate, true),
    isProcessing: isProcessing || isProcessingImage,
    onChange,
    restForm,
    form,
    activeTab,
    setActiveTab,
  };
};
