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
import { useTranslations } from "@/i18n";

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
  const tVoice = useTranslations("meet.chat.voice");

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

  /**
   * We track "waiting for recording to start" so we know a recording is
   * in-flight even before isRecording flips to true (getUserMedia is async).
   */
  const [isPending, setIsPending] = useState(false);
  /** When true, auto-send as soon as recordingResult becomes available */
  const [sendOnReady, setSendOnReady] = useState(false);

  // Preview playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Refs for latest values (used inside window event listeners)
  const isRecordingRef = useRef(isRecording);
  const isLockedRef = useRef(isLocked);
  const elapsedMsRef = useRef(elapsedMs);
  isRecordingRef.current = isRecording;
  isLockedRef.current = isLocked;
  elapsedMsRef.current = elapsedMs;

  // Sync state with recorder
  useEffect(() => {
    let newState: VoiceRecorderState = "idle";
    if ((isRecording || isPending) && !isLocked) {
      newState = "recording";
    } else if (isRecording && isLocked) {
      newState = "locked";
    } else if (hasRecording && recordingResult) {
      newState = "preview";
    }
    setState(newState);
    onStateChange?.(newState);
  }, [isRecording, isPending, hasRecording, isLocked, recordingResult, onStateChange]);

  // When actual recording starts, clear pending
  useEffect(() => {
    if (isRecording) {
      setIsPending(false);
    }
  }, [isRecording]);

  // Auto-send when sendOnReady flag is set and result arrives
  useEffect(() => {
    if (sendOnReady && recordingResult) {
      setSendOnReady(false);
      onSend(recordingResult);
      clearRecording();
      setIsLocked(false);
      setIsPending(false);
    }
  }, [sendOnReady, recordingResult, onSend, clearRecording]);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  /* ── Global mouseup/touchend listener ──
   *
   * When the user presses the mic button, we start recording (async).
   * The DOM may re-render before mouseup fires, so we use a global listener
   * to reliably catch the release regardless of which element the cursor is on.
   */
  const handleGlobalRelease = useCallback(() => {
    const recording = isRecordingRef.current;
    const locked = isLockedRef.current;
    const elapsed = elapsedMsRef.current;

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (!recording || locked) return;

    // If recorded less than 500ms, cancel
    if (elapsed < 500) {
      cancelRecording();
    } else {
      stopRecording();
    }
  }, [cancelRecording, stopRecording]);

  const globalReleaseRef = useRef(handleGlobalRelease);
  globalReleaseRef.current = handleGlobalRelease;

  /** Attach/detach the global listener when recording (non-locked) starts/stops */
  useEffect(() => {
    if ((isRecording || isPending) && !isLocked) {
      const handler = () => globalReleaseRef.current();
      window.addEventListener("mouseup", handler);
      window.addEventListener("touchend", handler);
      return () => {
        window.removeEventListener("mouseup", handler);
        window.removeEventListener("touchend", handler);
      };
    }
  }, [isRecording, isPending, isLocked]);

  /* ── hold-to-record handlers ── */

  const handleMicPointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (disabled || state !== "idle") return;

      // Start recording after a short hold (150ms debounce)
      holdTimerRef.current = setTimeout(() => {
        setIsPending(true);
        startRecording();
      }, 150);
    },
    [disabled, state, startRecording],
  );

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
    setIsPending(false);
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
    setIsPending(false);
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

  /** Stop recording and immediately send once result is ready */
  const handleSendWhileRecording = useCallback(() => {
    setSendOnReady(true);
    stopRecording();
    setIsLocked(false);
  }, [stopRecording]);

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

  /* ── IDLE: just the mic button ── */
  if (state === "idle") {
    return (
      <div className={className}>
        <AppIconButton
          icon={sharedIcons.microphone}
          size="sm"
          title={tVoice("hold_to_record")}
          disabled={disabled}
          onMouseDown={handleMicPointerDown}
          onTouchStart={handleMicPointerDown}
        />
      </div>
    );
  }

  /* ── RECORDING (hold-to-record, not locked) ── */
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
        <AppIconButton
          icon="hugeicons:lock-key"
          size="sm"
          title={tVoice("lock_recording")}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleLock();
          }}
        />

        {/* Mic button indicator (user is holding) */}
        <AppIconButton
          icon={sharedIcons.microphone}
          size="sm"
          variant="fill"
          className="rounded-full"
        />
      </div>
    );
  }

  /* ── LOCKED recording ── */
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
            {tVoice("cancel_recording")}
          </AppTypo>

          <LiveWaveform analyser={analyserNode} />
        </div>

        {/* Stop button */}
        <AppIconButton
          icon="hugeicons:stop"
          size="sm"
          variant="fill"
          className="rounded-full"
          title={tVoice("stop_recording")}
          onClick={handleStopLocked}
        />

        {/* Send directly (stops recording and auto-sends) */}
        <AppIconButton
          icon={sharedIcons.send}
          size="sm"
          variant="fill"
          onClick={handleSendWhileRecording}
          className="rounded-full"
          title={tVoice("send_voice")}
        />
      </div>
    );
  }

  /* ── PREVIEW: recorded audio ready to send ── */
  if (state === "preview" && recordingResult) {
    const currentStr = formatDuration(previewTime);

    return (
      <div className={cn("flex items-center gap-2 flex-1", className)}>
        {/* Discard */}
        <AppIconButton
          icon="hugeicons:delete-02"
          size="sm"
          color="danger"
          title={tVoice("discard")}
          onClick={handleDiscard}
        />

        {/* Play/Pause */}
        <AppIconButton
          icon={isPlaying ? "hugeicons:pause" : "hugeicons:play"}
          size="sm"
          variant="fill"
          className="rounded-full shrink-0"
          onClick={togglePreviewPlay}
        />

        {/* Waveform */}
        <PreviewWaveform
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
          title={tVoice("send_voice")}
        />
      </div>
    );
  }

  return null;
};

export default VoiceRecorder;
