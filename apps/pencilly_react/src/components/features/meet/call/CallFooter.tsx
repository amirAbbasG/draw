import React, { useEffect, useState, type FC } from "react";

import type { Conversation, MeetUser } from "@/components/features/meet/types";
import { formatElapsed } from "@/components/features/meet/utils";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import RenderIf from "@/components/shared/RenderIf";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { useCopyTextInClipBoard } from "@/hooks/useCopyTextInClipBoard";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import CallActions from "./CallActions";
import type { CallParticipant, CallRoom, GridSettings } from "./types";

interface CallFooterProps {
  conversation: Conversation;
  currentUser: CallParticipant;
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
  toggleRaiseHand: () => void;
  onChat: () => void;
  onEndCall: () => void;
  className?: string;
  onGridSettingsChange: (settings: GridSettings) => void;
  isOpenSidebar?: boolean;
  onInvite: (user: MeetUser, includeChat?: number) => void;
}

const CallFooter: FC<CallFooterProps> = ({
  currentUser,
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
  toggleRaiseHand,
  onChat,
  onEndCall,
  className,
  gridSettings,
  onGridSettingsChange,
  isOpenSidebar,
  onInvite,
  conversation,
}) => {
  const t = useTranslations("meet.call");
  const [elapsed, setElapsed] = useState(0);
  const [handleCopy, isCopied] = useCopyTextInClipBoard();

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div
      className={cn(
        "flex flex-col  items-center justify-center px-2 md:px-4 py-2 shrink-0 gap-2",
        isOpenSidebar
          ? "2xl:flex-row  2xl:justify-between"
          : "lg:flex-row  lg:justify-between",
        className,
      )}
    >
      {/* Left: Owner info + elapsed (hidden on small screens) */}
      <div
        className={cn(
          "hidden  items-center gap-3 shrink-0 min-w-0",
          isOpenSidebar ? "2xl:flex" : "lg:flex",
        )}
      >
        <UserAvatar
          imageSrc={currentUser?.avatarUrl}
          name={currentUser?.name}
          className="size-14 shrink-0"
        />
        <div className="col gap-1.5 min-w-0">
          <AppTypo variant="headingS" className="font-semibold truncate">
            {currentUser?.name}
          </AppTypo>
          <AppTypo variant="small" color="secondary">
            {formatElapsed(elapsed)}
          </AppTypo>
        </div>
      </div>

      <CallActions
        conversation={conversation}
        onInvite={onInvite}
        isMicMuted={isMicMuted}
        isVolumeMuted={isVolumeMuted}
        isCameraMuted={isCameraMuted}
        isScreenSharing={isScreenSharing}
        onToggleMic={onToggleMic}
        onToggleVolume={onToggleVolume}
        onToggleCamera={onToggleCamera}
        onToggleScreenShare={onToggleScreenShare}
        onReaction={onReaction}
        toggleRaiseHand={toggleRaiseHand}
        isRaisedHand={currentUser?.raisedHand}
        onChat={onChat}
        onGridSettingsChange={onGridSettingsChange}
        gridSettings={gridSettings}
        onEndCall={onEndCall}
        isOpenSidebar={isOpenSidebar}
      />

      {/* Right: Room link (hidden on small screens) */}
      <RenderIf isTrue={!!room.link}>
        <div
          className={cn(
            "col gap-2 shrink-0 min-w-0 max-w-full",
            isOpenSidebar
              ? "2xl:items-end  2xl::max-w-48"
              : "lg:items-end  lg:max-w-48",
          )}
        >
          <AppTypo
            variant="headingS"
            className={cn(
              "font-semibold hidden",
              isOpenSidebar ? "2xl:block" : "lg:block",
            )}
          >
            {t("room_link")}
          </AppTypo>
          <button
            type="button"
            className="flex items-center gap-1 hover:opacity-80 transition-opacity max-w-full relative"
            onClick={() => handleCopy(room.link)}
            title={t("copy_link")}
          >
            <div
              className={cn(
                "bg-primary text-primary-foreground text-sm px-4 py-2 absolute -top-9 start-1/2 -translate-x-1/2 rounded text-nowrap",
                isCopied ? "block" : "hidden",
              )}
            >
              {t("link_copied")}
            </div>
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
      </RenderIf>
    </div>
  );
};

export default CallFooter;
