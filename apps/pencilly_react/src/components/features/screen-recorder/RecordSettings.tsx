import React, { type FC } from "react";

import { VideoQuality } from "@/components/features/screen-recorder/utils";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

interface IProps {
  videoQuality: VideoQuality;
  setVideoQuality: (quality: VideoQuality) => void;
  countdownEnabled: boolean;
  setCountdownEnabled: (enabled: boolean) => void;
  includeSystemAudio: boolean;
  setIncludeSystemAudio: (enabled: boolean) => void;
  isOpen: boolean;
}

const RecordSettings: FC<IProps> = ({
  countdownEnabled,
  includeSystemAudio,
  setCountdownEnabled,
  setIncludeSystemAudio,
  setVideoQuality,
  videoQuality,
  isOpen,
}) => {
  const t = useTranslations("screen_recorder");

  return (
    <div
      className={cn(
        "bg-background-light px-3.5 col gap-4 overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-60  py-3.5 border-b " : "max-h-0 ",
      )}
    >
      <div className="col gap-2">
        <AppTypo variant="small">{t("video_quality")}</AppTypo>
        <Select
          value={videoQuality}
          onValueChange={v => setVideoQuality(v as VideoQuality)}
        >
          <SelectTrigger className="h-9 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent portal={false}>
            <SelectItem value="720p">720p HD</SelectItem>
            <SelectItem value="1080p">1080p Full HD</SelectItem>
            <SelectItem value="1440p">1440p QHD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AppIcon
            icon="hugeicons:timer-02"
            className="w-4 h-4 text-muted-foreground"
          />
          <AppTypo variant="small">{t("countdown")}</AppTypo>
        </div>
        <Switch
          checked={countdownEnabled}
          onCheckedChange={setCountdownEnabled}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AppIcon
            icon="hugeicons:hard-drive"
            className="w-4 h-4 text-muted-foreground"
          />
          <AppTypo variant="small">{t("system_audio")}</AppTypo>
        </div>
        <Switch
          checked={includeSystemAudio}
          onCheckedChange={setIncludeSystemAudio}
        />
      </div>
    </div>
  );
};

export default RecordSettings;
