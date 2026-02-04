import React, { useState, type FC } from "react";

import { FAQSection } from "@/components/features/pricing/FAQ";
import PlanCard from "@/components/features/pricing/PlanCard";
import { BillingPeriod } from "@/components/features/pricing/types";
import UpgradeModal from "@/components/features/pricing/UpgradeModal";
import { useGetAllPlans } from "@/components/features/pricing/useGetAllPlans";
import PageHeader from "@/components/layout/PageHeader";
import RenderIf from "@/components/shared/RenderIf";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUser } from "@/stores/context/user";
import { useTranslations } from "@/i18n";

interface IProps {}

const Pricing: FC<IProps> = () => {
  const { user } = useUser();
  const t = useTranslations("pricing");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const { data: plans, isPending } = useGetAllPlans();

  const selectedPlan = plans?.find(plan => plan.id === selectedPlanId) || null;

  return (
    <div className="relative w-full text-foreground overflow-y-auto bg-background-lighter">
      <PageHeader title={t("title")} />
      <section className="py-12 md:py-20 px-4">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/4 top-20 h-96 w-96 animate-float rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-1/4 top-40 h-[500px] w-[500px] animate-float-delayed rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute bottom-20 left-1/3 h-96 w-96 animate-float-slow rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl animate-fade-in text-center">
            <h1 className="mb-6 text-balance  text-5xl font-bold tracking-tight md:text-7xl">
              {t("page_title")}
            </h1>
            <p className="text-pretty text-lg  leading-relaxed text-muted-foreground md:text-xl">
              {t("page_subtitle")}
            </p>
          </div>

          <div className="mb-16 flex animate-fade-in-up items-center justify-center gap-4">
            <label
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                " font-medium transition-all duration-300 cursor-pointer",
                billingPeriod === "monthly"
                  ? "scale-110"
                  : "text-foreground-light scale-100",
              )}
            >
              {t("monthly")}
            </label>
            <button
              onClick={() =>
                setBillingPeriod(
                  billingPeriod === "monthly" ? "annually" : "monthly",
                )
              }
              className={cn(
                "group relative h-8 w-16 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                billingPeriod === "annually"
                  ? "bg-primary shadow-lg shadow-primary/30"
                  : "bg-secondary",
              )}
              aria-label="Toggle billing period"
            >
              <span
                className={cn(
                  "absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 group-hover:scale-110",
                  billingPeriod === "annually" && "translate-x-8",
                )}
              />
            </button>
            <label
              onClick={() => setBillingPeriod("annually")}
              className={cn(
                " font-medium transition-all duration-300 cursor-pointer",
                billingPeriod === "annually"
                  ? "scale-110"
                  : "text-foreground-light scale-100",
              )}
            >
              {t("annually")}
            </label>
          </div>

          <div className={cn(
              "grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mx-auto",
              plans?.length === 2 && " lg:grid-cols-2 max-w-4xl ",
              plans?.length === 1 && "grid-cols-1  lg:grid-cols-1 max-w-2xl",
          )}>
            <RenderIf isTrue={isPending}>
              {[1, 2, 3].map(index => (
                <Skeleton className="w-full rounded-xl h-[700px]" key={index} />
              ))}
            </RenderIf>
            {plans?.map((plan, index) => (
              <PlanCard
                onSelectPlan={() => setSelectedPlanId(plan.id)}
                plan={plan}
                billingPeriod={billingPeriod}
                index={index}
                isCurrentPlan={user?.plan?.id === plan.id}
                key={plan.id}
              />
            ))}
          </div>
        </div>
      </section>
      {/*<FeatureComparison />*/}
      <FAQSection />
      {selectedPlan && (
        <UpgradeModal
          onClose={() => setSelectedPlanId("")}
          plan={selectedPlan}
          period={billingPeriod}
        />
      )}
    </div>
  );
};

export default Pricing;
