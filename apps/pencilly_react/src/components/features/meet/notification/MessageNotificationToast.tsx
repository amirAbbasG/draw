import React, { useEffect, useRef, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import { playNotificationTone } from "./useNotificationSound";

export interface MessageNotificationData {
  senderName: string;
  senderAvatarUrl?: string;
  messagePreview: string;
  conversationId?: string;
}

interface MessageNotificationToastProps {
  data: MessageNotificationData;
  onClose: () => void;
  onClick?: () => void;
  className?: string;
}

const MessageNotificationToast: FC<MessageNotificationToastProps> = ({
  data,
  onClose,
  onClick,
  className,
}) => {
  const t = useTranslations("meet.notification");
  const hasPlayedRef = useRef(false);

  // Play notification tone once on mount
  useEffect(() => {
    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true;
      playNotificationTone();
    }
  }, []);

  const handleClick = () => {
    onClick?.();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className={cn(
        "notification-toast",
        onClick && "cursor-pointer hover:bg-[#677384] transition-colors",
        className,
      )}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? e => {
              if (e.key === "Enter") handleClick();
            }
          : undefined
      }
    >
      {/* Avatar */}
      <UserAvatar
        imageSrc={data.senderAvatarUrl}
        name={data.senderName}
        className="size-12 text-sm shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0 col gap-1">
        <AppTypo variant="headingXS" className=" text-white truncate">
          {data.senderName}
        </AppTypo>
        <AppTypo variant="small" className="text-white/70 truncate">
          {data.messagePreview}
        </AppTypo>
      </div>

      {/* Close button */}
      <AppIconButton
        title={t("close")}
        icon={sharedIcons.close}
        onClick={handleClose}
        size="sm"
        color="light"
        className="shrink-0 hover:bg-white/10 active:bg-white/10"
      />
    </div>
  );
};

export default MessageNotificationToast;
