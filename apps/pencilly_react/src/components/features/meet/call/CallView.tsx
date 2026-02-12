"use client";

import React, { useState, useCallback, useRef, type FC } from "react";

import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import type {CallParticipant, CallOwner, CallRoom, CallViewMode, GridSettings} from "./types";
import CallHeader from "./CallHeader";
import CallGrid from "./CallGrid";
import CallFooter from "./CallFooter";
import CallMinimized from "./CallMinimized";

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
}

const CallView: FC<CallViewProps> = ({
  participants,
  owner,
  room,
  startTime,
  isSidebarOpen = false,
  onOpenChat,
  onEndCall,
  onClose,
  onInviteUser,
  onSendEmailInvite,
  onRemoveParticipant,
  className,
}) => {
  const t = useTranslations("meet.call");

  const [viewMode, setViewMode] = useState<CallViewMode>("maximized");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [pinnedUserId, setPinnedUserId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, string | null>>({});
  const [gridSettings, setGridSettings] = useState<GridSettings>({
    layout: "auto",
    maxTiles: 9,
  });


  // Reaction timeout refs
  const reactionTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const participantsWithState: CallParticipant[] = participants.map((p) => ({
    ...p,
    isPinned: p.id === pinnedUserId,
    isCameraOff: p.isLocal ? isCameraMuted : p.isCameraOff,
    isMuted: p.isLocal ? isMicMuted : p.isMuted,
    reaction: reactions[p.id] ?? null,
  }));

  const handlePin = useCallback(
    (id: string) => {
      setPinnedUserId((prev) => (prev === id ? null : id));
    },
    [],
  );

  const handleReaction = useCallback(
    (emoji: string) => {
      // Show reaction on the current user's tile
      setReactions((prev) => ({ ...prev, [owner.id]: emoji }));

      // Clear previous timeout if exists
      if (reactionTimeouts.current[owner.id]) {
        clearTimeout(reactionTimeouts.current[owner.id]);
      }

      // Auto-clear reaction after 3 seconds
      reactionTimeouts.current[owner.id] = setTimeout(() => {
        setReactions((prev) => ({ ...prev, [owner.id]: null }));
      }, 3000);
    },
    [owner.id],
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
      participantsWithState.find((p) => p.isSpeaking && !p.isLocal) ??
      participantsWithState.find((p) => !p.isLocal) ??
      participantsWithState[0];

    return (
      <CallMinimized
        participant={speakingUser}
        isMicMuted={isMicMuted}
        isCameraMuted={isCameraMuted}
        onToggleMic={() => setIsMicMuted((v) => !v)}
        onToggleCamera={() => setIsCameraMuted((v) => !v)}
        onMaximize={handleMaximize}
        onClose={handleClose}
      />
    );
  }

  // Maximized view - full page overlay
  return (
    <div
      className={cn(
        "absolute inset-0 z-60 flex bg-background-lighter",
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
          onClose={handleClose}
          onMinimize={handleMinimize}
          className="relative"
        />

        {/* Video Grid */}
        <div className="flex-1 min-h-0 px-4 pb-2">
          <CallGrid
            participants={participantsWithState}
            onPin={handlePin}
            onRemove={onRemoveParticipant}
            className="h-full"
            layout={gridSettings.layout}
            maxTiles={gridSettings.maxTiles}
          />
        </div>

        {/* Footer */}
        <CallFooter
          owner={owner}
          room={room}
          startTime={startTime}
          isMicMuted={isMicMuted}
          isVolumeMuted={isVolumeMuted}
          isCameraMuted={isCameraMuted}
          isScreenSharing={isScreenSharing}
          onToggleMic={() => setIsMicMuted((v) => !v)}
          onToggleVolume={() => setIsVolumeMuted((v) => !v)}
          onToggleCamera={() => setIsCameraMuted((v) => !v)}
          onToggleScreenShare={() => setIsScreenSharing((v) => !v)}
          gridSettings={gridSettings}
          onGridSettingsChange={setGridSettings}
          onReaction={handleReaction}
          onChat={() => onOpenChat?.()}
          onEndCall={() => {
            onEndCall?.();
            onClose?.();
          }}
        />
      </div>
    </div>
  );
};

export default CallView;
