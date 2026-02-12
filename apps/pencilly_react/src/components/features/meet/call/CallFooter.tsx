import React, { useEffect, useState, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import CallActions from "./CallActions";
import type {CallOwner, CallRoom, GridSettings} from "./types";

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
  onReaction: (emoji: string) => void;
  onChat: () => void;
  onEndCall: () => void;
  className?: string;
  onGridSettingsChange: (settings: GridSettings) => void;
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
  onToggleMic,
  onToggleVolume,
  onToggleCamera,
  onToggleScreenShare,
  onReaction,
  onChat,
  onEndCall,
  className,
    gridSettings,
    onGridSettingsChange
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
        "flex items-center justify-center md:justify-between px-2 md:px-4 py-2 shrink-0 gap-2",
        className,
      )}
    >
      {/* Left: Owner info + elapsed (hidden on small screens) */}
      <div className="hidden md:flex items-center gap-3 shrink-0 min-w-0">
        <UserAvatar
          imageSrc={owner.avatarUrl}
          name={owner.name}
          className="size-14 shrink-0"
        />
        <div className="col gap-1.5 min-w-0">
          <AppTypo variant="headingS" className="font-semibold truncate">
            {owner.name}
          </AppTypo>
          <AppTypo variant="small" color="secondary">
            {formatElapsed(elapsed)}
          </AppTypo>
        </div>
      </div>

      {/* Center: Actions */}
      <CallActions
        isMicMuted={isMicMuted}
        isVolumeMuted={isVolumeMuted}
        isCameraMuted={isCameraMuted}
        isScreenSharing={isScreenSharing}
        onToggleMic={onToggleMic}
        onToggleVolume={onToggleVolume}
        onToggleCamera={onToggleCamera}
        onToggleScreenShare={onToggleScreenShare}
        onReaction={onReaction}
        onChat={onChat}
        onGridSettingsChange={onGridSettingsChange}
        gridSettings={gridSettings}
        onEndCall={onEndCall}
      />

      {/* Right: Room link (hidden on small screens) */}
      <div className="hidden md:flex md:flex-col items-end gap-2 shrink-0 min-w-0 max-w-48">
        <AppTypo variant="headingS" className="font-semibold">
          {t("room_link")}
        </AppTypo>
        <button
          type="button"
          className="flex items-center gap-1 hover:opacity-80 transition-opacity max-w-full"
          onClick={handleCopyLink}
          title={t("copy_link")}
        >
          <AppIcon
            icon={sharedIcons.copy}
            className="size-3.5 text-primary shrink-0"
          />
          <AppTypo
            variant="xs"
            className="truncate underline underline-offset-2"
          >
            {room.link}
          </AppTypo>
        </button>
      </div>
    </div>
  );
};

export default CallFooter;
