import { ConnectionState } from "./types";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface StatusBadgeProps {
  status: ConnectionState;
  statusMessage?: string;
  className?: string;
}

const statusConfig: Record<
  ConnectionState,
  { icon: string; color: string; bg: string }
> = {
  idle: {
    icon: sharedIcons.connection_off,
    color: "text-foreground-light",
    bg: "bg-muted",
  },
  connecting: {
    icon: sharedIcons.connection,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  connected: {
    icon: sharedIcons.connection,
    color: "text-success",
    bg: "bg-success/10",
  },
  disconnected: {
    icon: sharedIcons.connection_off,
    color: "text-danger",
    bg: "bg-danger/10",
  },
};

 function StatusBadge({
  status,
  statusMessage,
  className,
}: StatusBadgeProps) {
  const t = useTranslations("meet.status");
  const config = statusConfig[status];

  const statusText = {
    idle: t("idle"),
    connecting: t("connecting"),
    connected: t("connected"),
    disconnected: t("disconnected"),
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2 py-1",
        config.bg,
        className,
      )}
    >
      <AppIcon icon={config.icon} className={cn("h-3.5 w-3.5", config.color)} />
      <AppTypo variant="xs" className={config.color}>
        {statusMessage || statusText[status]}
      </AppTypo>
    </div>
  );
}

export default StatusBadge