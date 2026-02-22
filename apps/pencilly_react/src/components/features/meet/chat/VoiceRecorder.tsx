import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
} from "react";

import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";

import {
  useAudioRecorder,
  type AudioRecordingResult,
} from "../hooks/useAudioRecorder";

/* ────────────── helpers ────────────── */

function formatRecordingTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${tenths}`;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/* ────────────── types ────────────── */

export type VoiceRecorderState = "idle" | "recording" | "locked" | "preview";

interface VoiceRecorderProps {
  onSend: (result: AudioRecordingResult) => void;
  onStateChange?: (state: VoiceRecorderState) => void;
  disabled?: boolean;
  className?: string;
}

/* ────────────── live waveform (while recording) ────────────── */

const LiveWaveform: FC<{ analyser: AnalyserNode | null }> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const barCount = 32;
      const barWidth = width / barCount - 1;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] / 255;
        const barH = Math.max(2, val * height);
        const x = i * (barWidth + 1);
        const y = (height - barH) / 2;

        ctx.fillStyle = "var(--color-primary)";
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 1);
        ctx.fill();
      }
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={28}
      className="flex-1 max-w-[160px]"
    />
  );
};

/* ────────────── preview waveform (static from blob) ────────────── */

const PreviewWaveform: FC<{
  audioUrl: string;
  currentTime: number;
  duration: number;
  onSeek: (ratio: number) => void;
}> = ({ currentTime, duration, onSeek }) => {
  const barCount = 48;
  const barsRef = useRef<number[]>([]);

  if (barsRef.current.length === 0) {
    barsRef.current = Array.from({ length: barCount }, () =>
      Math.random() * 0.7 + 0.3,
    );
  }
  const bars = barsRef.current;
  const progress = duration > 0 ? currentTime / duration : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(1, ratio)));
  };

  return (
    <div
      className="flex items-center gap-[1.5px] h-7 flex-1 cursor-pointer"
      onClick={handleClick}
    >
      {bars.map((h, i) => {
        const filled = i / barCount <= progress;
        return (
          <div
            key={i}
            className={cn(
              "w-[2.5px] rounded-full transition-colors",
              filled ? "bg-primary" : "bg-primary/30",
            )}
            style={{ height: `${h * 100}%` }}
          />
        );
      })}
    </div>
  );
};

/* ────────────── main component ────────────── */

const VoiceRecorder: FC<VoiceRecorderProps> = ({
  onSend,
  onStateChange,
  disabled = false,
  className,
}) => {
  const {
    isRecording,
    hasRecording,
    elapsedMs,
    startRecording,
    stopRecording,
    cancelRecording,
    recordingResult,
    clearRecording,
    analyserNode,
  } = useAudioRecorder();

  const [state, setState] = useState<VoiceRecorderState>("idle");
  const [isLocked, setIsLocked] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);

  // Preview playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Sync state with recorder
  useEffect(() => {
    let newState: VoiceRecorderState = "idle";
    if (isRecording && !isLocked) {
      newState = "recording";
    } else if (isRecording && isLocked) {
      newState = "locked";
    } else if (hasRecording && recordingResult) {
      newState = "preview";
    }
    setState(newState);
    onStateChange?.(newState);
  }, [isRecording, hasRecording, isLocked, recordingResult, onStateChange]);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  /* ── hold-to-record handlers ── */

  const handleMicMouseDown = useCallback(() => {
    if (disabled || state !== "idle") return;
    isHoldingRef.current = true;

    holdTimerRef.current = setTimeout(() => {
      if (isHoldingRef.current) {
        startRecording();
      }
    }, 150);
  }, [disabled, state, startRecording]);

  const handleMicMouseUp = useCallback(() => {
    isHoldingRef.current = false;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    // If recording and not locked, stop
    if (isRecording && !isLocked) {
      // If recorded less than 500ms, cancel
      if (elapsedMs < 500) {
        cancelRecording();
      } else {
        stopRecording();
      }
    }
  }, [isRecording, isLocked, elapsedMs, stopRecording, cancelRecording]);

  const handleLock = useCallback(() => {
    setIsLocked(true);
  }, []);

  const handleStopLocked = useCallback(() => {
    stopRecording();
    setIsLocked(false);
  }, [stopRecording]);

  const handleCancel = useCallback(() => {
    cancelRecording();
    setIsLocked(false);
    setIsPlaying(false);
    setPreviewTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, [cancelRecording]);

  const handleDiscard = useCallback(() => {
    clearRecording();
    setIsPlaying(false);
    setPreviewTime(0);
    setIsLocked(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, [clearRecording]);

  const handleSend = useCallback(() => {
    if (recordingResult) {
      onSend(recordingResult);
      handleDiscard();
    }
  }, [recordingResult, onSend, handleDiscard]);

  /* ── preview playback ── */

  const togglePreviewPlay = useCallback(() => {
    if (!recordingResult) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (!previewUrlRef.current) {
      previewUrlRef.current = URL.createObjectURL(recordingResult.blob);
    }

    const audio = new Audio(previewUrlRef.current);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      setPreviewTime(audio.currentTime * 1000);
    };
    audio.onended = () => {
      setIsPlaying(false);
      setPreviewTime(0);
    };

    audio.play();
    setIsPlaying(true);
  }, [recordingResult, isPlaying]);

  const handlePreviewSeek = useCallback(
    (ratio: number) => {
      if (audioRef.current && recordingResult) {
        const seekTime = (recordingResult.durationMs / 1000) * ratio;
        audioRef.current.currentTime = seekTime;
        setPreviewTime(seekTime * 1000);
      }
    },
    [recordingResult],
  );

  /* ── idle: show microphone button ── */
  if (state === "idle") {
    return (
      <button
        type="button"
        className={cn(
          "flex items-center justify-center h-7 w-7 rounded-full cursor-pointer",
          "text-foreground-icon hover:bg-background-lighter",
          "transition-colors",
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
        onMouseDown={handleMicMouseDown}
        onMouseUp={handleMicMouseUp}
        onMouseLeave={handleMicMouseUp}
        onTouchStart={handleMicMouseDown}
        onTouchEnd={handleMicMouseUp}
        title="Hold to record voice message"
      >
        <AppIcon icon={sharedIcons.microphone} fontSize={18} />
      </button>
    );
  }

  /* ── recording (hold): full-width recording bar ── */
  if (state === "recording") {
    return (
      <div className={cn("flex items-center gap-2 flex-1", className)}>
        {/* Recording indicator */}
        <div className="flex items-center gap-2 flex-1">
          <div className="size-2.5 rounded-full bg-danger animate-pulse shrink-0" />
          <AppTypo variant="xs" color="danger" className="font-mono tabular-nums min-w-[60px]">
            {formatRecordingTime(elapsedMs)}
          </AppTypo>

          <LiveWaveform analyser={analyserNode} />
        </div>

        {/* Lock button */}
        <button
          type="button"
          className="flex items-center justify-center h-7 w-7 rounded-full bg-background-lighter hover:bg-background-dark transition-colors cursor-pointer"
          onClick={handleLock}
          title="Lock recording"
        >
          <AppIcon icon="hugeicons:lock-key" fontSize={14} />
        </button>

        {/* Mic button (still held) */}
        <button
          type="button"
          className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground cursor-pointer"
          onMouseUp={handleMicMouseUp}
          onMouseLeave={handleMicMouseUp}
          onTouchEnd={handleMicMouseUp}
        >
          <AppIcon icon={sharedIcons.microphone} fontSize={16} />
        </button>
      </div>
    );
  }

  /* ── locked recording ── */
  if (state === "locked") {
    return (
      <div className={cn("flex items-center gap-2 flex-1", className)}>
        <div className="flex items-center gap-2 flex-1">
          <div className="size-2.5 rounded-full bg-danger animate-pulse shrink-0" />
          <AppTypo variant="xs" color="danger" className="font-mono tabular-nums min-w-[60px]">
            {formatRecordingTime(elapsedMs)}
          </AppTypo>

          <AppTypo
            variant="xs"
            color="secondary"
            className="cursor-pointer hover:text-danger transition-colors"
            onClick={handleCancel}
          >
            Cancel
          </AppTypo>

          <LiveWaveform analyser={analyserNode} />
        </div>

        {/* Pause/Stop button */}
        <button
          type="button"
          className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground cursor-pointer"
          onClick={handleStopLocked}
          title="Stop recording"
        >
          <AppIcon icon="hugeicons:stop" fontSize={16} />
        </button>

        {/* Send directly */}
        <AppIconButton
          icon={sharedIcons.send}
          size="sm"
          variant="fill"
          onClick={() => {
            stopRecording();
            // Will trigger state -> preview, then auto-handled
          }}
          className="rounded-full"
          title="Send"
        />
      </div>
    );
  }

  /* ── preview: recorded audio ready to send ── */
  if (state === "preview" && recordingResult) {
    const durationStr = formatDuration(recordingResult.durationMs);
    const currentStr = formatDuration(previewTime);

    return (
      <div className={cn("flex items-center gap-2 flex-1", className)}>
        {/* Discard */}
        <button
          type="button"
          className="flex items-center justify-center h-7 w-7 rounded-full hover:bg-background-lighter transition-colors cursor-pointer text-danger"
          onClick={handleDiscard}
          title="Discard"
        >
          <AppIcon icon="hugeicons:delete-02" fontSize={16} />
        </button>

        {/* Play/Pause */}
        <button
          type="button"
          className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground cursor-pointer shrink-0"
          onClick={togglePreviewPlay}
        >
          <AppIcon
            icon={isPlaying ? "hugeicons:pause" : "hugeicons:play"}
            fontSize={14}
          />
        </button>

        {/* Waveform */}
        <PreviewWaveform
          audioUrl=""
          currentTime={previewTime}
          duration={recordingResult.durationMs}
          onSeek={handlePreviewSeek}
        />

        {/* Time */}
        <AppTypo variant="xs" color="secondary" className="font-mono tabular-nums shrink-0">
          {currentStr}
        </AppTypo>

        {/* Send */}
        <AppIconButton
          icon={sharedIcons.send}
          size="sm"
          variant="fill"
          onClick={handleSend}
          className="rounded-full"
          title="Send voice message"
        />
      </div>
    );
  }

  return null;
};

export default VoiceRecorder;
