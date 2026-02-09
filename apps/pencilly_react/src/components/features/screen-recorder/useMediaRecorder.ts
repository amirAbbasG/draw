import { useCallback, useEffect, useRef, useState } from "react";

import { useReactMediaRecorder } from "react-media-recorder";

import {
  getVideoConstraints,
  isScreenCaptureSupported,
  type VideoQuality,
} from "@/components/features/screen-recorder/utils";

export type RecordingMode = "screen" | "camera" | "screen+camera";

export interface Recording {
  url: string;
  name: string;
  date: Date;
  extraUrl?: string;
}

export const useMediaRecorder = () => {
  const screenSupported = isScreenCaptureSupported();
  const [recordingMode, setRecordingMode] = useState<RecordingMode>(
      screenSupported ? "screen" : "camera",
  );
  const [includeAudio, setIncludeAudio] = useState(true);
  const [includeSystemAudio, setIncludeSystemAudio] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("1080p");
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownEnabled, setCountdownEnabled] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    startRecording: startCameraPlusScreenRecording,
    stopRecording: stopCameraPlusScreenRecording,
    mediaBlobUrl: cameraPlusScreenBlobUrl,
    clearBlobUrl: clearCameraPlusScreenBlobUrl,
    previewStream: cameraPlusScreenPreviewStream,
  } = useReactMediaRecorder({
    video: true,
    audio: includeAudio,
    onStop: blobUrl => {
      const newRecording = {
        url: mediaBlobUrl,
        name: `Recording_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}`,
        date: new Date(),
        extraUrl:blobUrl
      };
      setRecordings(prev => [newRecording, ...prev]);
    }
  });

  const {
    status,
    startRecording: startMediaRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
    previewStream,
  } = useReactMediaRecorder({
    screen:
        screenSupported &&
        (recordingMode === "screen" || recordingMode === "screen+camera"),
    video:
        recordingMode === "camera" ? getVideoConstraints(videoQuality) : false,
    audio: includeAudio,
    onStop: blobUrl => {
      if (recordingMode === "screen+camera") {
        stopCameraPlusScreenRecording();
      }else {
        const newRecording = {
          url: blobUrl,
          name: `Recording_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}`,
          date: new Date(),
        };
        setRecordings(prev => [newRecording, ...prev]);
      }
    },
    onStart: () => {
      if (recordingMode === "screen+camera") {
        startCameraPlusScreenRecording();
      }
    },
  });



  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  const startRecording = useCallback(() => {
    if (countdownEnabled) {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            startMediaRecording();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      startMediaRecording();
    }
  }, [countdownEnabled, startMediaRecording]);

  const handleDelete = (index: number) => {
    setRecordings(prev => prev.filter((_, i) => i !== index));
  };

  const isRecording = status === "recording";
  const isPaused = status === "paused";
  const isStopped = status === "stopped";
  const isIdle = status === "idle";

  return {
    recordingMode,
    setRecordingMode,
    includeAudio,
    setIncludeAudio,
    includeSystemAudio,
    setIncludeSystemAudio,
    showCamera,
    setShowCamera,
    videoQuality,
    setVideoQuality,
    recordings,
    isPlaying,
    setIsPlaying,
    countdown,
    recordingTime,
    isRecording,
    isPaused,
    isStopped,
    isIdle,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl: () => {
      clearBlobUrl();
      clearCameraPlusScreenBlobUrl();
    },
    handleDelete,
    countdownEnabled,
    setCountdownEnabled,
    previewStream,
    cameraPlusScreenPreviewStream,
    cameraPlusScreenBlobUrl,
  };
};
