import { useState } from "react";

import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes! You can upgrade or downgrade your plan whenever you need. Changes will be prorated and reflected in your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and direct bank transfers for Enterprise plans.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "We offer a 14-day free trial on all plans. No credit card required to start exploring our 3D modeling tools.",
  },
  {
    question: "What happens to my projects if I cancel?",
    answer:
      "Your projects remain accessible for 30 days after cancellation. You can export all your work before the account closes. We never delete your data without notice.",
  },
  {
    question: "Do you offer educational or non-profit discounts?",
    answer:
      "Yes! We provide special pricing for students, educators, and non-profit organizations. Contact our team with verification documents to get up to 40% off.",
  },
  {
    question: "Can I add team members to my plan?",
    answer:
      "Team collaboration is available on Professional and Enterprise plans. You can invite unlimited team members on Enterprise, or up to 5 members on Professional.",
  },
];

export function FAQSection() {
  const t = useTranslations("pricing.faq");

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative w-full overflow-hidden py-12 md:py-20 px-4 ">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-1/4 top-20 h-96 w-96 animate-float rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute left-1/3 bottom-20 h-[500px] w-[500px] animate-float-delayed rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="mx-auto mb-12 animate-fade-in text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/5">
            <AppIcon
              icon="material-symbols:info-outline"
              className="h-8 w-8 text-primary"
            />
          </div>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                style={{ animationDelay: `${index * 50}ms` }}
                className={cn(
                  "group overflow-hidden border transition-all duration-300 animate-fade-in-up hover:shadow-lg rounded",
                  isOpen
                    ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                    : "border-border hover:border-primary/50",
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="row w-full  gap-4 p-6 text-left transition-all duration-300"
                  aria-expanded={isOpen}
                >
                  <div
                    className={cn(
                      "mb-1 centered-col h-8 w-8 shrink-0  rounded-full transition-all duration-300",
                      isOpen
                        ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30"
                        : "bg-primary/10 text-primary group-hover:scale-105 group-hover:bg-primary/20",
                    )}
                  >
                    <AppIcon
                      icon={sharedIcons.chevron_down}
                      className={cn(
                        "h-5 w-5 transition-transform duration-300",
                        isOpen && "rotate-180",
                      )}
                    />
                  </div>

                  <div className="flex-1 ">
                    <h3
                      className={cn(
                        "text-lg font-semibold transition-colors duration-300",
                        isOpen
                          ? "text-primary"
                          : "text-foreground group-hover:text-primary",
                      )}
                    >
                      {faq.question}
                    </h3>
                  </div>
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="animate-fade-in px-6 pb-6 pl-[72px]">
                      <p className="text-pretty leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 animate-fade-in text-center">
          <p className="mb-4 text-muted-foreground">
            {t("still_have_questions")}
          </p>
          <Button
            variant="gradiant"
            size="xl"
            className="group inline-flex items-center gap-2   px-6 py-3 font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
          >
            {t("contact")}
            <AppIcon
              icon={sharedIcons.chevron_down}
              className="h-4 w-4 rotate-[-90deg] transition-transform duration-300 group-hover:translate-x-1"
            />
          </Button>
        </div>
      </div>
    </section>
  );
}
