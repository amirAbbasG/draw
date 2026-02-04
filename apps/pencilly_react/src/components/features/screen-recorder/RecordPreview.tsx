import React, { useEffect, useRef, type FC } from "react";

import { formatTime } from "@/components/features/screen-recorder/utils";
import RenderIf from "@/components/shared/RenderIf";
import AppIcon from "@/components/ui/custom/app-icon";
import { useTranslations } from "@/i18n";

interface IProps {
  mediaBlobUrl: string | null;
  cameraPlusMediaUrl: string | null;
  isStopped: boolean;
  isRecording: boolean;
  recordingTime: number;
  countdown: number | null;
  recordingMode: "screen" | "camera" | "screen+camera";
  showCamera: boolean;
  previewStream: MediaStream | null;
  cameraPlusScreenPreviewStream: MediaStream | null;
  setIsPlaying: (playing: boolean) => void;
}

const RecordPreview: FC<IProps> = ({
  mediaBlobUrl,
  isStopped,
  isRecording,
  recordingTime,
  countdown,
  recordingMode,
  showCamera,
  previewStream,
  cameraPlusMediaUrl,
  cameraPlusScreenPreviewStream,
  setIsPlaying,
}) => {
  const t = useTranslations("screen_recorder");
  const playbackRef = useRef<HTMLVideoElement | null>(null);
  const cameraPlaybackRef = useRef<HTMLVideoElement | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const cameraPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (mediaBlobUrl && playbackRef.current) {
      // ensure the element reloads the new blob URL
      playbackRef.current.src = mediaBlobUrl;
      playbackRef.current.load();
    }
  }, [mediaBlobUrl]);

  useEffect(() => {
    if (cameraPlusMediaUrl && cameraPlaybackRef.current) {
      // ensure the element reloads the new blob URL
      cameraPlaybackRef.current.src = cameraPlusMediaUrl;
      cameraPlaybackRef.current.load();
    }
  }, [cameraPlusMediaUrl]);

  useEffect(() => {
    if (previewStream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  useEffect(() => {
    if (cameraPlusScreenPreviewStream && cameraPreviewRef.current) {
      // Only set if different or not set
      cameraPreviewRef.current.srcObject = cameraPlusScreenPreviewStream;
    }
  }, [cameraPlusScreenPreviewStream]);

  return (
    <div className="relative aspect-video bg-muted overflow-hidden">
      {mediaBlobUrl && isStopped ? (
        <video
          key={mediaBlobUrl} // forces React to recreate the element when URL changes
          ref={playbackRef}
          src={mediaBlobUrl ?? undefined}
          className="w-full h-full object-contain"
          controls
          playsInline
          onPlay={() => {
            setIsPlaying(true);
            void cameraPlaybackRef.current?.play();
          }}
          onPause={() => {
            setIsPlaying(false);
            cameraPlaybackRef.current?.pause();
          }}
        />
      ) : previewStream ? (
        <video
          ref={videoPreviewRef}
          autoPlay
          muted
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground">
          <AppIcon
            icon="hugeicons:computer-video"
            className="w-12 h-12 mb-2 opacity-50"
          />
          <span className="text-sm">{t("preview_message")}</span>
        </div>
      )}

      {/* Countdown Overlay */}
      <RenderIf isTrue={countdown !== null}>
        <div className="absolute inset-0 bg-primary-darker/80 flex items-center justify-center">
          <span className="text-7xl font-bold text-primary-foreground animate-pulse">
            {countdown}
          </span>
        </div>
      </RenderIf>

      {/* Recording Indicator */}
      <RenderIf isTrue={isRecording}>
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-medium">
            {formatTime(recordingTime)}
          </span>
        </div>
      </RenderIf>

      {/* Camera Overlay Toggle */}
      <RenderIf
        isTrue={
          recordingMode === "screen+camera" &&
          showCamera &&
          (!!cameraPlusScreenPreviewStream || !!cameraPlusMediaUrl)
        }
      >
        <div className="absolute bottom-3 right-3 w-32 h-24 rounded-lg overflow-hidden border-2 border-primary shadow-lg">
          {cameraPlusMediaUrl && isStopped ? (
            <video
              key={cameraPlusMediaUrl} // forces React to recreate the element when URL changes
              ref={cameraPlaybackRef}
              src={cameraPlusMediaUrl ?? undefined}
              className="w-full h-full object-cover bg-primary-darker"
              playsInline
            />
          ) : (
            <video
              ref={cameraPreviewRef}
              autoPlay
              muted
              className="w-full h-full object-cover bg-primary-darker"
            />
          )}
        </div>
      </RenderIf>
    </div>
  );
};

export default RecordPreview;
