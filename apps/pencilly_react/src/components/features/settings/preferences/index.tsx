'use client';

import React, { useState } from "react";

import AppTypo from "@/components/ui/custom/app-typo";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CREDIT_KEYS } from "@/constants/keys";
import { useTranslations } from "@/i18n";
import { Icon } from "@iconify/react";
import {cn} from "@/lib/utils";
import {useTheme} from "@/stores/context/theme";

const themes = ["dark", "light", "system"] as const;


// Feature details for user-friendly display
const CREDIT_FEATURES = [
  {
    key: "AI" as const,
    icon: "hugeicons:ai-brain-02",
    labelKey: "ai_drawing",
  },
  {
    key: "IMPROVE" as const,
    icon: "hugeicons:magic-wand-01",
    labelKey: "improve_drawing",
  },
  {
    key: "IMAGE" as const,
    icon: "hugeicons:image-02",
    labelKey: "ai_image",
  },
  {
    key: "TO3D" as const,
    icon: "hugeicons:cube",
    labelKey: "convert_to_3d",
  },
  {
    key: "AI3D" as const,
    icon: "hugeicons:ai-brain-03",
    labelKey: "ai_3d",
  },
  {
    key: "MERMAID" as const,
    icon: "hugeicons:flowchart-01",
    labelKey: "mermaid_diagram",
  },
] as const;

type CreditKeyType = keyof typeof CREDIT_KEYS;

const Preferences = () => {
  const t = useTranslations("settings");
  const { theme: selectedTheme, setTheme } = useTheme();


  // State to track which features have confirmations disabled
  const [disabledConfirmations, setDisabledConfirmations] = useState<
    Record<CreditKeyType, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    for (const key of Object.keys(CREDIT_KEYS) as CreditKeyType[]) {
      initial[key] = localStorage.getItem(CREDIT_KEYS[key]) === "true";
    }
    return initial as Record<CreditKeyType, boolean>;
  });

  // Check if any confirmations are disabled
  const hasDisabledConfirmations = Object.values(disabledConfirmations).some(
    (v) => v
  );

  // Toggle confirmation for a specific feature
  const toggleConfirmation = (key: CreditKeyType) => {
    const newValue = !disabledConfirmations[key];
    setDisabledConfirmations((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    if (newValue) {
      localStorage.setItem(CREDIT_KEYS[key], "true");
    } else {
      localStorage.removeItem(CREDIT_KEYS[key]);
    }
  };

  // Re-enable all confirmations
  const enableAllConfirmations = () => {
    const reset: Record<string, boolean> = {};
    for (const key of Object.keys(CREDIT_KEYS) as CreditKeyType[]) {
      localStorage.removeItem(CREDIT_KEYS[key]);
      reset[key] = false;
    }
    setDisabledConfirmations(reset as Record<CreditKeyType, boolean>);
  };


  return (
    <div className="col gap-6">
      <div className="col gap-3">
      <AppTypo  type="h3" className="font-medium">
        {t("select_theme_message")}
      </AppTypo>
      <div className="row gap-4">
        {themes.map(theme => (
            <div
                className={cn(
                    "fit overflow-hidden rounded cursor-pointer border-2 border-transparent",
                    selectedTheme === theme && "border-primary",
                )}
                key={"app-theme-" + theme}
                onClick={() => setTheme(theme)}
            >
              <img
                  src={`/images/themes/${theme}.png`}
                  alt={"theme " + theme}
                  width={250}
                  height={200}
                  className="!h-12 !w-[100px] lg:!h-20 lg:!w-[115px] object-cover"
              />
            </div>
        ))}
      </div>
      </div>

        <div className="col gap-2">
          <AppTypo type="h3"  className="font-medium">
            {t("preferences.credit_confirmations")}
          </AppTypo>
          <AppTypo variant="small" color="secondary" className="mb-3">
            {t("preferences.credit_confirmations_description")}
          </AppTypo>

          <div className="col gap-1">
            {CREDIT_FEATURES.map((feature) => {
              const isDisabled = disabledConfirmations[feature.key];
              return (
                  <div
                      key={feature.key}
                      className="row gap-3 items-center justify-between p-3 rounded border bg-muted=hover:bg-muted/50 transition-colors"
                  >
                    <div className="row gap-3 items-center">
                        <Icon
                            icon={feature.icon}
                            className="size-9 rounded p-2 bg-primary/10  text-primary"
                        />
                      <div className="col gap-0.5">
                        <AppTypo variant="small" className="font-medium">
                          {t(`preferences.features.${feature.labelKey}`)}
                        </AppTypo>
                        <AppTypo variant="xs" className="text-foreground-light">
                          {isDisabled
                              ? t("preferences.confirmation_hidden")
                              : t("preferences.confirmation_shown")}
                        </AppTypo>
                      </div>
                    </div>

                    <Switch
                        checked={!isDisabled}
                        onCheckedChange={() => toggleConfirmation(feature.key)}
                        aria-label={`Toggle confirmation for ${feature.labelKey}`}
                    />
                  </div>
              );
            })}
          </div>

          {hasDisabledConfirmations && (
              <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-fit bg-transparent"
                  onClick={enableAllConfirmations}
              >
                <Icon icon="hugeicons:refresh" className="size-4 mr-2"/>
                {t("preferences.enable_all_confirmations")}
              </Button>
          )}
        </div>
    </div>
);
};

export default Preferences;
