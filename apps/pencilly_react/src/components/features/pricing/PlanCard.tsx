import React, { useState, type FC } from "react";

import { useTranslations } from "@/i18n";

import { BillingPeriod, PlanItem } from "@/components/features/pricing/types";
// import OptionDescription from "@/components/forms/OptionDescription";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";

const PlanIcon = ({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) => {
  if (!icon) return null
  const isImage = icon.startsWith("http");
  if (isImage)
    return (
      <img
        src={icon}
        alt={"plan icon"}
        className={cn("size-4", className)}
      />
    );

  return <AppIcon icon={icon} className={cn("size-4", className)} />;
};

interface IProps {
  plan: PlanItem;
  billingPeriod: BillingPeriod;
  index: number;
  isCurrentPlan: boolean;
  onSelectPlan: () => void;
}

const PlanCard: FC<IProps> = ({
  billingPeriod,
  plan,
  onSelectPlan,
  index,
  isCurrentPlan,
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const t = useTranslations("pricing");
  const tDate = useTranslations("date");

  if (!plan) return null;
  const isMonthly = billingPeriod === "monthly";

  const price = isMonthly ? plan.price : (plan.yearly_price ? plan.yearly_price / 12 : 0);

  const fullYearPrice = Number((plan.price * 12).toFixed(0));

  const yearlyDiscountPrice = fullYearPrice - (plan.yearly_price || 0);
  const yearlyDiscountPercentage = Math.round(
    (yearlyDiscountPrice / fullYearPrice) * 100,
  );

  const isHovered = hoveredCard === plan.id;
  const highlighted = plan.badge;

  return (
    <div
      onMouseEnter={() => setHoveredCard(plan.id)}
      onMouseLeave={() => setHoveredCard(null)}
      style={{ animationDelay: `${index * 100}ms` }}
      className={cn(
        "group relative flex flex-col border overflow-hidden p-8 transition-all duration-500 animate-fade-in-up rounded-xl",
        "hover:scale-[1.03] hover:-translate-y-2",
        highlighted
          ? "border-primary bg-primary-lighter shadow-2xl shadow-primary/20 "
          : " bg-background-lighter hover:bg-background-light hover:border-primary/50 hover:shadow-xl",
        isHovered && !highlighted && "shadow-xl shadow-primary/10",
        isCurrentPlan &&
          "ring-primary ring-offset-2 ring-offset-background  ring-2",
      )}
    >
      {plan && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5 opacity-50" />
      )}

      {!!plan.badge && (
        <div className="absolute right-3 top-3 animate-float rounded-full bg-gradient-animated px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
          {plan.badge}
        </div>
      )}

      {billingPeriod === "annually" && (
        <div
          className={cn(
            "mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-white shadow-sm ring-1 ring-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-primary/20",
            yearlyDiscountPercentage <= 0 && "opacity-0",
          )}
        >
          <AppIcon
            icon={sharedIcons.sparkles}
            className="size-4 animate-pulse text-white"
          />
          {`${t("save")} ${yearlyDiscountPercentage}%`}
        </div>
      )}

      <div className="row gap-2 mb-6 mt-2">
        <PlanIcon icon={plan.icon || "hugeicons:rocket-01"} className="size-6 text-primary" />
        <h3 className=" text-3xl text-foreground font-bold transition-colors duration-300 group-hover:text-primary">
          {plan.name}
        </h3>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-2">
          <span className="bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-6xl font-bold tracking-tight text-transparent transition-all duration-500">
            {"$"}
            {Math.floor(price)}
          </span>
          <span className="text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
            {`/${tDate("month")}`}
          </span>
        </div>

        {!isMonthly && yearlyDiscountPercentage > 0 && (
          <div className="mt-3 flex items-center gap-2 animate-fade-in">
            <span className="text-sm text-foreground line-through">
              {"$"}
              {fullYearPrice}
              {`/${tDate("year")}`}
            </span>
            <span className="text-sm font-semibold text-foreground-light">
              {"$"}
              {plan.yearly_price || 0}
              {`/${tDate("year")}`}
            </span>
          </div>
        )}
      </div>

      <Button
          disabled={isCurrentPlan}
        className={cn(
          "group/btn relative mb-8 w-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-md",
        )}
        onClick={onSelectPlan}
        variant={highlighted ? "gradiant" : "secondary"}
        size="lg"
      >
        <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
          {t("subscribe_now")}
          {isHovered && (
            <AppIcon
              icon={sharedIcons.sparkles}
              className="h-4 w-4 animate-pulse"
            />
          )}
        </span>
        <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
      </Button>

      <ul className="space-y-4">
        {plan.feature_rules.map((feature, featureIndex) => {
          return (
            <li
              key={featureIndex}
              style={{
                animationDelay: isHovered ? `${featureIndex * 50}ms` : "0ms",
              }}
              className={cn(
                "row gap-2 transition-all duration-300",
                isHovered && "translate-x-1 animate-fade-in-left",
              )}
            >
              <div
                className={cn(
                  " flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                  highlighted
                    ? "bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary/20"
                    : "bg-background-dark/50  group-hover:scale-110 group-hover:bg-background-dark",
                )}
              >
                <PlanIcon icon={feature.icon} className="text-foreground" />
              </div>
              <span className="pt-0.5 row gap-1  text-sm capitalize leading-relaxed transition-colors duration-300 group-hover:text-foreground">
                {/*{feature.title}*/}
                {feature.key.replaceAll("_", " ").replaceAll("-", " ")}
              </span>
              {/*{!!feature.description && (*/}
              {/*  <OptionDescription text={feature.description} />*/}
              {/*)}*/}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PlanCard;
