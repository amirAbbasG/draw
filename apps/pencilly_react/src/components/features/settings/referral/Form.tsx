import React from "react";

import { useTranslations } from "@/i18n";

import { useGetReferral } from "@/components/features/settings/referral/useGetReferral";
import { useMutateReferral } from "@/components/features/settings/referral/useMutateReferral";
import AppShare from "@/components/shared/AppShare";
import CopyButton from "@/components/shared/CopyButton";
import RenderIf from "@/components/shared/RenderIf";
import { Button } from "@/components/ui/button";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import { inputVariant } from "@/components/ui/variants";
import { cn } from "@/lib/utils";

const Section = ({
  children,
  title,
  contentClassName,
}: PropsWithChildren<{ title: string; contentClassName?: string }>) => (
  <div className="flex flex-col gap-label-space ">
    <AppTypo variant="small">{title}:</AppTypo>
    <div className={cn("w-full gap-2 flex", contentClassName)}>{children}</div>
  </div>
);

function ReferralForm() {
  const t = useTranslations("settings");

  const {
    isPendingEmailReferral,
    email,
    setEmail,
    submitEmailReferral,
    isPendingApplyReferral,
    applyCode,
    code,
    setCode,
  } = useMutateReferral();

  // const { referralData } = useGetReferral();

  const referralData = {
    referral_code: "lfhwifwef",
    referral_link: "https://example.com/referral/lfhwifwef",
    total_referrals: "",
    completed_referrals: 2,
  };

  return (
    <div className="col gap-4 h-full pb-4">
      <RenderIf isTrue={!!referralData?.referral_code}>
        <Section title={t("referral_code_title")}>
          <div
            className={cn(
              inputVariant({ variant: "input", color: "input" }),
              "row gap-2 max-w-40",
            )}
          >
            {referralData?.referral_code}
            <CopyButton text={referralData?.referral_code || ""} />
          </div>
        </Section>
      </RenderIf>

      <RenderIf isTrue={!!referralData?.referral_link}>
        <Section title={t("referral_link_title")}>
          <div
            className={cn(inputVariant({ variant: "input", color: "input" }))}
          >
            {referralData?.referral_link}
          </div>
          <CopyButton
            text={referralData?.referral_link || ""}
            variant="button"
            title={t("referral_link_button")}
            className="w-fit sm:w-32"
            titleClassName="max-sm:!hidden"
          />
        </Section>
        <div className="centered-row w-full pt-2">
          <AppShare url={referralData?.referral_link || ""} contentOnly />
        </div>
      </RenderIf>

      <Section
        title={t("referral_email_title")}
        contentClassName="flex-col sm:flex-row"
      >
        <Input
          placeholder={t("enter_member_email")}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Button
          title={t("invite_member")}
          onClick={submitEmailReferral}
          isPending={isPendingEmailReferral}
          variant="default"
          disabled={!email}
          className="w-full sm:w-32"
        >
          {t("invite_member")}
        </Button>
      </Section>

      <div className="rounded mt-auto p-2.5 gap-2.5 border border-dashed col border-holder-darker">
        <AppTypo variant="headingXXS">{t("redeem_code_title")}</AppTypo>
        <AppTypo variant="small">{t("redeem_code_description")}</AppTypo>

        <div className="row gap-2 bg max-w-72">
          <Input
            placeholder={t("redeem_code_input_placeholder")}
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <Button
            className="w-10"
            disabled={!code || isPendingApplyReferral}
            isPending={isPendingApplyReferral}
            onClick={applyCode}
          >
            {t("redeem_code_button")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReferralForm;
