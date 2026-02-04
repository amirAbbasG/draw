import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAxiosFetcher } from "@/hooks/useAxiosFetch";
import { useCheckIsAuth } from "@/hooks/useCheckIsAuth";
import { useCustomSearchParams } from "@/hooks/useCustomSearchParams";
import { useSaveDraw } from "@/hooks/useSaveDraw";
import { envs } from "@/constants/envs";
import { SHARE_KEY } from "@/constants/keys";
import {HistoryItem} from "@/components/features/history/types";

interface ShareResponse {
  shareId: string;
  shareUrl: string;
  createdAt: string;
}

export interface ShareData extends HistoryItem{
  expiresAt: string;
}

export const useExportLink = (drawAPI: DrawAPI, setData: (data: HistoryItem) => void) => {
  const [shareLink, setShareLink] = useState("");
  const { handleSave } = useSaveDraw(drawAPI);
  const { axiosFetch } = useAxiosFetcher();
  const { fnWithAuth } = useCheckIsAuth();
  const { currentValue: paramShareId, removeParam } =
    useCustomSearchParams(SHARE_KEY);

  const { mutateAsync: exportLink, isPending: isExporting } = useMutation({
    mutationFn: async () => {
      const saveData = await handleSave();
      if (saveData) {
        const data = await axiosFetch<ShareResponse>({
          showError: true,
          url: `/draws/histories/${saveData.id}/share/`,
          method: "post",
        });
        if (data) {
          setShareLink(
            `${envs.siteUrl}?tab=2d_canvas&${SHARE_KEY}=${data.shareId}`,
          );
        } else {
          toast.error("Failed to export the drawing. Please try again.");
        }
      }
    },
  });

  useEffect(() => {
    const fetchShareData = async () => {
      const data = await axiosFetch<ShareData>({
        showError: true,
        url: `/draws/share/${paramShareId}/`,
        method: "get",
      });
      if (data) {
        setData(data);
      }
      removeParam(SHARE_KEY);
    };
    if (paramShareId && drawAPI) {
      void fetchShareData();
    }
  }, [paramShareId, drawAPI]);

  return {
    shareLink,
    setShareLink,
    exportLink: fnWithAuth(exportLink) as () => Promise<void>,
    isExporting,
  };
};
