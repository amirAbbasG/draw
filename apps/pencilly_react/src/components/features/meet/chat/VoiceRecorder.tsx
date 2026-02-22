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

import { useAudioRecorder } from "../hooks/useAudioRecorder";
import type { AudioRecorderState } from "../hooks/useAudioRecorder";

interface VoiceRecorderProps {
  /** Called when user sends the recorded voice */
  onSend: (blob: Blob, durationMs: number, mimeType: string) => void;
  /** Called when user cancels / exits voice mode */
  onCancel: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Voice recorder widget with hold-to-record, lock, preview with waveform,
 * and send/delete controls. Replaces the send button area during recording.
 */
const VoiceRecorder: FC<VoiceRecorderProps> = ({
  onSend,
  onCancel,
  disabled = false,
  className,
}) => {
  const t = useTranslations("meet.chat.voice");
  const {
    state,
    durationMs,
    audioBlob,
    audioUrl,
    mimeType,
    startRecording,
    stopRecording,
    discard,
    setSending,
  } = useAudioRecorder();

  const [isLocked, setIsLocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);

  // Auto-start recording on mount
  useEffect(() => {
    if (state === "idle") {
      startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean up audio element on unmount or state change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // When state goes back to idle, reset lock
  useEffect(() => {
    if (state === "idle") {
      setIsLocked(false);
      setIsPlaying(false);
      setPlayProgress(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [state]);

  /* ─── Hold-to-record handlers ─── */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || state !== "idle") return;
      e.preventDefault();
      isHoldingRef.current = true;
      // Small delay to differentiate tap from hold
      holdTimerRef.current = setTimeout(() => {
        if (isHoldingRef.current) {
          startRecording();
        }
      }, 150);
    },
    [disabled, state, startRecording],
  );

  const handlePointerUp = useCallback(() => {
    isHoldingRef.current = false;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (state === "recording" && !isLocked) {
      stopRecording();
    }
  }, [state, isLocked, stopRecording]);

  const handlePointerLeave = useCallback(() => {
    // Only stop if not locked and actually recording
    if (state === "recording" && !isLocked && isHoldingRef.current) {
      isHoldingRef.current = false;
      stopRecording();
    }
  }, [state, isLocked, stopRecording]);

  /* ─── Lock toggle ─── */
  const handleLock = useCallback(() => {
    setIsLocked(true);
  }, []);

  /* ─── Stop (locked mode) ─── */
  const handleStop = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  /* ─── Send ─── */
  const handleSend = useCallback(() => {
    if (!audioBlob) return;
    setSending();
    onSend(audioBlob, durationMs, mimeType);
    // Reset after a brief delay for UI feedback
    setTimeout(() => {
      discard();
    }, 300);
  }, [audioBlob, durationMs, mimeType, onSend, setSending, discard]);

  /* ─── Play/Pause preview ─── */
  const handleTogglePlay = useCallback(() => {
    if (!audioUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      if (audio.duration) {
        setPlayProgress(audio.currentTime / audio.duration);
      }
    });
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setPlayProgress(0);
      audioRef.current = null;
    });

    audio.play();
    setIsPlaying(true);
  }, [audioUrl, isPlaying]);

  /* ─── Format time ─── */
  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /* ─── IDLE: waiting for mic permission / starting ─── */
  if (state === "idle") {
    return (
      <div className={cn("flex items-center gap-2 w-full", className)}>
        <span className="size-2.5 rounded-full bg-foreground-lighter animate-pulse shrink-0" />
        <AppTypo variant="sm" color="secondary" className="flex-1">
          {t("hold_to_record")}
        </AppTypo>
        <AppIconButton
          icon={sharedIcons.close}
          size="sm"
          title={t("cancel_recording")}
          onClick={onCancel}
        />
      </div>
    );
  }

  /* ─── RECORDING: show timer + lock + cancel ─── */
  if (state === "recording") {
    return (
      <div className={cn("flex items-center gap-2 w-full", className)}>
        {/* Pulsing red dot + timer */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="size-2.5 rounded-full bg-danger animate-pulse shrink-0" />
          <AppTypo variant="sm" className="font-mono tabular-nums text-danger">
            {formatTime(durationMs)}
          </AppTypo>

          {/* Waveform animation */}
          <div className="flex items-center gap-px flex-1 min-w-0 h-5 overflow-hidden">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="w-[2px] bg-danger/60 rounded-full shrink-0"
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                  animation: `wave ${0.4 + Math.random() * 0.4}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Lock button */}
        {!isLocked && (
          <AppIconButton
            icon="hugeicons:square-lock-02"
            size="sm"
            title={t("lock_recording")}
            onClick={handleLock}
            className="text-foreground-light hover:text-primary"
          />
        )}

        {/* Stop button (when locked) */}
        {isLocked && (
          <AppIconButton
            icon={sharedIcons.stop}
            size="sm"
            variant="fill"
            title={t("stop_recording")}
            onClick={handleStop}
            className="rounded-full"
            iconClassName="text-danger"
          />
        )}

        {/* Delete / cancel */}
        <AppIconButton
          icon={sharedIcons.delete}
          size="sm"
          title={t("cancel_recording")}
          onClick={() => { discard(); onCancel(); }}
          iconClassName="text-danger"
        />
      </div>
    );
  }

  /* ─── RECORDED / SENDING: show preview with play, waveform, send, delete ─── */
  if (state === "recorded" || state === "sending") {
    return (
      <div className={cn("flex items-center gap-2 w-full", className)}>
        {/* Delete */}
        <AppIconButton
          icon={sharedIcons.delete}
          size="sm"
          title={t("delete_recording")}
          onClick={() => { discard(); onCancel(); }}
          iconClassName="text-danger"
          disabled={state === "sending"}
        />

        {/* Play / pause */}
        <AppIconButton
          icon={isPlaying ? "hugeicons:pause" : sharedIcons.play}
          size="sm"
          title={isPlaying ? t("pause") : t("play")}
          onClick={handleTogglePlay}
          disabled={state === "sending"}
        />

        {/* Waveform progress */}
        <div className="flex-1 min-w-0 flex items-center gap-1 h-6">
          <div className="relative flex-1 h-5 flex items-center">
            <div className="flex items-end gap-px w-full h-full">
              {Array.from({ length: 32 }).map((_, i) => {
                const barProgress = (i + 1) / 32;
                const filled = barProgress <= playProgress;
                return (
                  <span
                    key={i}
                    className={cn(
                      "w-[2px] rounded-full shrink-0 transition-colors",
                      filled ? "bg-primary" : "bg-foreground-lighter/40",
                    )}
                    style={{
                      height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 50}%`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Duration + size */}
        <div className="col items-end gap-0">
          <AppTypo variant="xs" className="font-mono tabular-nums">
            {formatTime(durationMs)}
          </AppTypo>
          {audioBlob && (
            <AppTypo variant="xs" color="secondary">
              {formatFileSize(audioBlob.size)}
            </AppTypo>
          )}
        </div>

        {/* Send */}
        <AppIconButton
          icon={sharedIcons.send}
          size="sm"
          variant="fill"
          title={t("send_voice")}
          onClick={handleSend}
          disabled={state === "sending"}
          className="rounded-full"
        />
      </div>
    );
  }

  return null;
};

export default VoiceRecorder;
