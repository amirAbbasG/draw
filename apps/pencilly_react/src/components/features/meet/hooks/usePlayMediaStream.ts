import { useEffect, useRef } from "react";

import { RemoteTrack } from "@/components/features/call/types";

export const usePlayMediaStream = (
  videoTrack: RemoteTrack,
  screenTrack?: MediaStreamTrack,
) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isTrackMuted = screenTrack ? false : videoTrack?.isMuted || false;
  const track = screenTrack || videoTrack?.track;

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !track) return;
    el.srcObject = new MediaStream([track]);
    el.play().catch(() => {});
    return () => {
      if (el) el.srcObject = null;
    };
  }, [track]);

  return {
    videoRef,
    isTrackMuted,
    isTrackExists: !!track,
  };
};
