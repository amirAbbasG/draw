import React from "react";

import AppIconButton from "@/components/ui/custom/app-icon-button";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { sharedIcons } from "@/constants/icons";
import {useTranslations} from "@/i18n";

interface IProps {
  transcript: string;
  setTranscript: (v: string) => void;
  size?: "default" | "xs" | "xl" | "lg" | "sm";
  className?: string;
}

const SpeechToText = ({
  transcript,
  setTranscript,
  size = "default",
  className,
}: IProps) => {
  const { isRecording, handleToggleRecording } = useSpeechToText({
    setTranscript,
    transcript,
  });
  const t = useTranslations("shared");

  return (
    <AppIconButton
      icon={isRecording ? sharedIcons.stop : sharedIcons.microphone}
      title={t(isRecording ? "stop" : "speech_to_text")}
      onMouseDown={() => {
        handleToggleRecording();
      }}
      iconClassName={isRecording ? "text-danger" : ""}
      className={className}
      size={size}
    />
  );
};

export default SpeechToText;
