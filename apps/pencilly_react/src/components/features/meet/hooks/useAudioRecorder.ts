import { useCallback, useEffect, useRef, useState } from "react";

export type AudioRecorderState =
  | "idle"
  | "recording"
  | "recorded"
  | "sending";

interface AudioRecorderResult {
  /** Current state of the recorder */
  state: AudioRecorderState;
  /** Duration of the current/last recording in milliseconds */
  durationMs: number;
  /** Recorded audio Blob (available after stopping) */
  audioBlob: Blob | null;
  /** Object URL for local playback */
  audioUrl: string | null;
  /** MIME type of the recording */
  mimeType: string;
  /** Start recording audio */
  startRecording: () => Promise<void>;
  /** Stop recording and produce audioBlob */
  stopRecording: () => void;
  /** Reset to idle state and discard data */
  discard: () => void;
  /** Mark state as sending (for UI) */
  setSending: () => void;
}

/**
 * Hook that encapsulates MediaRecorder-based audio capture.
 * Produces a Blob suitable for uploading via REST or WS.
 */
export function useAudioRecorder(): AudioRecorderResult {
  const [state, setState] = useState<AudioRecorderState>("idle");
  const [durationMs, setDurationMs] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("audio/webm");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const startRecording = useCallback(async () => {
    // Discard previous
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDurationMs(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Choose best supported mime type
      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
        "audio/mp4",
      ];
      let selectedMime = "audio/webm";
      for (const type of preferredTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMime = type;
          break;
        }
      }
      setMimeType(selectedMime);

      const recorder = new MediaRecorder(stream, { mimeType: selectedMime });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedMime });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setState("recorded");

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start(250); // collect data every 250ms
      startTimeRef.current = Date.now();
      setState("recording");

      // Timer to update duration
      timerRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 100);
    } catch (err) {
      console.error("Failed to start audio recording:", err);
      setState("idle");
    }
  }, [audioUrl]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Capture final duration
    if (startTimeRef.current) {
      setDurationMs(Date.now() - startTimeRef.current);
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const discard = useCallback(() => {
    cleanup();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDurationMs(0);
    setState("idle");
  }, [audioUrl, cleanup]);

  const setSending = useCallback(() => {
    setState("sending");
  }, []);

  return {
    state,
    durationMs,
    audioBlob,
    audioUrl,
    mimeType,
    startRecording,
    stopRecording,
    discard,
    setSending,
  };
}
