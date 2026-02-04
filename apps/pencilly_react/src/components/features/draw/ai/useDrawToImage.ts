import { FileId } from "@excalidraw/element/types";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { BinaryFileData, DataURL } from "@excalidraw/excalidraw/types";

import { useMutateWithJob } from "@/hooks/useMutateWithJob";
import { getDrawRequestData, getExportData } from "@/lib/draw/export";
import { getBlobImageDimensions } from "@/lib/file";
import { AiResult, GenerateResponse } from "@/types/generate";
import {useCheckIsAuth} from "@/hooks/useCheckIsAuth";
import {sharedIcons} from "@/constants/icons";

export interface DrawToImageResult extends AiResult {
  image_url: string;
  image_b64?: string;
}

export type DrawToImageRes = GenerateResponse<DrawToImageResult>;

export const toImageConfig = {
  key: "to_image",
  icon: sharedIcons.image_ai,
} as const

export const useDrawToImage = (
  drawAPI: DrawAPI,
  chooseSelections: boolean = false,
) => {
  const { fnWithAuth } = useCheckIsAuth();
  const { mutateAsync, isPending: isGenerating } = useMutateWithJob({
    url: "/draws/jobs/enhance/",
    method: "post",
  });

  const generate = async () => {
    if (!drawAPI || isGenerating) return;
    const { elements, appState } = getExportData(drawAPI);

    try {
      const fd = await getDrawRequestData(
        drawAPI,
        chooseSelections,
        "Convert this rough sketch into an image of a low-poly 3D model. Include only the object in the image, with nothing else. ",
      );

      const data = (await mutateAsync({
        body: fd,
      })) as DrawToImageRes;

      if (!data) return;
      const url = data?.result?.image_url;
      const res = await fetch(url);
      const resBlob = await res.blob();

      const { width, height } = await getBlobImageDimensions(resBlob);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const fileId = crypto.randomUUID() as FileId;
        const file: BinaryFileData = {
          dataURL: base64data as DataURL,
          mimeType: "image/jpeg",
          created: Date.now(),
          id: fileId,
        };
        drawAPI.addFiles([file]);
        const image = convertToExcalidrawElements([
          {
            type: "image",
            x: 300,
            y: 300,
            width,
            height,
            fileId,
          },
        ])?.[0];
        drawAPI.updateScene({
          elements: [...elements, image],
          appState,
        });
      };
      reader.readAsDataURL(resBlob);
    } catch (e) {
      console.log(e);
    }
  };
  return { generate: fnWithAuth(generate, true), isGenerating };
};
