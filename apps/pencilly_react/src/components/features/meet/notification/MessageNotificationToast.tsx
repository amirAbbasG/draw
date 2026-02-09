'use client';

import React from "react"

import { useEffect, useRef, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";

import { playNotificationTone } from "./useNotificationSound";

const AUTO_DISMISS_TIMEOUT = 10_000;

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPlayedRef = useRef(false);

  // Play notification tone once on mount
  useEffect(() => {
    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true;
      playNotificationTone();
    }
  }, []);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onClose();
    }, AUTO_DISMISS_TIMEOUT);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onClose]);

  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onClick?.();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerRef.current) clearTimeout(timerRef.current);
    onClose();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 w-[349px] h-[80px] px-4",
        "rounded-xl bg-[#5d6b7e] shadow-lg",
        "animate-in slide-in-from-top-2 fade-in duration-300",
        onClick && "cursor-pointer hover:bg-[#677384] transition-colors",
        className,
      )}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
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
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <AppTypo variant="small" className="font-semibold text-white truncate">
          {data.senderName}
        </AppTypo>
        <AppTypo variant="xs" className="text-white/70 truncate">
          {data.messagePreview}
        </AppTypo>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className={cn(
          "size-7 rounded-full flex items-center justify-center shrink-0",
          "hover:bg-white/10 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        )}
        aria-label={t("close")}
      >
        <AppIcon icon={sharedIcons.close} className="size-4 text-white/80" />
      </button>
    </div>
  );
};

export default MessageNotificationToast;
