import type { BinaryFileData, BinaryFiles } from "@excalidraw/excalidraw/types";
import { exportToBlob, exportToSvg } from "@excalidraw/utils";
import { toast } from "sonner";

import { blobToBase64 } from "@/lib/file";
import { isEmpty } from "@/lib/utils";

export const getUsedFiles = (files: BinaryFiles, elements: DrawElements) => {
  return Object.values(files).reduce(
    (acc, file) => {
      if (elements.some(el => "fileId" in el && el.fileId === file.id)) {
        acc[file.id] = file;
      }
      return acc;
    },
    {} as Record<string, BinaryFileData>,
  );
};

export const getExportData = (
  drawAPI: DrawAPI,
  chooseSelections: boolean = false,
) => {
  const allElements = drawAPI!.getSceneElements();
  const appState = drawAPI!.getAppState();

  const allFiles = drawAPI!.getFiles();

  const selected = appState.selectedElementIds;
  const elements = chooseSelections
    ? allElements.filter(e => e.id in selected)
    : allElements;

  const files = getUsedFiles(allFiles, elements);

  return {
    elements,
    appState,
    files,
  };
};

export const getDrawBlob = async (
  drawAPI: DrawAPI,
  chooseSelections: boolean = false,
  mimeType: string = "image/png",
) => {
  if (!drawAPI) return;
  const elements = drawAPI.getSceneElements();
  if (isEmpty(elements)) {
    toast.error("Please draw something first.");
    throw new Error("No elements to export");
  }

  return await exportToBlob({
    ...getExportData(drawAPI, chooseSelections),
    mimeType,
  });
};

export const getDrawBase64 = async (
  drawAPI: DrawAPI,
  chooseSelections: boolean = false,
  mimeType: string = "image/png",
) => {
  const drawBlob = await getDrawBlob(drawAPI, chooseSelections, mimeType);
  if (!drawBlob) return;
  const drawBase64 = await blobToBase64(drawBlob);

  return `data:${mimeType};base64,${drawBase64}`;
};

export const getDrawSvg = async (
  drawAPI: DrawAPI,
  chooseSelections: boolean = false,
) => {
  if (!drawAPI) return;

  return await exportToSvg({
    ...getExportData(drawAPI, chooseSelections),
  });
};


export const getDrawRequestData = async (
  drawAPI: DrawAPI,
  chooseSelections: boolean = false,
  prompt: string = "",
  image_base64: string = "",
  extraData: Record<string, any> = {},
) => {
  const blob = await getDrawBlob(drawAPI, chooseSelections);
  const image = new File([blob], "draw.png", { type: "image/png" });
  const fd = new FormData();

  fd.append("image", image);
  fd.append("prompt", prompt);
  fd.append("image_base64", image_base64);
  fd.append("webhook_url", "");

    Object.entries(extraData).forEach(([key, value]) => {
    fd.append(key, value);
    })

  return fd;
};
