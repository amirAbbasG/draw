import React, { useEffect } from "react";

import { EDITOR_LS_KEYS } from "@excalidraw/common";
import { TTDDialog, TTDDialogTrigger } from "@excalidraw/excalidraw";

import {
  TextToMermaidRes,
  useTextToMermaid,
} from "@/components/features/draw/ai/useTextToMermaid";
import { normalizeMermaidCode } from "@/components/features/draw/ai/utils";
import { useCustomSearchParams } from "@/hooks/useCustomSearchParams";
import { MERMAID_KEY } from "@/constants/keys";

interface IProps {
  drawAPI: DrawAPI;
}

const TextToDiagram = ({ drawAPI }: IProps) => {
  const { mutateAsync } = useTextToMermaid();
  const { currentValue: paramMermaidId, removeParam } =
    useCustomSearchParams(MERMAID_KEY);

  const onTextSubmit = async (prompt: string) => {
    try {
      const data = (await mutateAsync({
        body: { prompt },
      })) as TextToMermaidRes;
      return {
        generatedResponse: data?.result?.diagram || "",
        rateLimit: 10,
        rateLimitRemaining: 10,
      };
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (paramMermaidId && drawAPI) {
        const storageMermaid = localStorage.getItem(paramMermaidId);
        if (storageMermaid) {
          localStorage.setItem(
            EDITOR_LS_KEYS.MERMAID_TO_EXCALIDRAW,
            JSON.stringify(normalizeMermaidCode(storageMermaid)),
          );
          drawAPI.updateScene({
            appState: {
              openDialog: {
                name: "ttd",
                tab: "mermaid",
              },
            },
          });
          localStorage.removeItem(paramMermaidId);
        }
        removeParam(MERMAID_KEY);
      }
    }, 500);
  }, [paramMermaidId, drawAPI]);

  return (
    <>
      <TTDDialog onTextSubmit={onTextSubmit} />
      <TTDDialogTrigger />
    </>
  );
};

export default TextToDiagram;
