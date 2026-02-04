import React from "react";

import LinkToSite from "@/components/shared/LinkToSite";
import AppTypo from "@/components/ui/custom/app-typo";
import { useTranslations } from "@/i18n";

function Privacy() {
  const t = useTranslations("auth.login");

  return (
    <AppTypo variant="small" className="text-center">
      {t("by_sign_up")}
      {"  "}

      <LinkToSite to="/terms">
        <AppTypo variant="small" color="primary">
          {t("terms_and_condition")}
        </AppTypo>
      </LinkToSite>

      {"  "}
      {t("and")}
      {"  "}

      <LinkToSite to="/privacy">
        <AppTypo variant="small" color="primary">
          {t("privacy_policy")}
        </AppTypo>
      </LinkToSite>
    </AppTypo>
  );
}

export default Privacy;
