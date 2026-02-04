import { useState } from "react";
import * as React from "react";

import { useTranslations } from "@/i18n";

import { BillingPeriod, PlanItem } from "@/components/features/pricing/types";
import { usePainPlan } from "@/components/features/pricing/usePayPlan";
import { Button } from "@/components/ui/button";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";

interface Props {
  onClose: () => void;
  plan: PlanItem;
  period: BillingPeriod;
}

const UpgradeModal = ({ onClose, period, plan }: Props) => {
  const t = useTranslations("pricing");
  const tDate = useTranslations("date");
  const [selected, setSelected] = useState<"ether" | "paypal">("paypal");
  const { mutatePay, isPending } = usePainPlan();

  //handle payment continue
  const handlePayment = () => {
    mutatePay({
      price_plan_id: plan.id,
    });
  };
  const isMonthly = period === "monthly";

  const pricePerMoth = isMonthly ? plan.price : plan.yearly_price / 12;

  const amount = isMonthly ? plan.price : plan.yearly_price;

  return (
    <Dialog open={true}>
      <DialogContent className="w-full text-foreground md:max-w-2xl responsive-dialog h-auto max-h-[95%] col  ">
        <DialogHeader className=" mb-2">
          <div className="spacing-row">
            <DialogTitle className="text-xl">{t("upgrade_plan")}</DialogTitle>
            <AppIconButton
              size="xs"
              onClick={onClose}
              icon={sharedIcons.close}
            />
          </div>
          <DialogDescription className="text-base">
            {t("description_of_how_to_pay")}
          </DialogDescription>
        </DialogHeader>

        <div className="text-nowrap flex items-baseline gap-1">
          <AppTypo className="text-xl font-bold text-gradiant inline-block">
            {`${t("upgrade_to")} ${plan.name} `}
          </AppTypo>{" "}
          <AppTypo variant="small" color="secondary">
            {` -  ${t("billed")} ${t(isMonthly ? "monthly" : "annually")}`}
          </AppTypo>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-6xl font-bold tracking-tight text-transparent transition-all duration-500">
            {"$"}
            {Math.floor(pricePerMoth)}
          </span>
          <span className="text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
            {`/${tDate("month")}`}
          </span>
        </div>

        <div className="spacing-row">
          <p className="text-base font-[400]  capitalize text-label-light">
            {t("price")}
          </p>
          <p className="text-base font-[600] capitalize ">${amount}</p>
        </div>

        <div className=" w-full border-t border-b">
          <div className="my-4 flex flex-col gap-4">
            <p className="text-large font-[600]">{t("payment_options")}</p>
            <div className="flex gap-6 ">
              <img
                src="/images/payment/paypal.svg"
                onClick={() => setSelected("paypal")}
                className={cn(
                  "border rounded-lg transition-all cursor-pointer",
                  selected === "paypal" && "border-4 border-primary ",
                )}
                alt="paypal"
              />
              <div className="relative">
                <img
                  src="/images/payment/etherium.png"
                  alt="etherium"
                  className={cn(
                    selected === "ether" &&
                      "border-4  rounded-lg border-primary",
                    "transition-all ",
                  )}
                />
                <div className="absolute flex justify-center text-small p-1 text-primary-lighter rounded-es-custom rounded-ee-custom bg-success bottom-0 left-0 w-full">
                  {t("coming_soon")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-between ">
          <p className="text-base text-label-light">{t("due_today")}</p>
          <p className="text-base  font-[600] text-primary">${amount}</p>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            isPending={isPending}
            onClick={() => {
              handlePayment();
            }}
          >
            {t("subscribe")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
