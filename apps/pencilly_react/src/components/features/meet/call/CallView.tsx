import React, { useCallback, useState, type FC } from "react";

import { useMediaQuery } from "usehooks-ts";

import ConnectPending from "@/components/features/meet/call/ConnectPending";
import PendingParticipantTile from "@/components/features/meet/call/PendingParticipantTile";
import type { useConversationWs } from "@/components/features/meet/hooks";
import { MeetUser } from "@/components/features/meet/types";
import RenderIf from "@/components/shared/RenderIf";
import { Show } from "@/components/shared/Show";
import { cn } from "@/lib/utils";

import CallFooter from "./CallFooter";
import CallGrid from "./CallGrid";
import CallHeader from "./CallHeader";
import CallMinimized from "./CallMinimized";
import type {
  CallParticipant,
  CallRoom,
  CallViewMode,
  GridSettings,
} from "./types";

interface CallViewProps {
  /** Current participants in the call */
  participants: CallParticipant[];
  /** Room info */
  room: CallRoom;
  /** When the call started (Date.now() value) */
  startTime: number;
  /** Whether the sidebar is open (adjusts layout) */
  isSidebarOpen?: boolean;
  /** Dynamic title (e.g., "Conversation Title - Meet") */
  title?: string;
  /** Real mic muted state from LiveKit */
  isMicMuted?: boolean;
  /** Real camera muted state from LiveKit */
  isCameraMuted?: boolean;
  /** Real screen sharing state from LiveKit */
  isScreenSharing?: boolean;
  isVolumeMuted?: boolean;
  onToggleVolume?: () => void;
  /** Toggle mic via LiveKit */
  onToggleMic?: () => void;
  /** Toggle camera via LiveKit */
  onToggleCamera?: () => void;
  /** Start/stop screen share via LiveKit */
  onToggleScreenShare?: () => void;
  /** Send a reaction (emoji/raise hand) */
  onReaction: ReturnType<typeof useConversationWs>["sendReaction"];
  /** Callback to toggle meet sidebar chat */
  onOpenChat?: () => void;
  /** Callback when call ends */
  onEndCall?: () => void;
  /** Callback when call is closed (X button) */
  onClose?: () => void;
  /** Callback to invite a user */
  onInviteUser: (user: MeetUser) => void;
  /** Callback to remove a participant */
  onRemoveParticipant?: (id: string) => void;
  className?: string;
  isOpenSidebar?: boolean;
  activeConversationId: string;
  pendingParticipants?: Array<MeetUser & { addedAt: number }>;
  isConnecting?: boolean;
}

