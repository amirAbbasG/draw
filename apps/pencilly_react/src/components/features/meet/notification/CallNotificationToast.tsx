import { useCallback, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { setCallData } from "@/stores/zustand/collaborate/actions";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import { useRingtone } from "./useNotificationSound";

export interface CallNotificationData {
  callerName: string;
  callerAvatarUrl?: string;
  callType?: "voice" | "video";
}

interface CallNotificationToastProps {
  data: CallNotificationData;
  onAccept: () => void;
  onDecline: () => void;
  className?: string;
}

const CallNotificationToast: FC<CallNotificationToastProps> = ({
  data,
  onAccept,
  onDecline,
  className,
}) => {
  const t = useTranslations("meet.notification");
  const stopRingtone = useRingtone(true);

  const onClose = () => {
    stopRingtone();
    onDecline();
    setCallData(null);
  };

  const handleAccept = useCallback(() => {
    stopRingtone();
    onAccept();
  }, [onAccept, stopRingtone]);

  const handleDecline = useCallback(() => {
    onClose();
  }, [onClose]);

  const callTypeIcon =
    data.callType === "video" ? sharedIcons.video : sharedIcons.call;

  return (
    <div className={cn("notification-toast", className)}>
      {/* Avatar */}
      <UserAvatar
        imageSrc={data.callerAvatarUrl}
        name={data.callerName}
        className="size-12 text-sm shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0 col gap-1">
        <AppTypo variant="headingXS" className=" text-white truncate">
          {data.callerName}
        </AppTypo>
        <div className="flex items-center gap-1">
          <AppIcon icon={callTypeIcon} className="size-3.5 text-white/70" />
          <AppTypo variant="small" className="text-white/70 truncate">
            {t("is_calling_you")}
          </AppTypo>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Accept */}
        <button
          onClick={handleAccept}
          className={cn(
            "size-10 rounded-full flex items-center justify-center",
            "bg-green-500 hover:bg-green-600 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400",
          )}
          aria-label={t("accept_call")}
        >
          <AppIcon icon={sharedIcons.call} className="size-5 text-white" />
        </button>

        {/* Decline */}
        <button
          onClick={handleDecline}
          className={cn(
            "size-10 rounded-full flex items-center justify-center",
            "bg-red-500 hover:bg-red-600 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
          )}
          aria-label={t("decline_call")}
        >
          <AppIcon icon={sharedIcons.call_end} className="size-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default CallNotificationToast;
