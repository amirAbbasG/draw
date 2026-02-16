import React, { useCallback, useRef, useState, type FC } from "react";

import { useMediaQuery } from "usehooks-ts";

import { cn } from "@/lib/utils";

import CallFooter from "./CallFooter";
import CallGrid from "./CallGrid";
import CallHeader from "./CallHeader";
import CallMinimized from "./CallMinimized";
import type {
  CallOwner,
  CallParticipant,
  CallRoom,
  CallViewMode,
  GridSettings,
} from "./types";

interface CallViewProps {
  /** Current participants in the call */
  participants: CallParticipant[];
  /** The call owner / current user */
  owner: CallOwner;
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
  /** Toggle mic via LiveKit */
  onToggleMic?: () => void;
  /** Toggle camera via LiveKit */
  onToggleCamera?: () => void;
  /** Start/stop screen share via LiveKit */
  onToggleScreenShare?: () => void;
  /** Send a reaction (emoji/raise hand) */
  onReaction?: (emoji: string) => void;
  /** Callback to toggle meet sidebar chat */
  onOpenChat?: () => void;
  /** Callback when call ends */
  onEndCall?: () => void;
  /** Callback when call is closed (X button) */
  onClose?: () => void;
  /** Callback to invite a user */
  onInviteUser?: (userId: string) => void;
  /** Callback to send email invite */
  onSendEmailInvite?: (email: string) => void;
  /** Callback to remove a participant */
  onRemoveParticipant?: (id: string) => void;
  className?: string;
  isOpenSidebar?: boolean;
}

const CallView: FC<CallViewProps> = ({
  participants,
  owner,
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
  onOpenChat,
  onEndCall,
  onClose,
  onRemoveParticipant,
  className,
    isOpenSidebar
}) => {
  const isSmallScreen = useMediaQuery("(max-width: 640px)"); // sm breakpoint

  const [viewMode, setViewMode] = useState<CallViewMode>("maximized");
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);
  const [pinnedUserId, setPinnedUserId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, string | null>>({});
  const [gridSettings, setGridSettings] = useState<GridSettings>({
    layout: "auto",
    maxTiles: 9,
  });

  // Force "auto" layout on small screens (< 640px)
  const effectiveGridSettings: GridSettings = isSmallScreen
    ? { ...gridSettings, layout: "auto" }
    : gridSettings;

  // Reaction timeout refs
  const reactionTimeouts = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  const participantsWithState: CallParticipant[] = participants.map(p => ({
    ...p,
    isPinned: p.id === pinnedUserId,
    isCameraOff: p.isLocal ? isCameraMutedProp : p.isCameraOff,
    isMuted: p.isLocal ? isMicMutedProp : p.isMuted,
    reaction: reactions[p.id] ?? null,
  }));

  const handlePin = useCallback((id: string) => {
    setPinnedUserId(prev => (prev === id ? null : id));
  }, []);

  const handleReaction = useCallback(
    (emoji: string) => {
      // Show reaction on the current user's tile
      setReactions(prev => ({ ...prev, [owner.id]: emoji }));

      // Clear previous timeout if exists
      if (reactionTimeouts.current[owner.id]) {
        clearTimeout(reactionTimeouts.current[owner.id]);
      }

      // Auto-clear reaction after 3 seconds (not raise hand)
      reactionTimeouts.current[owner.id] = setTimeout(() => {
        setReactions(prev => ({ ...prev, [owner.id]: null }));
      }, 3000);

      // Send reaction to other participants via WS
      onReactionProp?.(emoji);
    },
    [owner.id, onReactionProp],
  );

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

  // Minimized view
  if (viewMode === "minimized") {
    // Find the speaking participant, or fallback to the first remote user
    const speakingUser =
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

        {/* Video Grid */}
        <div className="flex-1 min-h-0 px-2 sm:px-4 pb-2">
          <CallGrid
            participants={participantsWithState}
            onPin={handlePin}
            onRemove={onRemoveParticipant}
            className="h-full"
            layout={effectiveGridSettings.layout}
            maxTiles={effectiveGridSettings.maxTiles}
          />
        </div>

        {/* Footer */}
        <CallFooter
          owner={owner}
          room={room}
          startTime={startTime}
          isMicMuted={isMicMutedProp}
          isVolumeMuted={isVolumeMuted}
          isCameraMuted={isCameraMutedProp}
          isScreenSharing={isScreenSharingProp}
          onToggleMic={() => onToggleMicProp?.()}
          onToggleVolume={() => setIsVolumeMuted(v => !v)}
          onToggleCamera={() => onToggleCameraProp?.()}
          onToggleScreenShare={() => onToggleScreenShareProp?.()}
          gridSettings={gridSettings}
          onGridSettingsChange={setGridSettings}
          onReaction={handleReaction}
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
