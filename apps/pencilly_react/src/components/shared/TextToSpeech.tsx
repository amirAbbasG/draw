import React, { type FC } from "react";

import AppIconButton from "@/components/ui/custom/app-icon-button";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";
import {useTranslations} from "@/i18n";

interface IProps {
  text: string;
  size?: "default" | "xl" | "lg" | "sm" | "xs";
  className?: string;
}

const TextToSpeech: FC<IProps> = ({ text, className, size = "xs" }) => {
  const t = useTranslations("shared");
  const { isSpeaking, handlePlaySpeak, handleStopSpeak } =
    useTextToSpeech(text);
  return (
    <AppIconButton
      size={size}
      selected={isSpeaking}
      icon={isSpeaking ? "tabler:player-stop-filled" : "tabler:volume"}
      title={isSpeaking ? t("stop") : t("speak")}
      onClick={() => (isSpeaking ? handleStopSpeak() : handlePlaySpeak())}
      color={isSpeaking ? "danger" : "default"}
      className={cn(className)}
    />
  );
};

export default TextToSpeech;
