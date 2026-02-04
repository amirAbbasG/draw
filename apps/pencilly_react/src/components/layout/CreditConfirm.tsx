import type React from "react";
import { useState } from "react";

import PopupHeader from "@/components/shared/PopupHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CREDIT_KEYS } from "@/constants/keys";
import { useTranslations } from "@/i18n";
import {useCheckIsAuth} from "@/hooks/useCheckIsAuth";
import {sharedIcons} from "@/constants/icons";

interface CreditConfirmationPopoverProps {
  children: React.ReactNode;
  onConfirm: () => void;
  featureName: string;
  creditCost?: number;
  storageKey?: keyof typeof CREDIT_KEYS;
}

export function CreditConfirmationPopover({
  children,
  onConfirm,
  featureName,
  storageKey = "AI",
}: CreditConfirmationPopoverProps) {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const t = useTranslations("credit_alert");
  const {fnWithAuth} = useCheckIsAuth()

  const handleTriggerClick = (e: React.MouseEvent) => {
    const shouldSkip = localStorage.getItem(CREDIT_KEYS[storageKey]) === "true";

    if (shouldSkip) {
      e.preventDefault();
      onConfirm();
    }
  };

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem(CREDIT_KEYS[storageKey], "true");
    }
    setOpen(false);
    onConfirm();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={fnWithAuth(handleTriggerClick)}>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3.5 top-z z-100">
        <div className="flex flex-col gap-3.5">
          <PopupHeader
            title={`${featureName} ${t("uses_credit")}`}
            icon={sharedIcons.credit}
            subtitle={t("message")}
          />

          <div className="flex items-center gap-2">
            <Checkbox
              id="dont-show-popover"
              checked={dontShowAgain}
              onCheckedChange={checked => setDontShowAgain(checked === true)}
            />
            <label
              htmlFor="dont-show-popover"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              {t("dont_show_again")}
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"

              className="flex-1"
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button  className="flex-1" onClick={handleConfirm}>
              {t("continue")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
