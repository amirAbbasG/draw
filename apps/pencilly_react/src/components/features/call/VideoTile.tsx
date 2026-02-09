import { useEffect, useRef } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface VideoTileProps {
  track?: MediaStreamTrack;
  name?: string;
  profileImage?: string;
  isLocal?: boolean;
  isMuted?: boolean;
  className?: string;
  isScreenShare?: boolean;
  showBadge?: boolean;
  isStopped?: boolean;
}

export function VideoTile({
  track,
  name,
  profileImage,
  isLocal = false,
  isMuted = false,
  showBadge = true,
  isScreenShare,
  isStopped = false,
  className,
}: VideoTileProps) {
  const t = useTranslations("call");
  const videoRef = useRef<HTMLVideoElement>(null);


  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !track) return;

    videoElement.srcObject = new MediaStream([track]);

    // Ensure video playback starts
    videoElement.play().catch(err => console.error("Play error:", err));

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [track, isLocal]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded bg-muted",
        isScreenShare ? "aspect-video" : "aspect-video",
        className,
      )}
    >
      {track && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn(
            "h-full w-full",
            isScreenShare ? "object-contain bg-black" : "object-cover",
            !!isStopped && "hidden",
          )}
        />
      )}

      {!!isStopped && (
        <div className="centered-col center-position h-[45%] -mt-1 aspect-square max-w-12 max-h-12 min-w-8 min-h-8 rounded-full bg-primary/20">
          {profileImage ? (
            <UserAvatar
              imageSrc={profileImage}
              name={name || "Participant"}
              className="size-full"
            />
          ) : (
            <AppIcon icon={sharedIcons.user} className="h-6 w-6 text-primary" />
          )}
        </div>
      )}

      {/* Name badge */}
      {showBadge && (
        <div
          className={cn(
            "absolute bottom-1.5 start-1.5 row gap-1 px-1.5 py-0.5 max-w-[90%]",
            !isStopped ? " rounded-md bg-background/80  backdrop-blur-sm" : "",
          )}
        >
          {isScreenShare && (
            <AppIcon
              icon={sharedIcons.screen_share}
              className="size-3.5 text-primary max-w-full "
            />
          )}
          {!isScreenShare && isMuted && (
            <AppIcon
              icon={sharedIcons.mic_off}
              className="size-3 text-danger [&_g]:stroke-[1] [&_path]:stroke-[1]"
            />
          )}
          <AppTypo variant="xs" className="first-letter:capitalize truncate max-w-full ">
            {isScreenShare ? t("status.screen_share") : name || t("unknown")}
          </AppTypo>
        </div>
      )}

      {isLocal && (
        <AppTypo
          variant="xs"
          className="text-primary-foreground absolute end-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5"
        >
          {t("you")}
        </AppTypo>
      )}
    </div>
  );
}
