import React, { useEffect, useRef, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
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
  const isTouchDevice = useIsTouchDevice();

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

  // useEffect(() => {
  //   const videoElement = videoRef.current;
  //   if (!videoElement || !videoTrack) return;
  //
  //   videoElement.srcObject = new MediaStream([videoTrack]);
  //
  //   // Ensure video playback starts
  //   videoElement.play().catch(err => console.error("Play error:", err));
  //
  //   return () => {
  //     if (videoElement) {
  //       videoElement.srcObject = null;
  //     }
  //   };
  // }, [videoTrack, isLocal]);

  const track = videoTrack?.track;

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !track) return;
    el.srcObject = new MediaStream([track]);
    el.play().catch(() => {});
    return () => {
      if (el) el.srcObject = null;
    };
  }, [track]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted group",
        isSpeaking && "ring-2 ring-primary",
        className,
      )}
    >
      {/* Video layer */}
      {track && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            videoTrack?.isMuted && "hidden",
          )}
        />
      )}
      {!!videoTrack?.isMuted && (
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/10">
          <UserAvatar
            imageSrc={avatarUrl}
            name={name}
            className={cn(
              compact ? "size-12 sm:size-18" : "size-16 sm:size-28",
              "text-base",
            )}
          />
        </div>
      )}

      {/* Reaction overlay */}
      {reaction && (
        <div
          key={reaction}
          className="absolute  inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <span className="text-5xl animate-emoji-reaction">{reaction}</span>
        </div>
      )}

      {/* Bottom bar: name + actions */}
      <div className="absolute bottom-0 inset-x-0 flex items-end justify-between p-2 z-20">
        {/* Name badge */}
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md max-w-[60%]",
            !!track && !videoTrack?.isMuted
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
            variant="headingXS"
            className="truncate first-letter:capitalize"
          >
            {isLocal ? t("me") : name}
          </AppTypo>
        </div>

        {/* Pin / Remove buttons - visible on hover or when menu open */}
        {!isLocal && (
          <div
            className={cn(
              "row gap-2 transition-opacity",
              !isTouchDevice && " lg:opacity-0 group-hover:opacity-100",
              // showMenu
              //   ? "opacity-100"
              //   : "opacity-0 group-hover:opacity-100",
            )}
          >
            <AppIconButton
              icon={isPinned ? sharedIcons.pin_filled : sharedIcons.pin_outline}
              size="xs"
              variant="fill"
              color="background"
              title={isPinned ? t("unpin") : t("pin")}
              onClick={() => onPin?.(id)}
            />
            <AppIconButton
              icon={sharedIcons.delete}
              size="xs"
              variant="fill"
              color="background"
              title={t("remove")}
              iconClassName="text-danger"
              onClick={() => onRemove?.(id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CallParticipantTile;
