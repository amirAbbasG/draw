import React, { type FC } from "react";

import type { RecordingMode } from "@/components/features/screen-recorder/useMediaRecorder";
import { isScreenCaptureSupported } from "@/components/features/screen-recorder/utils";
import { Button } from "@/components/ui/button";
import AppTypo from "@/components/ui/custom/app-typo";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  recordingMode: RecordingMode;
  setRecordingMode: (mode: RecordingMode) => void;
  isRecording: boolean;
}

const items = [
  {
    mode: "screen" as const,
    icon: sharedIcons.screen_record,
    label: "screen",
  },
  { mode: "camera" as const, icon: sharedIcons.camera, label: "camera" },
  { mode: "screen+camera" as const, icon: sharedIcons.video, label: "both" },
] as const;

const RecordingMode: FC<IProps> = ({
  isRecording,
  recordingMode,
  setRecordingMode,
}) => {
  const t = useTranslations("screen_recorder");
  const screenSupported = isScreenCaptureSupported();

  const availableItems = screenSupported
    ? items
    : items.filter(({ mode }) => mode === "camera");

  return (
    <div className="p-3.5 border-b border-border">
      <AppTypo variant="small" className="mb-2 block">
        {t("recording_mode")}
      </AppTypo>
      <div className="flex gap-2">
        {availableItems.map(({ mode, icon, label }) => (
          <Button
            key={mode}
            variant="outline"
            size="sm"
            className="flex-1"
            selected={recordingMode === mode}
            onClick={() => setRecordingMode(mode)}
            disabled={isRecording}
            icon={icon}
          >
            <span className="text-sm">{t(label)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RecordingMode;
