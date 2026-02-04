import React from "react";

import { useTranslations } from "@/i18n";

import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import {useTheme} from "@/stores/context/theme";

const themes = ["dark", "light", "system"] as const;

const Theme = () => {
  const t = useTranslations("settings");
  const { theme: selectedTheme, setTheme } = useTheme();

  return (
    <div className="col gap-4">
      <AppTypo className="text-foreground-light" type="h3" variant="headingXS">
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
  );
};

export default Theme;
