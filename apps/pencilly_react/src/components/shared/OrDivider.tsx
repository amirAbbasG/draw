import React from "react";

import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

export const OrDivider = ({
  title,
  className,
}: {
  title?: string;
  className?: string;
}) => {
  const t = useTranslations("share");

  return (
    <div className={cn("row gap-3  w-full", className)}>
      <div className="flex-1 hr" />
      <AppTypo>{title || t("or")}</AppTypo>
      <div className="flex-1 hr" />
    </div>
  );
};
