import React, { type FC } from "react";

import ImprovePopup from "@/components/features/draw/ai/ImprovePopup";
import {
  toImageConfig,
  useDrawToImage,
} from "@/components/features/draw/ai/useDrawToImage";
import {
  to3dConfig,
  useMakeFromDraw3d,
} from "@/components/features/draw/ai/useMakeFromDraw3d";
import { CreditConfirmationPopover } from "@/components/layout/CreditConfirm";
import DynamicButton from "@/components/shared/DynamicButton";
import { useTranslations } from "@/i18n";

interface IProps {
  drawAPI: DrawAPI;
  chooseSelections?: boolean;
}

const AITriggers: FC<IProps> = ({ drawAPI, chooseSelections }) => {
  const t = useTranslations("draw_tools");
  const { generate, isGenerating } = useDrawToImage(drawAPI, chooseSelections);
  const { make3d, isProcessing } = useMakeFromDraw3d(drawAPI, chooseSelections);

  const items = [
    {
      key: toImageConfig.key,
      icon: toImageConfig.icon,
      handleClick: generate,
      isPending: isGenerating,
      storageKey: "IMAGE",
    },
    {
      key: to3dConfig.key,
      icon: to3dConfig.icon,
      handleClick: make3d,
      isPending: isProcessing,
      storageKey: "TO3D",
    },
  ] as const;

  return (
    <>
      <ImprovePopup drawAPI={drawAPI} />
      {items.map(({ key, icon, handleClick, isPending, storageKey }) => (
        <CreditConfirmationPopover
          key={key}
          onConfirm={handleClick}
          featureName={t(key)}
          storageKey={storageKey}
        >
          <DynamicButton
            variant="ghost"
            icon={icon}
            title={t(key)}
            isPending={isPending}
            className="draw-btn"
          />
        </CreditConfirmationPopover>
      ))}
    </>
  );
};

export default AITriggers;
