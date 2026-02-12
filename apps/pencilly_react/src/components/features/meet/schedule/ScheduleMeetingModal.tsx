import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";
import { ScheduleMeeting } from "./ScheduleMeeting";

interface ScheduleMeetingModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  open = false,
  onOpenChange,
}) => {
  const t = useTranslations("meet.schedule");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppTypo variant="headingM">
              {t("schedule_meeting")}
            </AppTypo>
          </div>
          <AppIconButton
            icon={sharedIcons.close}
            size="sm"
            onClick={() => onOpenChange?.(false)}
            title={t("close")}
          />
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <ScheduleMeeting onClose={() => onOpenChange?.(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
