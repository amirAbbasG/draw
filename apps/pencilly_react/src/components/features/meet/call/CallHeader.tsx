"use client";

import React, { type FC } from "react";

import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface CallHeaderProps {
  title?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
}

const CallHeader: FC<CallHeaderProps> = ({
  title = "Pencilly Meet",
  onClose,
  onMinimize,
  className,
}) => {
  const t = useTranslations("meet.call");

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2 shrink-0",
        className,
      )}
    >
      {/* Left: close + minimize */}
      <div className="flex items-center gap-1">
        <AppIconButton
          icon={sharedIcons.close}
          size="sm"
          onClick={onClose}
          title={t("close")}
        />
        <AppIconButton
          icon="hugeicons:minus-sign"
          size="sm"
          onClick={onMinimize}
          title={t("minimize")}
        />
      </div>

      {/* Center: title */}
      <AppTypo variant="headingXS" className="absolute left-1/2 -translate-x-1/2">
        {title}
      </AppTypo>

      {/* Right: spacer for balance */}
      <div className="w-16" />
    </div>
  );
};

export default CallHeader;
