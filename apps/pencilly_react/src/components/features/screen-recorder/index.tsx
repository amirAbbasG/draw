import { useState } from "react";

import { useMediaRecorder } from "@/components/features/screen-recorder/useMediaRecorder";
import DynamicButton from "@/components/shared/DynamicButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import ScreenRecorderComponent from "./RecorderComponent";

function ScreenRecorder() {
  const t = useTranslations("screen_recorder");
  const [isOpen, setIsOpen] = useState(false);
  const recordAPI = useMediaRecorder();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <DynamicButton
          title={t("title")}
          icon={sharedIcons.screen_record}
          hideLabel
          element="div"
        />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="!p-0 top-z"
        sideOffset={8}
      >
        <ScreenRecorderComponent
          onClose={() => setIsOpen(false)}
          recordAPI={recordAPI}
        />
      </PopoverContent>
    </Popover>
  );
}

export default ScreenRecorder;
