import React, { type FC } from "react";

import type { Recording } from "@/components/features/screen-recorder/useMediaRecorder";
import { handleDownload } from "@/components/features/screen-recorder/utils";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  recording: Recording;
  handleDelete: () => void;
}

const RecordedItem: FC<IProps> = ({ recording, handleDelete }) => {
  const t = useTranslations("screen_recorder");

  const handleSaveToServer = async () => {
    // Placeholder for server upload - implement your API endpoint here
    console.log("Save to server:",recording);
    alert(
      "Server upload not implemented yet. Add your API endpoint to enable this feature.",
    );
  };

  const onDownload = () => {
    handleDownload(recording.url, recording.name);
    if (recording.extraUrl) {
      handleDownload(recording.extraUrl, `camera_${recording.name}`);
    }
  };

  return (
    <div className="spacing-row px-4 py-2 hover:bg-background-light transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <AppIcon
          icon={sharedIcons.video}
          className=" text-primary size-9 rounded bg-primary-lighter p-2 flex-shrink-0"
        />
        <div className="flex-1 col gap-0.5 min-w-0">
          <AppTypo variant="small" className=" truncate">
            {recording.name}
          </AppTypo>
          <AppTypo variant="xs" color="secondary">
            {recording.date.toLocaleTimeString()}
          </AppTypo>
        </div>
      </div>
      <div className="row gap-1">
        <AppIconButton
          icon={sharedIcons.download}
          onClick={onDownload}
          size="xs"
          title={t("download")}
        />

        <AppIconButton
          icon={sharedIcons.upload}
          onClick={handleSaveToServer}
          title={t("save")}
          size="xs"
        />
        <AppIconButton
          icon={sharedIcons.delete}
          title={t("delete")}
          size="xs"
          color="danger"
          onClick={handleDelete}
        />
      </div>
    </div>
  );
};

export default RecordedItem;
