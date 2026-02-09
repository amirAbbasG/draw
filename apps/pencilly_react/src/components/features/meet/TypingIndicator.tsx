import React, { type FC } from "react";

import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

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
  const label =
    names && names.length > 0
      ? names.length === 1
        ? `${names[0]} is typing`
        : `${names.slice(0, 2).join(", ")} are typing`
      : "Typing";

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5", className)}>
      <div className="flex items-center gap-0.5 rounded-full bg-background border px-3 py-1.5">
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
    className="inline-block size-1.5 rounded-full bg-foreground-lighter animate-bounce"
    style={{ animationDelay: `${delay}ms` }}
  />
);