const CallView: FC<CallViewProps> = ({
  participants,
  room,
  startTime,
  isSidebarOpen = false,
  title,
  isMicMuted: isMicMutedProp = false,
  isCameraMuted: isCameraMutedProp = false,
  isScreenSharing: isScreenSharingProp = false,
  onToggleMic: onToggleMicProp,
  onToggleCamera: onToggleCameraProp,
  onToggleScreenShare: onToggleScreenShareProp,
  onReaction: onReactionProp,
  activeConversationId,
  onOpenChat,
  onEndCall,
  onClose,
  onRemoveParticipant,
  className,
  isOpenSidebar,
  isConnecting,
  pendingParticipants,
  isVolumeMuted,
  onToggleVolume,
    onInviteUser,
}) => {
  const isSmallScreen = useMediaQuery("(max-width: 640px)"); // sm breakpoint
  const [viewMode, setViewMode] = useState<CallViewMode>("maximized");
  const [pinnedUserId, setPinnedUserId] = useState<string | null>(null);
  const [gridSettings, setGridSettings] = useState<GridSettings>({
    layout: "auto",
    maxTiles: 9,
  });

  // Force "auto" layout on small screens (< 640px)
  const effectiveGridSettings: GridSettings = isSmallScreen
    ? { ...gridSettings, layout: "auto" }
    : gridSettings;

  const participantsWithState: CallParticipant[] = participants.map(p => ({
    ...p,
    isPinned: p.id === pinnedUserId,
    isCameraOff: p.isLocal ? isCameraMutedProp : p.isCameraOff,
    isMuted: p.isLocal ? isMicMutedProp : p.isMuted,
  }));

  const handlePin = useCallback((id: string) => {
    setPinnedUserId(prev => (prev === id ? null : id));
  }, []);

  const handleMinimize = useCallback(() => {
    setViewMode("minimized");
  }, []);

  const handleMaximize = useCallback(() => {
    setViewMode("maximized");
  }, []);

  const handleClose = useCallback(() => {
    onEndCall?.();
    onClose?.();
  }, [onEndCall, onClose]);

  const owner = participants.find(p => p.isLocal);

  // Minimized view
  if (viewMode === "minimized") {
    // Find the speaking participant, or fallback to the first remote user
    const speakingUser =
      participantsWithState.find(p => p.isLocal && p.isScreenSharing) ??
      participantsWithState.find(p => p.isSpeaking && !p.isLocal) ??
      participantsWithState.find(p => !p.isLocal) ??
      participantsWithState[0];

    return (
      <CallMinimized
        participant={speakingUser}
        isMicMuted={isMicMutedProp}
        isCameraMuted={isCameraMutedProp}
        onToggleMic={() => onToggleMicProp?.()}
        onToggleCamera={() => onToggleCameraProp?.()}
        onMaximize={handleMaximize}
        onClose={handleClose}
      />
    );
  }

  // Maximized view - full page overlay
  return (
    <div
      className={cn(
        "absolute inset-0 z-[100] flex bg-background-lighter",
        className,
      )}
    >
      {/* Main call area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 relative",
          isSidebarOpen && "me-0",
        )}
      >
        {/* Header */}
        <CallHeader
          title={title}
          onClose={handleClose}
          onMinimize={handleMinimize}
          className="relative"
        />

        <RenderIf isTrue={!!pendingParticipants?.length}>
          <div className="absolute bottom-28 p-2 right-6 z-[101] col gap-2">
            {pendingParticipants?.map(p => (
              <PendingParticipantTile
                key={p.id}
                participant={p}
                className="w-40 sm:w-48"
              />
            ))}
          </div>
        </RenderIf>

        <Show>
          <Show.When isTrue={isConnecting}>
            <ConnectPending />
          </Show.When>
          <Show.Else>
            <div className="flex-1 min-h-0 px-2 sm:px-4 pb-2">
              <CallGrid
                participants={participantsWithState}
                onPin={handlePin}
                onRemove={onRemoveParticipant}
                className="h-full"
                layout={effectiveGridSettings.layout}
                maxTiles={effectiveGridSettings.maxTiles}
                isLocalScreenSharing={isScreenSharingProp}
              />
            </div>
          </Show.Else>
        </Show>
        {/* Video Grid */}

        {/* Footer */}
        <CallFooter
            onInvite={onInviteUser}
          owner={owner}
          room={room}
          startTime={startTime}
          isMicMuted={isMicMutedProp}
          isVolumeMuted={isVolumeMuted}
          isCameraMuted={isCameraMutedProp}
          isScreenSharing={isScreenSharingProp}
          onToggleMic={() => onToggleMicProp?.()}
          onToggleVolume={onToggleVolume}
          onToggleCamera={() => onToggleCameraProp?.()}
          onToggleScreenShare={() => {
            onToggleScreenShareProp?.();
            if (!isScreenSharingProp) {
              setViewMode("minimized");
            }
          }}
          gridSettings={gridSettings}
          onGridSettingsChange={setGridSettings}
          onReaction={emoji => {
            if (!activeConversationId) return;
            onReactionProp(activeConversationId, owner.id, "emoji", emoji);
          }}
          toggleRaiseHand={() => {
            if (!activeConversationId) return;
            onReactionProp(
              activeConversationId,
              owner.id,
              owner.raisedHand ? "lower_hand" : "raise_hand",
            );
          }}
          onChat={() => onOpenChat?.()}
          onEndCall={() => {
            onEndCall?.();
            onClose?.();
          }}
          isOpenSidebar={isOpenSidebar}
        />
      </div>
    </div>
  );
};

export default CallView;
