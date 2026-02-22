import React, { type FC } from "react";

import { useMediaQuery } from "usehooks-ts";

import AddUserPopup from "@/components/features/meet/AddUserPopup";
import LayoutSelector from "@/components/features/meet/call/LayoutSelector";
import { GridSettings } from "@/components/features/meet/call/types";
import { Conversation, MeetUser } from "@/components/features/meet/types";
import EmojiPicker from "@/components/shared/EmojiPicker";
import RenderIf from "@/components/shared/RenderIf";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

const classes = {
  default: "border-primary text-primary",
  danger: "border-danger text-danger",
  success: "border-success text-success",
} as const;

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
  toggleRaiseHand: () => void;
  onChat: () => void;
  onEndCall: () => void;
  className?: string;
  gridSettings: GridSettings;
  onGridSettingsChange: (settings: GridSettings) => void;
  isOpenSidebar?: boolean;
  isRaisedHand?: boolean;
  onInvite: (user: MeetUser, includeChat?: number) => void;
  conversation: Conversation;
}

const Divider = () => (
  <div className="h-6 sm:h-8 md:h-10 w-[1px] bg-background" />
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
  isOpenSidebar,
  onEndCall,
  className,
  gridSettings,
  onGridSettingsChange,
  isRaisedHand,
  toggleRaiseHand,
  onInvite,
  conversation,
}) => {
  const t = useTranslations("meet.call");
  const isSm = useMediaQuery("(max-width: 640px)"); // sm breakpoint
  const isXl = useMediaQuery("(max-width: 1280px)"); // xl breakpoint
  const isMobile = useMediaQuery("(max-width: 420px)"); // xs breakpoint

  const isCompact = isOpenSidebar ? isXl : isSm;

  const { role, stream_state } = conversation;
  const isOwner = role === "owner";
  const canShareScreen = isOwner || stream_state === "open";
  const showScreenShare = stream_state !== "closed";

  const getCommonProps = (
    selected?: boolean,
    color: "default" | "danger" | "success" = "default",
    extraClass?: string,
  ) => {
    return {
      size: isMobile
        ? ("sm" as const)
        : isCompact
          ? ("default" as const)
          : ("xl" as const),
      variant: "fill" as const,
      color: "background" as const,
      className: cn(
        "border transition-colors duration-200 disabled:border-background-darker disabled:!text-foreground-light",
        selected ? classes[color] : "border-transparent",
        extraClass,
      ),
    };
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
        {...getCommonProps(isMicMuted, "danger")}
        title={isMicMuted ? t("unmute_mic") : t("mute_mic")}
        onClick={onToggleMic}
      />

      {/* Volume */}
      <AppIconButton
        icon={isVolumeMuted ? "hugeicons:volume-off" : sharedIcons.speak}
        {...getCommonProps(isVolumeMuted, "danger")}
        title={isVolumeMuted ? t("unmute_volume") : t("mute_volume")}
        onClick={onToggleVolume}
      />

      {/* Camera */}
      <AppIconButton
        icon={isCameraMuted ? sharedIcons.video_off : sharedIcons.video}
        {...getCommonProps(isCameraMuted, "danger")}
        title={isCameraMuted ? t("turn_on_camera") : t("turn_off_camera")}
        onClick={onToggleCamera}
      />

      {/* Screen Share */}
      <RenderIf isTrue={showScreenShare}>
        <AppIconButton
          icon={
            isScreenSharing
              ? sharedIcons.screen_share_off
              : sharedIcons.screen_share
          }
          {...getCommonProps(isScreenSharing, "success")}
          title={isScreenSharing ? t("stop_sharing") : t("share_screen")}
          onClick={onToggleScreenShare}
          disabled={!canShareScreen}
        />
      </RenderIf>

      <Divider />

      {/* Reactions (hidden on small screens) */}
      {/*{!isCompact && (*/}
      <EmojiPicker
        onChange={onReaction}
        reactionsDefaultOpen
        closeOnEmojiSelect
        Trigger={
          <AppIconButton
            icon="hugeicons:smile"
            {...getCommonProps()}
            title={t("reactions")}
            element="div"
          />
        }
      />

      <AppIconButton
        icon="ion:hand-left-outline"
        {...getCommonProps(isRaisedHand, "success")}
        title={t(isRaisedHand ? "lower_hand" : "raise_hand")}
        onClick={toggleRaiseHand}
        iconClassName={cn(" [&_path]:stroke-[25]")}
      />
      {/*)}*/}

      {/* Chat */}
      <AppIconButton
        icon={sharedIcons.chat}
        {...getCommonProps()}
        title={t("chat")}
        onClick={onChat}
      />

      {/* Grid (hidden on small screens) */}
      {!isCompact && (
        <LayoutSelector
          settings={gridSettings}
          onChange={onGridSettingsChange}
        />
      )}

      <AddUserPopup onInvite={onInvite} triggerProps={getCommonProps()} />

      <Divider />

      {/* End Call */}
      <AppIconButton
        icon={sharedIcons.call_end}
        {...getCommonProps()}
        color="danger"
        title={t("leave")}
        onClick={onEndCall}
      />
    </div>
  );
};

export default CallActions;
