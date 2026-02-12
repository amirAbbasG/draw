import React, { type FC } from "react";

import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import {useTranslations} from "@/i18n";

interface TypingIndicatorProps {
  /** Name(s) of the user(s) who are typing */
  names?: string[];
  className?: string;
}

/**
 * A "Typing..." indicator shown at the bottom of the message list
 * when other users are composing a message.
 */
const TypingIndicator: FC<TypingIndicatorProps> = ({ names, className }) => {
const t = useTranslations("meet.chat")
  const label =
    names && names.length > 0
      ? names.length === 1
        ? `${names[0]} ${t("is_typing")}`
        : `${names.slice(0, 2).join(", ")} ${t("are_typing")}`
      : t("typing");

  return (
    <div className={cn("row gap-2 p-3", className)}>
      <div className="flex items-center gap-0.5 rounded-full bg-background-lighter border px-3 py-1.5">
        <BounceDot delay={0} />
        <BounceDot delay={150} />
        <BounceDot delay={300} />
      </div>
      <AppTypo variant="xs" color="secondary">
        {`${label}...`}
      </AppTypo>
    </div>
  );
};

export default TypingIndicator;

/* ---------- Sub-components ---------- */

const BounceDot: FC<{ delay: number }> = ({ delay }) => (
  <span
    className="inline-block size-1.5 rounded-full bg-primary animate-bounce"
    style={{ animationDelay: `${delay}ms` }}
  />
);
