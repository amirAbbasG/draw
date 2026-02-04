
import { OrDivider } from "@/components/shared/OrDivider";
import AppIcon from "@/components/ui/custom/app-icon";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";
import AppTypo from "@/components/ui/custom/app-typo";

interface ShareCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  isPending?: boolean;
}

const variantStyles = {
  primary: {
    root: "from-primary/5 to-primary/10 hover:border-primary",
    icon: "bg-primary-light/10 group-hover:bg-primary-light/15 text-primary",
  },
  secondary: {
    root: "from-secondary/5 to-secondary/10 hover:border-secondary",
    icon: "bg-secondary/10 group-hover:bg-secondary/15 text-secondary",
  },
};

const ShareCard = ({
  description,
  icon,
  onClick,
  title,
  variant = "primary",
    isPending
}: ShareCardProps) => {
  return (
    <div
      className={cn(
        "group rounded-lg border p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br",
        variantStyles[variant].root,
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <AppIcon
          icon={isPending ? "eos-icons:bubble-loading" : icon }
          className={cn(
            "h-12 w-12 rounded-lg centered-col p-3 transition-colors",
            variantStyles[variant].icon,
          )}
        />
        <AppIcon
          icon={sharedIcons.arrow_right}
          className={cn("h-5 w-5 text-muted-foreground transition-colors",
              variant === "primary" ? "group-hover:text-primary" : "group-hover:text-secondary"
          )}
        />
      </div>
      <AppTypo variant="large" className="mb-2 block font-semibold">{title}</AppTypo>
      <AppTypo color="secondary">
        {description}
      </AppTypo>
    </div>
  );
};

interface InitialMenuProps {
  onLiveShareClick: () => void;
  onExportToLink: () => void;
  isPendingExport: boolean
}

export function InitialMenu({
  onLiveShareClick,
  onExportToLink,
                              isPendingExport
}: InitialMenuProps) {
  const t = useTranslations("share");

  return (
    <>
      <DialogHeader className="px-6 py-4 border-b ">
        <DialogTitle className="text-xl font-semibold">
          {t("title")}
        </DialogTitle>
      </DialogHeader>

      <div className="px-6 py-8 col gap-6">
        <ShareCard
          icon={sharedIcons.live}
          title={t("live_share")}
          description={t("live_share_description")}
          onClick={onLiveShareClick}
        />
        {/* Divider */}
        <OrDivider />

        <ShareCard
          icon={sharedIcons.link}
          variant="secondary"
          title={t("share_link")}
          description={t("export_to_link_description")}
          onClick={onExportToLink}
          isPending={isPendingExport}
        />
      </div>
    </>
  );
}
