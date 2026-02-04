import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";


interface UpgradeDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  featureName?: string;
}

export function UpgradeDialog({ isOpen, setIsOpen }: UpgradeDialogProps) {
  const t = useTranslations("upgrade_dialog");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md responsive-dialog-sm z-100 col gap-4 ">
        <DialogHeader className="text-center sm:text-center col items-center gap-2">
          <AppIcon
            icon={sharedIcons.sparkles}
            className="text-primary size-12 bg-primary-lighter rounded-full p-2.5 "
          />
          <DialogTitle className="text-xl">{t("title")}</DialogTitle>
          <DialogDescription className=" text-base">{t("message")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-4">
          <Link to="/upgrade" className="w-full">
            <Button className="w-full" icon={sharedIcons.pricing}>{t("accept")}</Button>
          </Link>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            {t("cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
