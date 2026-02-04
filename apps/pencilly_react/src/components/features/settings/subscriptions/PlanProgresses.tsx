import React, { type FC } from "react";

import { useTranslations } from "@/i18n";

import { formatToMonthDay } from "@/components/features/settings/utils";
import AppIcon from "@/components/ui/custom/app-icon";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { UserSubscription } from "@/services/user";

interface IProgressItemProps {
  available: number;
  total: number;
  rootClassName?: string;
}

const ProgressItem = ({
  available,
  rootClassName,
  total,
}: IProgressItemProps) => {
  const t = useTranslations("settings");
  return (
    <div className={cn("flex w-full flex-col gap-4", rootClassName)}>
      <div className="flex w-full justify-between text-foreground">
        <span>{t("daily_credit")}</span>
        <span>
          {available} {t("available")} / {total} {t("total")}
        </span>
      </div>
      <Progress value={(100 * available) / total} />
    </div>
  );
};

interface IProps {
  subscription?: UserSubscription;
  isPending: boolean;
}

const PlanProgresses: FC<IProps> = ({ subscription, isPending }) => {
  const t = useTranslations("settings");

  const planIsActive = !!subscription && subscription?.status === "active";

  return (
    <div className="flex w-full flex-col gap-3 rounded-custom border rounded px-4 py-4 text-sm">
      {!isPending && !!subscription ? (
        <>
          <ProgressItem
            available={subscription.remaining_credits}
            total={
              (subscription.remaining_credits || 0) +
              (subscription.used_credits || 0)
            }
          />
          {/*<ProgressItem*/}
          {/*  available={subscription?.daily_bonus}*/}
          {/*  total={subscription.base_daily_bonus}*/}
          {/*/>*/}
          {/*<ProgressItem*/}
          {/*  available={subscription?.credit}*/}
          {/*  total={subscription.base_credit}*/}
          {/*  rootClassName={planIsActive ? "" : "opacity-30"}*/}
          {/*/>*/}
        </>
      ) : (
        <Skeleton className="h-[100px] w-full" />
      )}

      {subscription && (
        <div
          className={`flex ${planIsActive ? "text-[#c09730]" : " text-danger "} gap-x-1`}
        >
          <AppIcon icon="mingcute:warning-line" width={16} />
          <span>
            {planIsActive
              ? `${t("end_message")} ${subscription.end_date ? formatToMonthDay(subscription.end_date?.toString() || "") : ""}`
              : t("renew_error")}
          </span>
        </div>
      )}
    </div>
  );
};

export default PlanProgresses;
