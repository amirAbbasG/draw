import ScreenTrack from "@/components/features/call/ScreenTrack";
import type { LocalTrack, RemoteTrack } from "@/components/features/call/types";
import { VideoTile } from "@/components/features/call/VideoTile";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

interface VideoGridProps {
  localTracks: LocalTrack[];
  remoteTracks: RemoteTrack[];
  isLocalVideoStopped?: boolean;
  localName?: string;
  localProfileImage?: string;
  micMuted?: boolean;
  className?: string;
}

export function VideoGrid({
  localTracks,
  remoteTracks,
  localName,
  micMuted,
  className,
  localProfileImage,
    isLocalVideoStopped
}: VideoGridProps) {
  const t = useTranslations("call");


  const localVideoTrack = localTracks.find(t => t.kind === "video");
  const localScreenTrack = localTracks.find(
    t => t.kind === "video" && t.source === "screen",
  );

  const remoteVideoTracks = remoteTracks.filter(t => t.kind === "video");
  const remoteScreenTracks = remoteTracks.filter(
    t => t.kind === "video" && t.source === "screen",
  );

  const hasScreenShare = remoteScreenTracks.length > 0 || !!localScreenTrack;

  const totalVideos = (localVideoTrack ? 1 : 0) + remoteVideoTracks.length;

  const gridCols =
    totalVideos <= 1
      ? "grid-cols-1"
      : totalVideos <= 2
        ? "grid-cols-1 md:grid-cols-2"
        : totalVideos <= 4
          ? "grid-cols-2"
          : "grid-cols-2 md:grid-cols-3";

  return (
    <div className={cn("grid gap-2", gridCols, className)}>
      {hasScreenShare && (
        <ScreenTrack
          localScreenTrack={localScreenTrack}
          remoteScreenTracks={remoteScreenTracks}
          localName={localName}
        />
      )}
      {/* Local video */}
      {localVideoTrack && (
        <VideoTile
          track={localVideoTrack.track}
          name={localName || t("you")}
          isLocal
          isMuted={micMuted}
          profileImage={localProfileImage}
            isStopped={isLocalVideoStopped}
        />
      )}

      {/* Remote videos */}
      {remoteVideoTracks
        .filter(t => t.source !== "screen")
        .map(track => (
          <VideoTile
            key={track.sid}
            track={track.track}
            name={track.participantName || track.participantIdentity}
            profileImage={track.participantProfileImage}
            isStopped={track.isMuted}
          />
        ))}

      {/* Placeholder when no videos */}
      {totalVideos === 0 && (
        <VideoTile
          name={localName || t("you")}
          isLocal
          isMuted={micMuted}
          profileImage={localProfileImage}
        />
      )}
    </div>
  );
}
