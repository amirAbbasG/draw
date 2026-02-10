"use client";

import React, { useEffect, useRef, useState, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { CallParticipant } from "./types";

interface CallParticipantTileProps {
  participant: CallParticipant;
  onPin?: (id: string) => void;
  onRemove?: (id: string) => void;
  className?: string;
  /** Compact mode for smaller tiles in bottom row */
  compact?: boolean;
}

const CallParticipantTile: FC<CallParticipantTileProps> = ({
  participant,
  onPin,
  onRemove,
  className,
  compact = false,
}) => {
  const t = useTranslations("meet.call");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  const {
    id,
    name,
    avatarUrl,
    isMuted,
    isCameraOff,
    isSpeaking,
    isPinned,
    isLocal,
    videoTrack,
    reaction,
  } = participant;

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoTrack) return;
    el.srcObject = new MediaStream([videoTrack]);
    el.play().catch(() => {});
    return () => {
      if (el) el.srcObject = null;
    };
  }, [videoTrack]);

  const hasVideo = !!videoTrack && !isCameraOff;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted group",
        isSpeaking && "ring-2 ring-primary",
        className,
      )}
    >
      {/* Video layer */}
      {hasVideo && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Avatar fallback when camera is off */}
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/10">
          {avatarUrl ? (
            <UserAvatar
              imageSrc={avatarUrl}
              name={name}
              className={cn(
                compact ? "size-12" : "size-20",
                "text-base",
              )}
            />
          ) : (
            <div
              className={cn(
                "rounded-full bg-primary/20 flex items-center justify-center",
                compact ? "size-12" : "size-20",
              )}
            >
              <AppIcon
                icon={sharedIcons.user}
                className={cn(
                  "text-primary",
                  compact ? "size-6" : "size-10",
                )}
              />
            </div>
          )}
        </div>
      )}

      {/* Reaction overlay */}
      {reaction && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span className="text-5xl animate-bounce">{reaction}</span>
        </div>
      )}

      {/* Bottom bar: name + actions */}
      <div className="absolute bottom-0 inset-x-0 flex items-end justify-between p-2 z-20">
        {/* Name badge */}
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md max-w-[60%]",
            hasVideo
              ? "bg-background/80 backdrop-blur-sm"
              : "",
          )}
        >
          {isMuted && (
            <AppIcon
              icon={sharedIcons.mic_off}
              className="size-3 text-danger shrink-0"
            />
          )}
          <AppTypo
            variant="xs"
            className="truncate first-letter:capitalize"
          >
            {isLocal ? t("me") : name}
          </AppTypo>
        </div>

        {/* Pin / Remove buttons - visible on hover or when menu open */}
        {!isLocal && (
          <div
            className={cn(
              "flex items-center gap-1 transition-opacity",
              showMenu
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100",
            )}
          >
            <AppIconButton
              icon={isPinned ? sharedIcons.pin_filled : sharedIcons.pin_outline}
              size="xs"
              variant="default"
              className="bg-background/80 backdrop-blur-sm"
              title={isPinned ? t("unpin") : t("pin")}
              onClick={() => onPin?.(id)}
            />
            <div className="relative">
              <AppIconButton
                icon={sharedIcons.more_horizontal}
                size="xs"
                variant="default"
                className="bg-background/80 backdrop-blur-sm"
                title={t("more")}
                onClick={() => setShowMenu((v) => !v)}
              />
              {showMenu && (
                <div className="absolute bottom-full end-0 mb-1 bg-popover border rounded-md shadow-lg p-1 min-w-28 z-30">
                  <button
                    type="button"
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm hover:bg-muted text-danger"
                    onClick={() => {
                      onRemove?.(id);
                      setShowMenu(false);
                    }}
                  >
                    <AppIcon icon={sharedIcons.user} className="size-3.5" />
                    {t("remove")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallParticipantTile;
