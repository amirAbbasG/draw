import AppTypo from "@/components/ui/custom/app-typo";
import { useTranslations } from "@/i18n";

import ReferralForm from "./Form";
import ReferralHero from "./Hero";

/**
 * component for referral and invite other user
 * used in user-panel dialog
 * @constructor
 */

export default function Referral() {
  const t = useTranslations("settings");
  return (
    <div className="mt-4 w-full gap-4 col  h-full">
      <ReferralHero />
      <AppTypo variant="small">{t("referral_description")}</AppTypo>
      <ReferralForm />
    </div>
  );
}
