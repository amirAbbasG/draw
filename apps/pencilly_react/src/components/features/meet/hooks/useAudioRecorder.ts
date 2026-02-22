import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioRecordingResult {
  blob: Blob;
  durationMs: number;
  mimeType: string;
  fileSizeBytes: number;
}

interface UseAudioRecorderOptions {
  /** Max recording duration in ms (default 5 minutes) */
  maxDurationMs?: number;
}

interface UseAudioRecorderReturn {
  /** Whether the recorder is currently recording */
  isRecording: boolean;
  /** Whether a recording is ready to send/preview */
  hasRecording: boolean;
  /** Elapsed time in ms since recording started */
  elapsedMs: number;
  /** Start recording audio */
  startRecording: () => Promise<void>;
  /** Stop recording and produce the result blob */
  stopRecording: () => void;
  /** Cancel and discard the current recording */
  cancelRecording: () => void;
  /** The recorded audio result (available after stop) */
  recordingResult: AudioRecordingResult | null;
  /** Clear the recording result */
  clearRecording: () => void;
  /** Audio analyser node for waveform visualisation while recording */
  analyserNode: AnalyserNode | null;
}

function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
  ];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "audio/webm";
}

export function useAudioRecorder(
  options: UseAudioRecorderOptions = {},
): UseAudioRecorderReturn {
  const { maxDurationMs = 5 * 60 * 1000 } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recordingResult, setRecordingResult] =
    useState<AudioRecordingResult | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAnalyserNode(null);
    mediaRecorderRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      chunksRef.current = [];
      setRecordingResult(null);
      setHasRecording(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up analyser for waveform
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      setAnalyserNode(analyser);

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const durationMs = Date.now() - startTimeRef.current;
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const baseMime = mimeType.split(";")[0];
        setRecordingResult({
          blob,
          durationMs,
          mimeType: baseMime,
          fileSizeBytes: blob.size,
        });
        setHasRecording(true);
        setIsRecording(false);
        cleanup();
      };

      recorder.start(250); // collect data in 250ms chunks
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setElapsedMs(0);

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setElapsedMs(elapsed);
        if (elapsed >= maxDurationMs) {
          recorder.stop();
        }
      }, 100);
    } catch (err) {
      console.error("Failed to start audio recording:", err);
      cleanup();
    }
  }, [maxDurationMs, cleanup]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      // Remove onstop handler to prevent setting result
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    chunksRef.current = [];
    setIsRecording(false);
    setHasRecording(false);
    setElapsedMs(0);
    setRecordingResult(null);
    cleanup();
  }, [cleanup]);

  const clearRecording = useCallback(() => {
    setRecordingResult(null);
    setHasRecording(false);
    setElapsedMs(0);
    chunksRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }
      cleanup();
    };
  }, [cleanup]);

  return {
    isRecording,
    hasRecording,
    elapsedMs,
    startRecording,
    stopRecording,
    cancelRecording,
    recordingResult,
    clearRecording,
    analyserNode,
  };
}
