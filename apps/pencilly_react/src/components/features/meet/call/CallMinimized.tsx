import React, { useCallback, type FC } from "react";

import { useDraggable } from "@/components/features/meet/hooks/useDraggable";
import { usePlayMediaStream } from "@/components/features/meet/hooks";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { CallParticipant } from "./types";

interface CallMinimizedProps {
  /** The currently speaking or primary participant to display */
  participant: CallParticipant;
  isMicMuted: boolean;
  isCameraMuted: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onMaximize: () => void;
  onClose: () => void;
  className?: string;
}

const POPUP_WIDTH = 220;
const POPUP_HEIGHT = 180;

const buttonProps = {
  size: "xs",
  variant: "fill",
  color: "background",
} as const;

const CallMinimized: FC<CallMinimizedProps> = ({
  participant,
  isMicMuted,
  isCameraMuted,
  onToggleMic,
  onToggleCamera,
  onMaximize,
  onClose,
  className,
}) => {
  const t = useTranslations("meet.call");

  const {
    handlePointerUp,
    containerRef,
    handlePointerMove,
    handlePointerDown,
    position,
  } = useDraggable(POPUP_WIDTH, POPUP_HEIGHT);

  const { isTrackExists, isTrackMuted, videoRef } = usePlayMediaStream(
    participant.videoTrack,
      participant.isScreenSharing && participant.screenTrack
  );

  // Double-click to maximize
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      onMaximize();
    },
    [onMaximize],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-[999] rounded-lg overflow-hidden shadow-xl p-2 cursor-grab active:cursor-grabbing select-none",
        "bg-background-darker backdrop-blur-md",
        participant.isSpeaking && "ring-2 ring-primary",
        className,
      )}
      style={{
        width: POPUP_WIDTH,
        height: POPUP_HEIGHT,
        left: position.x,
        top: position.y,
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* Video / Avatar background */}
      {isTrackExists && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            isTrackMuted && "hidden",
          )}
        />
      )}

      {(isTrackMuted || !isTrackExists ) && (
        <div className="absolute inset-2 rounded centered-row ">
          <UserAvatar
            imageSrc={participant.avatarUrl}
            name={participant.name}
            className="size-16 text-lg"
          />
        </div>
      )}

      {/* Top-right: Close + Maximize buttons */}
      <div className="absolute top-2 end-2 row gap-2 z-10">
        <AppIconButton
          icon={sharedIcons.maximize}
          {...buttonProps}
          title={t("maximize")}
          onClick={onMaximize}
        />
        <AppIconButton
          icon={sharedIcons.close}
          {...buttonProps}
          title={t("close")}
          onClick={onClose}
        />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-2 inset-x-2 row  gap-2 z-10">
        <span className="text-xs  bg-background/70 backdrop-blur-sm px-2 h-6 row  rounded max-w-full truncate">
          {participant.isLocal ? t("me") : participant.name}
        </span>
        <AppIconButton
          icon={isMicMuted ? sharedIcons.mic_off : sharedIcons.mic}
          {...buttonProps}
          iconClassName={isMicMuted ? "text-danger" : ""}
          title={isMicMuted ? t("unmute_mic") : t("mute_mic")}
          onClick={onToggleMic}
        />
        <AppIconButton
          icon={isCameraMuted ? sharedIcons.video_off : sharedIcons.video}
          {...buttonProps}
          iconClassName={isCameraMuted ? "text-danger" : ""}
          title={isCameraMuted ? t("turn_on_camera") : t("turn_off_camera")}
          onClick={onToggleCamera}
        />
      </div>
    </div>
  );
};

export default CallMinimized;
