import React, { useCallback, useEffect, useRef, useState, type FC } from "react";

import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

/* ────────────── helpers ────────────── */

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ────────────── waveform ────────────── */

const AudioWaveform: FC<{
  progress: number; // 0-1
  isCurrentUser: boolean;
  barCount?: number;
  onSeek: (ratio: number) => void;
}> = ({ progress, isCurrentUser, barCount = 40, onSeek }) => {
  const barsRef = useRef<number[]>([]);

  if (barsRef.current.length === 0) {
    barsRef.current = Array.from({ length: barCount }, () =>
      Math.random() * 0.7 + 0.3,
    );
  }
  const bars = barsRef.current;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(1, ratio)));
  };

  return (
    <div
      className="flex items-center gap-[1px] h-6 flex-1 cursor-pointer min-w-[100px]"
      onClick={handleClick}
    >
      {bars.map((h, i) => {
        const filled = i / barCount <= progress;
        return (
          <div
            key={i}
            className={cn(
              "w-[2px] rounded-full transition-colors",
              isCurrentUser
                ? filled
                  ? "bg-primary-foreground"
                  : "bg-primary-foreground/30"
                : filled
                  ? "bg-primary"
                  : "bg-primary/30",
            )}
            style={{ height: `${h * 100}%` }}
          />
        );
      })}
    </div>
  );
};

/* ────────────── main component ────────────── */

interface AudioMessageBubbleProps {
  audioUrl: string;
  durationMs: number;
  fileSizeBytes: number;
  mimeType?: string;
  isCurrentUser: boolean;
  className?: string;
}

const AudioMessageBubble: FC<AudioMessageBubbleProps> = ({
  audioUrl,
  durationMs,
  fileSizeBytes,
  isCurrentUser,
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create / destroy audio element
  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "metadata";
    audio.src = audioUrl;
    audioRef.current = audio;

    audio.onloadedmetadata = () => setLoaded(true);
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime * 1000);
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSeek = useCallback(
    (ratio: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const seekSec = (durationMs / 1000) * ratio;
      audio.currentTime = seekSec;
      setCurrentTime(seekSec * 1000);
    },
    [durationMs],
  );

  const progress = durationMs > 0 ? currentTime / durationMs : 0;
  const timeDisplay = isPlaying || currentTime > 0
    ? `${formatDuration(currentTime)} / ${formatDuration(durationMs)}`
    : formatDuration(durationMs);

  return (
    <div className={cn("flex items-center gap-2.5 min-w-[200px]", className)}>
      {/* Play button */}
      <button
        type="button"
        className={cn(
          "flex items-center justify-center size-9 rounded-full shrink-0 cursor-pointer transition-colors",
          isCurrentUser
            ? "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
            : "bg-primary/15 hover:bg-primary/25 text-primary",
        )}
        onClick={togglePlay}
      >
        <AppIcon
          icon={isPlaying ? "hugeicons:pause" : "hugeicons:play"}
          fontSize={18}
        />
      </button>

      {/* Waveform + info */}
      <div className="col gap-1 flex-1 min-w-0">
        <AudioWaveform
          progress={progress}
          isCurrentUser={isCurrentUser}
          onSeek={handleSeek}
        />
        <div className="flex items-center gap-2">
          <AppTypo
            variant="xs"
            className={cn(
              "font-mono tabular-nums",
              isCurrentUser ? "text-primary-foreground/70" : "text-foreground-light",
            )}
          >
            {timeDisplay}
          </AppTypo>
          {fileSizeBytes > 0 && (
            <AppTypo
              variant="xs"
              className={cn(
                isCurrentUser ? "text-primary-foreground/50" : "text-foreground-lighter",
              )}
            >
              {formatFileSize(fileSizeBytes)}
            </AppTypo>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioMessageBubble;
