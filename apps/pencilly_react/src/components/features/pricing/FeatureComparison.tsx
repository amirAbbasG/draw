import AppIcon from "@/components/ui/custom/app-icon";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

type FeatureValue = boolean | string;

interface Feature {
  name: string;
  starter: FeatureValue;
  professional: FeatureValue;
  enterprise: FeatureValue;
  badge?: string;
}

interface FeatureCategory {
  category: string;
  features: Feature[];
}

const featureData: FeatureCategory[] = [
  {
    category: "Create",
    features: [
      {
        name: "Infinite canvas",
        starter: true,
        professional: true,
        enterprise: true,
      },
      {
        name: "Full editor features",
        starter: true,
        professional: true,
        enterprise: true,
      },
      {
        name: "Unlimited scenes",
        starter: false,
        professional: true,
        enterprise: true,
      },
      {
        name: "Automatically sync to server",
        starter: false,
        professional: true,
        enterprise: true,
      },
      {
        name: "Quick dashboard access",
        starter: false,
        professional: true,
        enterprise: true,
      },
      {
        name: "Generative AI",
        starter: "Limited",
        professional: "Extended",
        enterprise: "Unlimited",
      },
      {
        name: "Presentations",
        starter: false,
        professional: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Collaborate",
    features: [
      {
        name: "Invite collaborators by link",
        starter: true,
        professional: true,
        enterprise: true,
      },
      {
        name: "View-only access",
        starter: false,
        professional: true,
        enterprise: true,
      },
      {
        name: "Voice hangout & screensharing",
        starter: false,
        professional: true,
        enterprise: true,
        badge: "new",
      },
      {
        name: "Comments",
        starter: false,
        professional: true,
        enterprise: true,
      },
      {
        name: "Live real-time presentations",
        starter: false,
        professional: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Teams",
    features: [
      {
        name: "User accounts",
        starter: false,
        professional: true,
        enterprise: true,
      },
      {
        name: "Team workspace",
        starter: false,
        professional: false,
        enterprise: true,
      },
      {
        name: "Advanced permissions",
        starter: false,
        professional: false,
        enterprise: true,
      },
      {
        name: "Priority support",
        starter: false,
        professional: false,
        enterprise: true,
      },
    ],
  },
];

const plans = [
  { name: "Basic", price: "$4 a month", key: "starter" as const },
  {
    name: "Professional",
    price: "$12 a month per user",
    key: "professional" as const,
  },
  {
    name: "Enterprise",
    price: "$29 a month per user",
    key: "enterprise" as const,
  },
];

export function FeatureComparison() {
  const t = useTranslations("pricing.comparison");

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center row justify-center animate-fade-in">
          <h2 className="mb-4 mx-a  text-4xl font-bold text-gradiant  md:text-5xl">
            {t("title")}
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/50 shadow-2xl backdrop-blur-sm animate-fade-in-up">
          {/* Header with plan names */}
          <div className="grid grid-cols-4 gap-4 border-b border-border/50 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 p-8">
            <div />
            {plans.map(plan => (
              <div key={plan.key} className="text-center">
                <h3 className="mb-1 text-2xl font-bold text-primary">
                  {plan.name}
                </h3>
                <p className="text-sm text-foreground-light">{plan.price}</p>
              </div>
            ))}
          </div>

          {/* Feature categories */}
          {featureData.map((category, categoryIndex) => (
            <div
              key={category.category}
              className="border-b border-border/30 last:border-0"
            >
              <div
                style={{ animationDelay: `${categoryIndex * 100}ms` }}
                className="bg-muted/30 px-8 py-6 animate-fade-in-left"
              >
                <h4 className="text-xl font-bold text-foreground">
                  {category.category}
                </h4>
              </div>

              {category.features.map((feature, featureIndex) => (
                <div
                  key={feature.name}
                  style={{
                    animationDelay: `${categoryIndex * 100 + featureIndex * 50}ms`,
                  }}
                  className="group grid grid-cols-4 gap-4 px-8 py-4 transition-colors hover:bg-muted/20 animate-fade-in"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-foreground transition-colors group-hover:text-primary">
                      {feature.name}
                    </span>
                    {feature.badge && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {feature.badge}
                      </span>
                    )}
                  </div>

                  {plans.map(plan => {
                    const value = feature[plan.key];
                    return (
                      <div
                        key={plan.key}
                        className="flex items-center justify-center"
                      >
                        {typeof value === "boolean" ? (
                          <div
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full  transition-transform group-hover:scale-110",
                              value ? "bg-primary-lighter" : "bg-background",
                            )}
                          >
                            <AppIcon
                              icon={
                                value ? sharedIcons.check : sharedIcons.close
                              }
                              className={cn(
                                "h-4 w-4 ",
                                value ? "text-primary" : "text-foreground",
                              )}
                              strokeWidth={value ? 3 : 2}
                            />
                          </div>
                        ) : (
                          <span className="rounded-full bg-primary-lighter px-3 py-1 text-sm font-medium text-primary">
                            {value}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>

        <p
          className="mt-12 text-center text-muted-foreground animate-fade-in"
          style={{ animationDelay: "400ms" }}
        >
          {t("footer")}
        </p>
      </div>
    </section>
  );
}
