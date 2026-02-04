import AppIconButton from "@/components/ui/custom/app-icon-button";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface CallControlsProps {
  micMuted: boolean;
  cameraMuted: boolean;
  isScreenSharing: boolean;
  isConnected: boolean;
  isAnyoneSharing?: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onLeave: () => void;
  className?: string;
}

export function CallControls({
  micMuted,
  cameraMuted,
  isScreenSharing,
  isConnected,
  isAnyoneSharing = false,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onLeave,
  className,
}: CallControlsProps) {
  const t = useTranslations("call");
  const screenShareDisabled =
    !isConnected || (isAnyoneSharing && !isScreenSharing);


  return (
    <div className={cn("centered-row gap-2 rounded bg-muted p-2", className)}>
      {/* Mic toggle */}
      <AppIconButton
        title={micMuted ? t("unmute") : t("mute")}
        icon={micMuted ? sharedIcons.mic_off : sharedIcons.mic}
        color={micMuted ? "danger" : "default"}
        onClick={onToggleMic}
        disabled={!isConnected}
      />
      {/* Camera toggle */}
      <AppIconButton
        title={cameraMuted ? t("turn_on_camera") : t("turn_off_camera")}
        icon={cameraMuted ? sharedIcons.video_off : sharedIcons.video}
        color={cameraMuted ? "danger" : "default"}
        onClick={onToggleCamera}
        disabled={!isConnected}
      />

      <AppIconButton
        title={
          isAnyoneSharing && !isScreenSharing
            ? t("status.someone_sharing")
            : isScreenSharing
              ? t("stop_sharing")
              : t("share_screen")
        }
        icon={
          isScreenSharing
            ? sharedIcons.screen_share_off
            : sharedIcons.screen_share
        }
        className={cn(
          screenShareDisabled &&
            !isScreenSharing &&
            "opacity-50 cursor-not-allowed",
        )}
        color={isScreenSharing ? "success" : "default"}
        onClick={onToggleScreenShare}
        disabled={!isConnected}
      />

      <AppIconButton
        title={t("leave_call")}
        icon={sharedIcons.call_end}
        color="danger"
        onClick={onLeave}
        disabled={!isConnected}
      />
    </div>
  );
}
