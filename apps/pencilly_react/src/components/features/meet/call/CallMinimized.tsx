"use client";

import React, { useState, useRef, useCallback, useEffect, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
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

const POPUP_WIDTH = 280;
const POPUP_HEIGHT = 180;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragRef = useRef({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const [position, setPosition] = useState({
    x: typeof window !== "undefined" ? window.innerWidth - POPUP_WIDTH - 20 : 20,
    y: typeof window !== "undefined" ? window.innerHeight - POPUP_HEIGHT - 20 : 20,
  });

  // Attach video track
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !participant.videoTrack) return;
    el.srcObject = new MediaStream([participant.videoTrack]);
    el.play().catch(() => {});
    return () => {
      if (el) el.srcObject = null;
    };
  }, [participant.videoTrack]);

  const hasVideo = !!participant.videoTrack && !participant.isCameraOff && !isCameraMuted;

  // Drag handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Don't drag if clicking on buttons
      if ((e.target as HTMLElement).closest("button")) return;

      dragRef.current = {
        isDragging: true,
        hasMoved: false,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - position.x,
        offsetY: e.clientY - position.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [position],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.isDragging) return;

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      // Only count as "moved" if dragged more than 5px
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragRef.current.hasMoved = true;
      }

      const newX = Math.max(
        0,
        Math.min(
          window.innerWidth - POPUP_WIDTH,
          e.clientX - dragRef.current.offsetX,
        ),
      );
      const newY = Math.max(
        0,
        Math.min(
          window.innerHeight - POPUP_HEIGHT,
          e.clientY - dragRef.current.offsetY,
        ),
      );
      setPosition({ x: newX, y: newY });
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const wasDragging = dragRef.current.hasMoved;
      dragRef.current.isDragging = false;

      // If user didn't drag (just a click), do nothing here;
      // double-click will handle maximize
    },
    [],
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
        "fixed z-[60] rounded-xl overflow-hidden shadow-xl cursor-grab active:cursor-grabbing select-none",
        "bg-foreground/80 backdrop-blur-md",
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
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {participant.avatarUrl ? (
            <UserAvatar
              imageSrc={participant.avatarUrl}
              name={participant.name}
              className="size-16 text-lg"
            />
          ) : (
            <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center">
              <AppIcon
                icon={sharedIcons.user}
                className="size-8 text-primary"
              />
            </div>
          )}
        </div>
      )}

      {/* Top-right: Close + Maximize buttons */}
      <div className="absolute top-2 end-2 flex items-center gap-1 z-10">
        <AppIconButton
          icon={sharedIcons.maximize}
          size="xs"
          variant="default"
          className="bg-background/70 backdrop-blur-sm text-foreground hover:bg-background/90"
          title={t("maximize")}
          onClick={onMaximize}
        />
        <AppIconButton
          icon={sharedIcons.close}
          size="xs"
          variant="default"
          className="bg-background/70 backdrop-blur-sm text-foreground hover:bg-background/90"
          title={t("close")}
          onClick={onClose}
        />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-2 z-10">
        <AppIconButton
          icon={isMicMuted ? sharedIcons.mic_off : sharedIcons.mic}
          size="sm"
          variant="default"
          color={isMicMuted ? "danger" : "default"}
          className="bg-background/70 backdrop-blur-sm hover:bg-background/90"
          title={isMicMuted ? t("unmute_mic") : t("mute_mic")}
          onClick={onToggleMic}
        />
        <AppIconButton
          icon={isCameraMuted ? sharedIcons.video_off : sharedIcons.video}
          size="sm"
          variant="default"
          color={isCameraMuted ? "danger" : "default"}
          className="bg-background/70 backdrop-blur-sm hover:bg-background/90"
          title={isCameraMuted ? t("turn_on_camera") : t("turn_off_camera")}
          onClick={onToggleCamera}
        />
      </div>

      {/* Name overlay */}
      <div className="absolute bottom-2 start-2 z-10">
        <AppTypoName name={participant.name} isLocal={participant.isLocal} />
      </div>
    </div>
  );
};

export default CallMinimized;

/** Small name label */
function AppTypoName({ name, isLocal }: { name: string; isLocal?: boolean }) {
  const t = useTranslations("meet.call");
  return (
    <span className="text-xs text-background bg-foreground/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
      {isLocal ? t("me") : name}
    </span>
  );
}
