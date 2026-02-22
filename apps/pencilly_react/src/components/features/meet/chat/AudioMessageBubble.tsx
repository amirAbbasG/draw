import React, { useCallback, useEffect, useRef, useState, type FC } from "react";

import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";

interface AudioPayload {
  audioUrl?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  durationMs?: number;
}

interface AudioMessageBubbleProps {
  payload: AudioPayload;
  isCurrentUser: boolean;
  className?: string;
}

/**
 * Audio message player that renders inside a message bubble.
 * Shows a play button, waveform visualization, current time, and file size.
 */
const AudioMessageBubble: FC<AudioMessageBubbleProps> = ({
  payload,
  isCurrentUser,
  className,
}) => {
  const { audioUrl, durationMs = 0, fileSizeBytes = 0 } = payload;
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barsRef = useRef<number[]>([]);

  // Generate stable random bar heights once
  if (barsRef.current.length === 0) {
    barsRef.current = Array.from({ length: 36 }, () =>
      20 + Math.random() * 80,
    );
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (!audioUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // If we already have an audio element that's paused, resume it
    if (audioRef.current && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      if (audio.duration && !Number.isNaN(audio.duration)) {
        setProgress(audio.currentTime / audio.duration);
        setCurrentTime(audio.currentTime * 1000);
      }
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      audioRef.current = null;
    });

    audio.addEventListener("error", () => {
      setIsPlaying(false);
      audioRef.current = null;
    });

    audio.play();
    setIsPlaying(true);
  }, [audioUrl, isPlaying]);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const displayTime = isPlaying || currentTime > 0 ? currentTime : durationMs;

  return (
    <div className={cn("flex items-center gap-2 min-w-[180px]", className)}>
      {/* Play / Pause button */}
      <button
        type="button"
        onClick={handleTogglePlay}
        disabled={!audioUrl}
        className={cn(
          "size-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
          isCurrentUser
            ? "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
            : "bg-primary/10 hover:bg-primary/20 text-primary",
        )}
      >
        <AppIcon
          icon={isPlaying ? "hugeicons:pause" : sharedIcons.play}
          className="size-4"
        />
      </button>

      {/* Waveform + info */}
      <div className="flex-1 min-w-0 col gap-1">
        {/* Waveform bars */}
        <div className="flex items-center gap-px h-6">
          {barsRef.current.map((h, i) => {
            const barProgress = (i + 1) / barsRef.current.length;
            const filled = barProgress <= progress;
            return (
              <span
                key={i}
                className={cn(
                  "w-[2px] rounded-full shrink-0 transition-colors duration-150",
                  filled
                    ? isCurrentUser
                      ? "bg-primary-foreground"
                      : "bg-primary"
                    : isCurrentUser
                      ? "bg-primary-foreground/30"
                      : "bg-foreground-lighter/40",
                )}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>

        {/* Time + file size */}
        <div className="flex items-center justify-between">
          <AppTypo
            variant="xs"
            className={cn(
              "font-mono tabular-nums",
              isCurrentUser ? "text-primary-foreground/80" : "text-foreground-light",
            )}
          >
            {formatTime(displayTime)}
          </AppTypo>
          {fileSizeBytes > 0 && (
            <AppTypo
              variant="xs"
              className={cn(
                isCurrentUser ? "text-primary-foreground/60" : "text-foreground-lighter",
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
