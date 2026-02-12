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
    <div className={cn("spacing-row p-4 shrink-0", className)}>
      {/*  title */}
      <AppTypo
        variant="headingM"
        // className="absolute left-1/2 -translate-x-1/2"
      >
        {title}
      </AppTypo>

      {/*: close + minimize */}
      <div className="row gap-1 ms-auto">
        <AppIconButton
          icon="hugeicons:minus-sign"
          size="sm"
          onClick={onMinimize}
          title={t("minimize")}
        />
        <AppIconButton
          icon={sharedIcons.close}
          size="sm"
          onClick={onClose}
          title={t("close")}
          color="danger"
        />
      </div>
    </div>
  );
};

export default CallHeader;
