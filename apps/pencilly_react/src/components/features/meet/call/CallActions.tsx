import React, { type FC } from "react";

import AddUserPopup from "@/components/features/meet/call/AddUserPopup";
import LayoutSelector from "@/components/features/meet/call/LayoutSelector";
import { GridSettings } from "@/components/features/meet/call/types";
import type { MeetUser } from "@/components/features/meet/types";
import EmojiPicker from "@/components/shared/EmojiPicker";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface CallActionsProps {
  isMicMuted: boolean;
  isVolumeMuted: boolean;
  isCameraMuted: boolean;
  isScreenSharing: boolean;
  onToggleMic: () => void;
  onToggleVolume: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onReaction: (emoji: string) => void;
  onChat: () => void;
  onEndCall: () => void;
  className?: string;
  gridSettings: GridSettings;
  onGridSettingsChange: (settings: GridSettings) => void;
}

const Divider = () => (
  <div className="h-8 md:h-10 w-[1px] bg-background" />
);

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

  onEndCall,
  className,
  gridSettings,
  onGridSettingsChange,
}) => {
  const t = useTranslations("meet.call");
  const { isLessThan } = useBreakpoint();
  const isCompact = isLessThan("md");

  const commonProps = {
    size: isCompact ? "default" as const : "xl" as const,
    variant: "fill" as const,
    color: "background" as const,
  };

  return (
    <div
      className={cn(
        "row gap-2 md:gap-4 rounded-lg bg-background-dark backdrop-blur-sm px-2 md:px-4 py-1.5 md:py-2",
        className,
      )}
    >
      {/* Mic */}
      <AppIconButton
        icon={isMicMuted ? sharedIcons.mic_off : sharedIcons.mic}
        {...commonProps}
        iconClassName={isMicMuted ? "text-danger" : ""}
        title={isMicMuted ? t("unmute_mic") : t("mute_mic")}
        onClick={onToggleMic}
      />

      {/* Volume */}
      <AppIconButton
        icon={isVolumeMuted ? "hugeicons:volume-off" : sharedIcons.speak}
        {...commonProps}
        iconClassName={isVolumeMuted ? "text-danger" : ""}
        title={isVolumeMuted ? t("unmute_volume") : t("mute_volume")}
        onClick={onToggleVolume}
      />

      {/* Camera */}
      <AppIconButton
        icon={isCameraMuted ? sharedIcons.video_off : sharedIcons.video}
        {...commonProps}
        iconClassName={isCameraMuted ? "text-danger" : ""}
        title={isCameraMuted ? t("turn_on_camera") : t("turn_off_camera")}
        onClick={onToggleCamera}
      />

      {/* Screen Share */}
      <AppIconButton
        icon={
          isScreenSharing
            ? sharedIcons.screen_share_off
            : sharedIcons.screen_share
        }
        {...commonProps}
        iconClassName={isCameraMuted ? "text-success" : ""}
        title={isScreenSharing ? t("stop_sharing") : t("share_screen")}
        onClick={onToggleScreenShare}
      />

      <Divider />

      {/* Reactions (hidden on small screens) */}
      {!isCompact && (
        <EmojiPicker
          onChange={onReaction}
          reactionsDefaultOpen
          Trigger={
            <AppIconButton
              icon="hugeicons:smile"
              {...commonProps}
              title={t("reactions")}
              element="div"
            />
          }
        />
      )}

      {/* Chat */}
      <AppIconButton
        icon={sharedIcons.chat}
        {...commonProps}
        title={t("chat")}
        onClick={onChat}
      />

      {/* Grid (hidden on small screens) */}
      {!isCompact && (
        <LayoutSelector settings={gridSettings} onChange={onGridSettingsChange} />
      )}

      {/* Add User (hidden on small screens) */}
      {!isCompact && (
        <AddUserPopup
          friends={friends}
          onInvite={() => {}}
          onSendEmailInvite={() => {}}
        />
      )}

      <Divider />

      {/* End Call */}
      <AppIconButton
        icon={sharedIcons.call_end}
        {...commonProps}
        color="danger"
        title={t("end_call")}
        onClick={onEndCall}
      />
    </div>
  );
};

export default CallActions;

const friends: MeetUser[] = [
  { id: "f1", name: "Sara", avatarUrl: "/avatars/sara.jpg" },
];
