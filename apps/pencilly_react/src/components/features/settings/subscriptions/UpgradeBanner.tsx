import React from "react";

import { useTranslations } from "@/i18n";

import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import {Link} from "react-router";

const UpgradeBanner = () => {
  const t = useTranslations("settings");

  return (
    <div className="w-full row gap-2  bg-primary-lighter p-3 rounded">
      <svg width="0" height="0">
        <linearGradient id="blue-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop stopColor="#9D7AFF" offset="0%" />
          <stop stopColor="#52D5FF" offset="100%" />
        </linearGradient>
      </svg>
      <AppIcon
        icon="mingcute:ai-fill"
        width={20}
        height={20}
        className="[&_path]:fill-[url(#blue-gradient)] "
      />

      <AppTypo variantMobileSize="small" className="text-primary">
        {t("upgrade_banner")}.
      </AppTypo>

      <Link to="/pricing" className="ms-auto">
        <Button variant="gradiant" className="flex flex-row gap-x-1">
          <AppIcon icon="material-symbols:diamond-outline" width={14} />
          <span className="max-md:hidden">{t("upgrade_btn")}</span>
        </Button>
      </Link>
    </div>
  );
};

export default UpgradeBanner;
