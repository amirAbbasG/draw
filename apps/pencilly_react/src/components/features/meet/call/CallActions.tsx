"use client";

import React, { type FC } from "react";

import AppIconButton from "@/components/ui/custom/app-icon-button";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface CallActionsProps {
  isMicMuted: boolean;
  isVolumeMuted: boolean;
  isCameraMuted: boolean;
  isScreenSharing: boolean;
  onToggleMic: () => void;
  onToggleVolume: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onReaction: () => void;
  onChat: () => void;
  onGrid: () => void;
  onAddUser: () => void;
  onEndCall: () => void;
  className?: string;
}

const CallActions: FC<CallActionsProps> = ({
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
  onGrid,
  onAddUser,
  onEndCall,
  className,
}) => {
  const t = useTranslations("meet.call");

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg bg-muted/80 backdrop-blur-sm px-4 py-2",
        className,
      )}
    >
      {/* Mic */}
      <AppIconButton
        icon={isMicMuted ? sharedIcons.mic_off : sharedIcons.mic}
        size="default"
        variant="outline"
        color={isMicMuted ? "danger" : "default"}
        title={isMicMuted ? t("unmute_mic") : t("mute_mic")}
        onClick={onToggleMic}
        className="rounded-lg bg-background"
      />

      {/* Volume */}
      <AppIconButton
        icon={isVolumeMuted ? "hugeicons:volume-off" : sharedIcons.speak}
        size="default"
        variant="outline"
        color={isVolumeMuted ? "danger" : "default"}
        title={isVolumeMuted ? t("unmute_volume") : t("mute_volume")}
        onClick={onToggleVolume}
        className="rounded-lg bg-background"
      />

      {/* Camera */}
      <AppIconButton
        icon={isCameraMuted ? sharedIcons.video_off : sharedIcons.video}
        size="default"
        variant="outline"
        color={isCameraMuted ? "danger" : "default"}
        title={isCameraMuted ? t("turn_on_camera") : t("turn_off_camera")}
        onClick={onToggleCamera}
        className="rounded-lg bg-background"
      />

      {/* Screen Share */}
      <AppIconButton
        icon={isScreenSharing ? sharedIcons.screen_share_off : sharedIcons.screen_share}
        size="default"
        variant="outline"
        color={isScreenSharing ? "success" : "default"}
        title={isScreenSharing ? t("stop_sharing") : t("share_screen")}
        onClick={onToggleScreenShare}
        className="rounded-lg bg-background"
      />

      {/* Reactions */}
      <AppIconButton
        icon="hugeicons:smile"
        size="default"
        variant="outline"
        title={t("reactions")}
        onClick={onReaction}
        className="rounded-lg bg-background"
      />

      {/* Chat */}
      <AppIconButton
        icon={sharedIcons.chat}
        size="default"
        variant="outline"
        title={t("chat")}
        onClick={onChat}
        className="rounded-lg bg-background"
      />

      {/* Grid */}
      <AppIconButton
        icon={sharedIcons.grid}
        size="default"
        variant="outline"
        title={t("grid_view")}
        onClick={onGrid}
        className="rounded-lg bg-background"
      />

      {/* Add User */}
      <AppIconButton
        icon={sharedIcons.user_add}
        size="default"
        variant="outline"
        title={t("add_user")}
        onClick={onAddUser}
        className="rounded-lg bg-background"
      />

      {/* End Call */}
      <AppIconButton
        icon={sharedIcons.call_end}
        size="default"
        variant="fill"
        color="danger"
        title={t("end_call")}
        onClick={onEndCall}
        className="rounded-lg"
      />
    </div>
  );
};

export default CallActions;
