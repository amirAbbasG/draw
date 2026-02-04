import React, { type FC } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslations } from "@/i18n";


import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface IProps {
  onClose: () => void;
  error: string;
  handleReconnect?: () => void;
}

const ErrorDialog: FC<IProps> = ({ error, onClose, handleReconnect }) => {
  const t = useTranslations("error_dialog");
  const onOpenChange = (val: boolean) => {
    if (!val) {
      onClose();
    }
  };

  return (
    <Dialog open={!!error.trim()} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 gap-3 col items-center max-w-xs">
        <VisuallyHidden>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>Error message</DialogDescription>
        </VisuallyHidden>
        <AppIcon
          icon="hugeicons:cancel-circle"
          className="size-10 text-danger"
        />
        <AppTypo variant="headingL">{t("title")}</AppTypo>
        <AppTypo className="whitespace-pre-wrap text-center first-letter:capitalize">
          {error}
        </AppTypo>
        <div className="row gap-2 mt-2">
        <Button color="danger" onClick={onClose}  className="flex-1">
          {t("dismiss")}
        </Button >
        {handleReconnect && (
          <Button
            onClick={handleReconnect}
            className="flex-1"
          >
            {t("reconnect")}
          </Button>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorDialog;
