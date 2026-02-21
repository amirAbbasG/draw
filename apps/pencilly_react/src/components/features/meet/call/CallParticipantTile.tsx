import React, { type FC } from "react";

import { usePlayMediaStream } from "@/components/features/meet/hooks";
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
  const isTouchDevice = useIsTouchDevice();

  const {
    id,
    name,
    avatarUrl,
    isMuted,
    isSpeaking,
    isPinned,
    isLocal,
    videoTrack,
    reaction,
      raisedHand
  } = participant;


  const { isTrackExists, isTrackMuted, videoRef } =
    usePlayMediaStream(videoTrack);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted group",
        isSpeaking && "ring-2 ring-primary",
        className,
      )}
    >
      {/* Video layer */}
      {isTrackExists && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            isTrackMuted && "hidden",
          )}
        />
      )}
      {(isTrackMuted || !isTrackExists )&& (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <UserAvatar
            imageSrc={avatarUrl}
            name={name}
            className={cn(
              compact ? "size-10 sm:size-14" : "size-16 sm:size-28",
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
      <div className="absolute bottom-0 inset-x-0 flex items-end  p-2 z-20">
        {
            raisedHand && (
                <AppIcon
                    icon="noto-v1:raised-hand"
                    className="size-6 shrink-0 mb-1"
                />
            )
        }
        {/* Name badge */}
        <div
          className={cn(
            "row gap-1 px-2 py-1 rounded-md max-w-[60%]",
            isTrackExists && !isTrackMuted
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
              "row gap-2 transition-opacity ms-auto",
              !isTouchDevice && " lg:opacity-0 group-hover:opacity-100",
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
