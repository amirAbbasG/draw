"use client";

import React, { useEffect, useState, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { CallOwner, CallRoom, GridSettings } from "./types";
import CallActions from "./CallActions";

interface CallFooterProps {
  owner: CallOwner;
  room: CallRoom;
  startTime: number;
  // Action states
  isMicMuted: boolean;
  isVolumeMuted: boolean;
  isCameraMuted: boolean;
  isScreenSharing: boolean;
  /** Grid layout settings */
  gridSettings: GridSettings;
  // Action handlers
  onToggleMic: () => void;
  onToggleVolume: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onReaction: () => void;
  onChat: () => void;
  onGridSettingsChange: (settings: GridSettings) => void;
  onAddUser: () => void;
  onEndCall: () => void;
  className?: string;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

const CallFooter: FC<CallFooterProps> = ({
  owner,
  room,
  startTime,
  isMicMuted,
  isVolumeMuted,
  isCameraMuted,
  isScreenSharing,
  gridSettings,
  onToggleMic,
  onToggleVolume,
  onToggleCamera,
  onToggleScreenShare,
  onReaction,
  onChat,
  onGridSettingsChange,
  onAddUser,
  onEndCall,
  className,
}) => {
  const t = useTranslations("meet.call");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(room.link);
    } catch {
      // Fallback - do nothing
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 px-2 py-2 shrink-0 sm:px-3 md:px-4 md:flex-row md:justify-between md:gap-2",
        className,
      )}
    >
      {/* Top row on mobile: owner info + room link side by side */}
      <div className="flex w-full items-center justify-between gap-2 md:contents">
        {/* Left: Owner info + elapsed */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <UserAvatar
            imageSrc={owner.avatarUrl}
            name={owner.name}
            className="size-7 sm:size-9 text-xs shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <AppTypo variant="small" className="font-semibold truncate text-xs sm:text-sm">
              {owner.name}
            </AppTypo>
            <AppTypo variant="xs" color="secondary">
              {formatElapsed(elapsed)}
            </AppTypo>
          </div>
        </div>

        {/* Right: Room link (visible in this row on mobile, pushed right on desktop) */}
        <div className="flex flex-col items-end gap-0.5 shrink-0 min-w-0 max-w-32 sm:max-w-48 md:order-3">
          <AppTypo variant="small" className="font-semibold text-xs sm:text-sm">
            {t("room_link")}
          </AppTypo>
          <button
            type="button"
            className="flex items-center gap-1 hover:opacity-80 transition-opacity max-w-full"
            onClick={handleCopyLink}
            title={t("copy_link")}
          >
            <AppIcon icon={sharedIcons.copy} className="size-3 sm:size-3.5 text-primary shrink-0" />
            <AppTypo
              variant="xs"
              color="primary"
              className="truncate underline underline-offset-2"
            >
              {room.link}
            </AppTypo>
          </button>
        </div>
      </div>

      {/* Center: Actions (full width on mobile, centered on desktop) */}
      <CallActions
        isMicMuted={isMicMuted}
        isVolumeMuted={isVolumeMuted}
        isCameraMuted={isCameraMuted}
        isScreenSharing={isScreenSharing}
        gridSettings={gridSettings}
        onToggleMic={onToggleMic}
        onToggleVolume={onToggleVolume}
        onToggleCamera={onToggleCamera}
        onToggleScreenShare={onToggleScreenShare}
        onReaction={onReaction}
        onChat={onChat}
        onGridSettingsChange={onGridSettingsChange}
        onAddUser={onAddUser}
        onEndCall={onEndCall}
        className="md:order-2"
      />
    </div>
  );
};

export default CallFooter;
