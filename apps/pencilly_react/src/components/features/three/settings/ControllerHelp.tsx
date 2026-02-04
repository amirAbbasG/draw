import React from "react";

import { useTranslations } from "@/i18n";
import { toast } from "sonner";

import { controlModes } from "@/components/features/three/constants";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { ControlMode } from "@/stores/zustand/three/types";
import { sharedIcons } from "@/constants/icons";

type ItemKeys = "rotate_camera" | "pan_camera" | "zoom_in_out" | "pan_camera_alt" | "click_to_lock" | "wasd" | "mouse" | "release_pointer"

const helps = {
  orbit: {
    pan_camera: "Right Click + Drag",
    rotate_camera: "Left Click + Drag",
    zoom_in_out: "Scroll Wheel",
    pan_camera_alt: "Middle Click",
  },
  first_person: {
    wasd: "WASD",
    mouse: "Mouse",
    release_pointer: "ESC",
  },
};

interface ControllerHelp {
  id: string | number;
  controlMode: ControlMode;
}

const ControllerHelp = ({ id, controlMode }: ControllerHelp) => {
  const tHelps = useTranslations("three.helps");
  const t = useTranslations("three");
  const mode = controlModes.find(m => m.key === controlMode)!;
  const helpItems = helps[controlMode];

  return (
    <div className=" p-4  !rounded  w-full col  gap-4 bg-popover">
      <div className="row gap-1.5">
        <AppIcon icon={mode.icon} className="size-5" />
        <AppTypo className="me-auto" variant="large">
          {t(controlMode)}
        </AppTypo>
        <AppIconButton
          icon={sharedIcons.close}
          size="sm"
          onClick={() => toast.dismiss(id)}
          title={t("close")}
        />
      </div>

      {Object.entries(helpItems).map(([key, value]) => (
        <div className="spacing-row" key={key}>
          <AppTypo variant="small" className="font-normal">
            {tHelps(key as ItemKeys)}
          </AppTypo>
          <div className="shortcut w-fit px-2.5 py-1.5 text-xs  text-nowrap font-normal">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
};

export const showHelpToast = (controlMode: ControlMode) => {
  toast.custom(id => <ControllerHelp id={id} controlMode={controlMode} />, {
    duration: 8000,
    position: "bottom-center",
    className: "rounded bg-popover shadow-md border w-80",
  });
};
