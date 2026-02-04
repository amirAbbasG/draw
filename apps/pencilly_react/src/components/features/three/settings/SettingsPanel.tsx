import React, { useEffect, useState, type FC } from "react";

import { useTranslations } from "@/i18n";
import { useShallow } from "zustand/react/shallow";

import {
  controlModes,
  settingsSliders,
  settingsSwitches,
} from "@/components/features/three/constants";
import { showHelpToast } from "@/components/features/three/settings/ControllerHelp";
import DynamicButton from "@/components/shared/DynamicButton";
import { Button } from "@/components/ui/button";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { setControllerSettings } from "@/stores/zustand/three/actions";
import { useThreeStore } from "@/stores/zustand/three/three-store";
import { sharedIcons } from "@/constants/icons";

interface IProps {}

interface SliderItemProps {
  item: (typeof settingsSliders)[number];
  value: number;
}

const SliderItem = ({ item, value }: SliderItemProps) => {
  const { min, max, key, step, titleKey } = item;
  const t = useTranslations("three");
  const [localValue, setLocalValue] = useState<string>(
    String(value || item.value),
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^-?\d*\.?\d*$/.test(val)) {
      setLocalValue(val);
    }
  };

  const handleBlur = () => {
    let convertVal = parseFloat(localValue);
    const maxDecimalPlaces = step.toString().split(".")[1]?.length || 0;
    if (isNaN(convertVal)) {
      convertVal = min;
    } else {
      if (convertVal > max) convertVal = max;
      if (convertVal < min) convertVal = min;
      // Limit decimal places
      convertVal = parseFloat(convertVal.toFixed(maxDecimalPlaces));
    }
    setControllerSettings({ [key]: convertVal });
  };

  useEffect(() => {
    setLocalValue(String(value || 0));
  }, [value]);

  return (
    <div className="col gap-1">
      <AppTypo type="label">{t(titleKey)}</AppTypo>
      <div className="row gap-3">
        <Slider
          className="w-full"
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([val]) => {
            setControllerSettings({ [key]: val });
          }}
        />
        <div className="w-18">
          <Input
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className="text-center text-xs appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
};

const SettingsPanel: FC<IProps> = () => {
  const t = useTranslations("three");
  const [isOpen, setIsOpen] = useState(false);
  const [isPin, setIsPin] = useState(false);
  const settings = useThreeStore(useShallow(state => state.settings));

  const onOpenChange = (val: boolean) => {
    setIsOpen(isPin ? true : val);
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger>
        <DynamicButton
          variant="secondary"
          icon={sharedIcons.settings}
          title={t("settings")}
          hideLabel
          element="div"
        />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" side="bottom" align="end">
        <div className="row gap-0.5">
          <AppTypo className="me-auto" variant="large">
            {t("settings")}
          </AppTypo>
          <AppIconButton
            icon={isPin ? sharedIcons.pin_filled : sharedIcons.pin_outline}
            size="sm"
            iconClassName={isPin ? "text-primary" : ""}
            onClick={() => setIsPin(!isPin)}
            title={isPin ? t("unpin") : t("pin")}
          />
          <AppIconButton
            icon={sharedIcons.close}
            size="sm"
            onClick={() => setIsOpen(false)}
            title={t("close")}
          />
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <div className="col gap-label-space">
            <AppTypo type="label">{t("control_mode")}</AppTypo>
            <div className="row gap-3">
              {controlModes.map(({ key, icon }) => (
                <Button
                  variant="outline"
                  selected={settings.controlMode === key}
                  key={key}
                  className="flex-1"
                  onClick={() => {
                    setControllerSettings({ controlMode: key });
                    showHelpToast(key);
                  }}
                  icon={icon}
                >
                  {t(key)}
                </Button>
              ))}
            </div>
          </div>

          {settingsSliders.map(item => (
            <SliderItem item={item} value={settings[item.key]} key={item.key} />
          ))}

          {settingsSwitches.map(({ key, titleKey }) => (
            <div className="spacing-row" key={key}>
              <AppTypo type="label">{t(titleKey)}</AppTypo>
              <Switch
                checked={settings[key]}
                onCheckedChange={checked =>
                  setControllerSettings({ [key]: checked })
                }
              />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SettingsPanel;
