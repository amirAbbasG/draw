import React from "react";

import { useTranslations } from "@/i18n";

import AppTypo from "@/components/ui/custom/app-typo";

function ReferralHero() {
  const t = useTranslations("settings");

  return (
    <div className="row w-full bg-primary-lighter p-4 rounded-lg text-lable">
      <div className="col gap-3">
        <AppTypo variant="headingS">{t("invite_user_header_title")}</AppTypo>
        <AppTypo variant="small">{t("invite_user_header_description")}</AppTypo>
      </div>
    </div>
  );
}

export default ReferralHero;
