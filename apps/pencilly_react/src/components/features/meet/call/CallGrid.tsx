"use client";

import React, { useMemo, useEffect, useRef, type FC } from "react";

import { cn } from "@/lib/utils";
import AppTypo from "@/components/ui/custom/app-typo";
import { useTranslations } from "@/i18n";

import type { CallParticipant } from "./types";
import CallParticipantTile from "./CallParticipantTile";

interface CallGridProps {
  participants: CallParticipant[];
  onPin?: (id: string) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

const CallGrid: FC<CallGridProps> = ({
  participants,
  onPin,
  onRemove,
  className,
}) => {
  const t = useTranslations("meet.call");

  // Find pinned participant or screen sharer
  const pinnedUser = useMemo(
    () => participants.find((p) => p.isPinned),
    [participants],
  );

  const screenSharer = useMemo(
    () => participants.find((p) => p.isScreenSharing && p.screenTrack),
    [participants],
  );

  const screenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = screenVideoRef.current;
    if (!el || !screenSharer?.screenTrack) return;
    el.srcObject = new MediaStream([screenSharer.screenTrack]);
    el.play().catch(() => {});
    return () => {
      if (el) el.srcObject = null;
    };
  }, [screenSharer?.screenTrack]);

  // Screen share layout: screen on top, users in bottom row
  if (screenSharer?.screenTrack) {
    return (
      <div className={cn("flex flex-col gap-4 h-full", className)}>
        {/* Screen share area */}
        <div className="flex-1 min-h-0 rounded-lg overflow-hidden bg-foreground/5 relative">
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-contain"
          />
          <div className="absolute bottom-2 start-2 flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm">
            <AppTypo variant="xs">
              {screenSharer.isLocal ? t("me") : screenSharer.name} - {t("screen_share")}
            </AppTypo>
          </div>
        </div>

        {/* Participants row */}
        <div className="flex gap-4 overflow-x-auto pb-1 shrink-0">
          {participants.map((p) => (
            <CallParticipantTile
              key={p.id}
              participant={p}
              onPin={onPin}
              onRemove={onRemove}
              compact
              className="w-48 shrink-0 aspect-video"
            />
          ))}
        </div>
      </div>
    );
  }

  // Pinned layout: pinned user large on top, others in bottom row
  if (pinnedUser) {
    const others = participants.filter((p) => p.id !== pinnedUser.id);
    return (
      <div className={cn("flex flex-col gap-4 h-full", className)}>
        {/* Pinned user - large */}
        <div className="flex-1 min-h-0">
          <CallParticipantTile
            participant={pinnedUser}
            onPin={onPin}
            onRemove={onRemove}
            className="h-full w-full"
          />
        </div>

        {/* Others row */}
        {others.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-1 shrink-0">
            {others.map((p) => (
              <CallParticipantTile
                key={p.id}
                participant={p}
                onPin={onPin}
                onRemove={onRemove}
                compact
                className="w-48 shrink-0 aspect-video"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default grid layout
  const count = participants.length;
  const gridCols =
    count <= 1
      ? "grid-cols-1"
      : count <= 2
        ? "grid-cols-1 md:grid-cols-2"
        : count <= 4
          ? "grid-cols-2"
          : count <= 6
            ? "grid-cols-2 md:grid-cols-3"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  // Calculate row configuration for 5 users: 2 top + 3 bottom
  const isUnevenFive = count === 5;

  if (isUnevenFive) {
    const topRow = participants.slice(0, 2);
    const bottomRow = participants.slice(2, 5);
    return (
      <div className={cn("flex flex-col gap-4 h-full", className)}>
        {/* Top row: 2 larger tiles */}
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
          {topRow.map((p) => (
            <CallParticipantTile
              key={p.id}
              participant={p}
              onPin={onPin}
              onRemove={onRemove}
              className="h-full"
            />
          ))}
        </div>
        {/* Bottom row: 3 smaller tiles */}
        <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
          {bottomRow.map((p) => (
            <CallParticipantTile
              key={p.id}
              participant={p}
              onPin={onPin}
              onRemove={onRemove}
              compact
              className="h-full"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 h-full auto-rows-fr",
        gridCols,
        className,
      )}
    >
      {participants.map((p) => (
        <CallParticipantTile
          key={p.id}
          participant={p}
          onPin={onPin}
          onRemove={onRemove}
          className={count === 1 ? "h-full" : ""}
        />
      ))}
    </div>
  );
};

export default CallGrid;
