import CopyButton from "@/components/shared/CopyButton";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

interface InviteSectionProps {
  shareUrl: string;
  className?: string;
}

export function InviteSection({ shareUrl, className }: InviteSectionProps) {
  const t = useTranslations("call");

  return (
    <div className={cn("flex flex-col gap-2 border-b p-3", className)}>
      <AppTypo variant="xs" color="secondary">
        {t("share_link")}
      </AppTypo>
      <div className="flex gap-2">
        <Input value={shareUrl} readOnly className="flex-1 text-xs" />
        <CopyButton
          text={shareUrl}
          title={t("copy_link")}
          variant="button"
          className="h-8 w-24 min-w-24"
          buttonVariant="outline"
        />
      </div>
    </div>
  );
}
