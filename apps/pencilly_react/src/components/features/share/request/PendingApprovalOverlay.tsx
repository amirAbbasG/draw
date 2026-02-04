import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { useTranslations } from "@/i18n";

interface PendingApprovalOverlayProps {
  isVisible: boolean;
  onCancel: () => void;
}

export function PendingApprovalOverlay({
  isVisible,
  onCancel,
}: PendingApprovalOverlayProps) {
  const [dots, setDots] = useState("");
  const t = useTranslations("share.pending_approval");

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex centered-col bg-overlay backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl p-8 bg-popover shadow-2xl border">
        <div className="flex flex-col items-center gap-6">
          {/* Animated Icon */}
          <div className="relative">
            <AppIcon
              icon="hugeicons:time-half-pass"
              className="p-5 text-primary size-20 rounded-full bg-primary-lighter"
            />
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          </div>

          {/* Content */}
          <div className="text-center col gap-2">
            <AppTypo variant="headingM" className="mb-2">
              {t("title")}
            </AppTypo>
            <AppTypo color="secondary">{t("description")}</AppTypo>
          </div>

          {/* Loading indicator */}
          <div className="row gap-3 rounded bg-primary-lighter px-4 py-3">
            <AppTypo variant="small" color="primary">
              {t("waiting_for_owner")}
              {dots}
            </AppTypo>
          </div>

          {/* Cancel button */}
          <Button variant="outline" onClick={onCancel} size="lg">
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
