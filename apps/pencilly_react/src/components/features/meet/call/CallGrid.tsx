import React, { useEffect, useMemo, useRef, type FC } from "react";

import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

import CallParticipantTile from "./CallParticipantTile";
import type { CallParticipant, GridLayout } from "./types";

interface CallGridProps {
  participants: CallParticipant[];
  /** Current grid layout mode */
  layout?: GridLayout;
  /** Max tiles to display (from slider) */
  maxTiles?: number;
  onPin?: (id: string) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

const CallGrid: FC<CallGridProps> = ({
  participants,
  layout = "auto",
  maxTiles = 9,
  onPin,
  onRemove,
  className,
}) => {
  const t = useTranslations("meet.call");

  // Find pinned participant or screen sharer
  const pinnedUser = useMemo(
    () => participants.find(p => p.isPinned),
    [participants],
  );

  const screenSharer = useMemo(
    () => participants.find(p => p.isScreenSharing && p.screenTrack),
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

  // Limit visible participants based on maxTiles (except spotlight which shows 1)
  const visibleParticipants =
    layout === "spotlight"
      ? participants.slice(0, 1)
      : participants.slice(0, maxTiles);

  // ----- Screen share layout: screen on top, users in bottom row -----
  if (screenSharer?.screenTrack) {
    return (
      <div className={cn("col gap-2 sm:gap-4 h-full", className)}>
        <div className="flex-1 min-h-0 rounded-lg overflow-hidden bg-foreground/5 relative">
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-contain"
          />
          <div className="absolute bottom-2 start-2 flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm">
            <AppTypo variant="xs">
              {screenSharer.isLocal ? t("me") : screenSharer.name} -{" "}
              {t("screen_share")}
            </AppTypo>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-1 shrink-0 p-0.5">
          {visibleParticipants.map(p => (
            <CallParticipantTile
              key={p.id}
              participant={p}
              onPin={onPin}
              onRemove={onRemove}
              compact
              className="w-28 sm:w-48 shrink-0 aspect-video"
            />
          ))}
        </div>
      </div>
    );
  }

  // ----- Spotlight: one featured user, full area -----
  if (layout === "spotlight") {
    const featured = pinnedUser ?? visibleParticipants[0];
    if (!featured) return null;
    return (
      <div className={cn("h-full", className)}>
        <CallParticipantTile
          participant={featured}
          onPin={onPin}
          onRemove={onRemove}
          className="h-full w-full"
        />
      </div>
    );
  }

  // ----- Sidebar: first user large on left, others stacked on right -----
  // On small screens, switch to vertical layout (featured on top, others in a bottom row)
  if (layout === "sidebar") {
    const featured = pinnedUser ?? visibleParticipants[0];
    const others = visibleParticipants.filter(p => p.id !== featured?.id);
    if (!featured) return null;

    return (
      <div
        className={cn(
          "flex flex-col sm:flex-row gap-2 sm:gap-4 h-full",
          className,
        )}
      >
        {/* Main / large area */}
        <div className="flex-1 min-w-0 min-h-0">
          <CallParticipantTile
            participant={featured}
            onPin={onPin}
            onRemove={onRemove}
            className="h-full w-full"
          />
        </div>
        {/* Sidebar strip - horizontal scroll on small, vertical on sm+ */}
        {others.length > 0 && (
          <div className="flex sm:flex-col gap-2 sm:gap-4 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden shrink-0 sm:w-44 p-0.5">
            {others.map(p => (
              <CallParticipantTile
                key={p.id}
                participant={p}
                onPin={onPin}
                onRemove={onRemove}
                compact
                className="w-28 sm:w-full shrink-0 aspect-video"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ----- Pinned layout (any mode): pinned user large on top, others bottom row -----
  if (pinnedUser && layout !== "tiled") {
    const others = visibleParticipants.filter(p => p.id !== pinnedUser.id);
    return (
      <div className={cn("col gap-2 sm:gap-4 h-full", className)}>
        <div className="flex-1 min-h-0">
          <CallParticipantTile
            participant={pinnedUser}
            onPin={onPin}
            onRemove={onRemove}
            className="h-full w-full"
          />
        </div>
        {others.length > 0 && (
          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-1 shrink-0 p-0.5">
            {others.map(p => (
              <CallParticipantTile
                key={p.id}
                participant={p}
                onPin={onPin}
                onRemove={onRemove}
                compact
                className="w-28 sm:w-48 shrink-0 aspect-video"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ----- Tiled: equal-sized grid -----
  // ----- Auto: smart grid based on count -----
  const count = visibleParticipants.length;

  // Auto mode: use the 2-top + 3-bottom split for 5 users (only on sm+)
  if (layout === "auto" && count === 5) {
    const topRow = visibleParticipants.slice(0, 2);
    const bottomRow = visibleParticipants.slice(2, 5);
    return (
      <div className={cn("flex flex-col gap-2 sm:gap-4 h-full", className)}>
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-2 sm:gap-4">
          {topRow.map(p => (
            <CallParticipantTile
              key={p.id}
              participant={p}
              onPin={onPin}
              onRemove={onRemove}
              className="h-full"
            />
          ))}
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          {bottomRow.map(p => (
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

  // Compute grid columns
  const gridCols =
    layout === "tiled"
      ? // Tiled: always uniform squares, columns scale with count
        count <= 1
        ? "grid-cols-1"
        : count <= 4
          ? "grid-cols-1 sm:grid-cols-2"
          : count <= 9
            ? "grid-cols-2 sm:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      : // Auto: responsive columns
        count <= 1
        ? "grid-cols-1"
        : count <= 2
          ? "grid-cols-1 sm:grid-cols-2"
          : count <= 4
            ? "grid-cols-1 sm:grid-cols-2"
            : count <= 6
              ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3"
              : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div
      className={cn(
        "grid gap-2 sm:gap-4 h-full auto-rows-fr",
        gridCols,
        className,
      )}
    >
      {visibleParticipants.map(p => (
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
