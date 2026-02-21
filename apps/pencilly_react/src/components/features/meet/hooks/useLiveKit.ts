import { useCallback, useEffect, useRef, useState } from "react";

import type {
  LocalTrack,
  Participant,
  RemoteTrack,
  ConnectionState
} from "@/components/features/call/types";
import { useTranslations } from "@/i18n";

interface UseLiveKitOptions {
  onStatusChange?: (status: string) => void;
}

export function useLiveKit({ onStatusChange }: UseLiveKitOptions = {}) {
  const t = useTranslations("call.status");
  const [connectionState, setConnectionState] =
      useState<ConnectionState>("idle");
  const [localTracks, setLocalTracks] = useState<LocalTrack[]>([]);
  const [remoteTracks, setRemoteTracks] = useState<RemoteTrack[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraMuted, setCameraMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVolumeMuted, setIsVolumeMuted] = useState(false)

  const isAnyoneSharing = remoteTracks.some((t) => t.kind === "video" && t.source === "screen")

  const roomRef = useRef<any>(null);
  const livekitRef = useRef<any>(null);
  const screenTrackRef = useRef<any>(null);
  const localTracksRef = useRef<any[]>([]);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const status = useCallback(
      (msg: string) => {
        onStatusChange?.(msg);
      },
      [onStatusChange],
  );

  const loadLiveKit = useCallback(async () => {
    if (livekitRef.current) return livekitRef.current;

    const script = document.createElement("script");
    script.src =
        "https://unpkg.com/livekit-client@2.16.1/dist/livekit-client.umd.js";
    script.async = true;

    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(t("load_failed")));
      document.head.appendChild(script);
    });

    const livekit =
        (window as any).LivekitClient ||
        (window as any).LiveKit ||
        (window as any).LiveKitClient ||
        (window as any).livekit;

    if (!livekit) {
      throw new Error(t("missing_global"));
    }

    livekitRef.current = livekit;
    return livekit;
  }, []);

  const getProfileImageFromMetadata = (participant: any): string | undefined => {
    const raw = participant?.metadata ?? participant?.info?.metadata;
    if (!raw || typeof raw !== "string" || raw.trim() === "") return undefined;

    try {
      const metadata = JSON.parse(raw);
      return metadata?.profileImage || metadata?.profile_image_url;
    } catch {
      return undefined;
    }
  };

  // NOTE: added options.publishVideo to control whether video tracks are created/published
  const join = useCallback(
      async (livekitUrl: string, token: string, displayName?: string, profileImage?: string, options?: { publishVideo?: boolean }) => {
        try {
          setConnectionState("connecting");
          status(t("loading"));

          const livekit = await loadLiveKit();

          if (!livekitUrl) {
            throw new Error(t("url_not_configured"));
          }

          status(t("connecting"));
          const room = new livekit.Room();
          roomRef.current = room;

          room.on(
              livekit.RoomEvent.TrackSubscribed,
              (track: any, pub: any, participant: any) => {
                if (track.kind === "video" || track.kind === "audio") {
                  const isScreenShare =
                      pub?.source === livekit.Track?.Source?.ScreenShare ||
                      pub?.source === "screen_share" ||
                      track?.source === livekit.Track?.Source?.ScreenShare ||
                      track?.source === "screen_share" ||
                      pub?.trackName?.toLowerCase()?.includes("screen") ||
                      pub?.name?.toLowerCase()?.includes("screen") ||
                      track?.name?.toLowerCase()?.includes("screen");

                  const mediaStreamTrack = track.mediaStreamTrack || track.track;

                  if (track.kind === "audio" && mediaStreamTrack) {
                    const audioEl = document.createElement("audio");
                    audioEl.autoplay = true;
                    //@ts-ignore
                    audioEl.playsInline = true;
                    audioEl.srcObject = new MediaStream([mediaStreamTrack]);
                    audioEl.style.display = "none";
                    document.body.appendChild(audioEl);
                    audioEl.play().catch(() => {});
                    audioElementsRef.current.set(track.sid, audioEl);
                  }

                  setRemoteTracks(prev => [
                    ...prev,
                    {
                      kind: track.kind,
                      participantIdentity: participant.identity,
                      participantName: participant.name,
                      participantProfileImage: getProfileImageFromMetadata(participant),
                      track: mediaStreamTrack,
                      sid: track.sid,
                      source: isScreenShare ? "screen" : "camera",
                      isMuted: pub?.isMuted || false,
                    },
                  ]);
                }
              },
          );

          room.on(livekit.RoomEvent.TrackUnsubscribed, (track: any) => {
            const audioEl = audioElementsRef.current.get(track.sid);
            if (audioEl) {
              audioEl.pause();
              audioEl.srcObject = null;
              audioEl.remove();
              audioElementsRef.current.delete(track.sid);
            }
            setRemoteTracks(prev => prev.filter(t => t.sid !== track.sid));
          });

          room.on(livekit.RoomEvent.TrackMuted, (pub: any, _participant: any) => {
            const mutedAudioEl = audioElementsRef.current.get(pub.trackSid);
            if (mutedAudioEl) {
              mutedAudioEl.muted = true;
            }
            setRemoteTracks(prev =>
                prev.map(t =>
                    t.sid === pub.trackSid
                        ? { ...t, isMuted: true }
                        : t
                )
            );
          });

          room.on(livekit.RoomEvent.TrackUnmuted, (pub: any, _participant: any) => {
            const unmutedAudioEl = audioElementsRef.current.get(pub.trackSid);
            if (unmutedAudioEl) {
              unmutedAudioEl.muted = false;
            }
            setRemoteTracks(prev =>
                prev.map(t =>
                    t.sid === pub.trackSid
                        ? { ...t, isMuted: false }
                        : t
                )
            );
          });

          room.on(livekit.RoomEvent.ParticipantConnected, (participant: any) => {
            setParticipants(prev => [
              ...prev,
              {
                identity: participant.identity,
                name: participant.name,
                profileImage: getProfileImageFromMetadata(participant),
                isLocal: false,
              },
            ]);
            status(`${participant.name || participant.identity} joined`);
          });

          room.on(
              livekit.RoomEvent.ParticipantDisconnected,
              (participant: any) => {
                setParticipants(prev =>
                    prev.filter(p => p.identity !== participant.identity),
                );
                status(`${participant.name || participant.identity} left`);
              },
          );

          await room.connect(livekitUrl, token);

          status(t("publishing"));

          // decide whether to publish video based on options.publishVideo (default true)
          const publishVideo = options?.publishVideo !== false;
          const tracks = await livekit.createLocalTracks({
            audio: true,
            video: publishVideo,
          });

          localTracksRef.current = tracks;

          const newLocalTracks: LocalTrack[] = [];
          for (const track of tracks) {
            await room.localParticipant.publishTrack(track);
            newLocalTracks.push({
              kind: track.kind,
              track: track.mediaStreamTrack || track.track,
              sid: track.sid,
              muted: false,
              source: (track.source ?? undefined) as any,
            });
          }

          setLocalTracks(newLocalTracks);

          // If we didn't publish video, reflect camera muted state
          setCameraMuted(!publishVideo);

          setParticipants([
            {
              identity: room.localParticipant.identity,
              name: room.localParticipant.name || displayName,
              profileImage: profileImage || getProfileImageFromMetadata(room.localParticipant),
              isLocal: true,
            },
          ]);

          room.remoteParticipants.forEach((participant: any) => {
            setParticipants(prev => [
              ...prev,
              {
                identity: participant.identity,
                name: participant.name,
                profileImage: getProfileImageFromMetadata(participant),
                isLocal: false,
              },
            ]);
          });

          setConnectionState("connected");
          status("connected");
        } catch (err: any) {
          setConnectionState("disconnected");
          status(err.message || t("connection_failed"));
          throw err;
        }
      },
      [loadLiveKit, status, t],
  );


  const leave = useCallback(() => {
    if (screenTrackRef.current) {
      const ref = screenTrackRef.current;
      try {
        roomRef.current?.localParticipant?.unpublishTrack(ref)
        if (typeof ref.stop === "function") ref.stop()
        const raw = ref.mediaStreamTrack ?? ref.track;
        if (raw && typeof raw.stop === "function") raw.stop()
      } catch {}
      screenTrackRef.current = null
    }

    for (const track of localTracksRef.current) {
      try {
        roomRef.current?.localParticipant?.unpublishTrack(track)
        track.stop()
      } catch {}
    }
    localTracksRef.current = []

    // Clean up all remote audio elements
    audioElementsRef.current.forEach((audioEl) => {
      audioEl.pause();
      audioEl.srcObject = null;
      audioEl.remove();
    });
    audioElementsRef.current.clear();

    if (roomRef.current) {
      try {
        roomRef.current.disconnect()
      } catch {}
      roomRef.current = null
    }

    setLocalTracks([])
    setRemoteTracks([])
    setParticipants([])
    setMicMuted(false)
    setCameraMuted(false)
    setIsScreenSharing(false)
    setConnectionState("disconnected")
    status("Disconnected")
  }, [status]);

  const toggleMic = useCallback(async () => {
    const track = localTracksRef.current.find((t: any) => t.kind === "audio");
    if (!track) return;

    try {
      if (micMuted) {
        if (typeof track.unmute === "function") {
          await track.unmute();
        } else if (track.mediaStreamTrack) {
          track.mediaStreamTrack.enabled = true;
        }
      } else {
        if (typeof track.mute === "function") {
          await track.mute();
        } else if (track.mediaStreamTrack) {
          track.mediaStreamTrack.enabled = false;
        }
      }

      // Add this to trigger re-render
      setLocalTracks(prev =>
          prev.map(t =>
              t.kind === "audio"
                  ? { ...t, track: track.mediaStreamTrack || track.track }
                  : t
          )
      );

      setMicMuted(!micMuted);
    } catch (err: any) {
      status(err.message || t("mic_toggle_failed"));
    }
  }, [micMuted, status]);

  const toggleCamera = useCallback(async () => {
    const track = localTracksRef.current.find((t: any) => t.kind === "video");
    if (!track) return;

    try {
      if (cameraMuted) {
        // Unmuting - enable the track
        if (typeof track.unmute === "function") {
          await track.unmute();
        } else if (track.mediaStreamTrack) {
          track.mediaStreamTrack.enabled = true;
        }
      } else {
        // Muting - disable the track
        if (typeof track.mute === "function") {
          await track.mute();
        } else if (track.mediaStreamTrack) {
          track.mediaStreamTrack.enabled = false;
        }
      }

      // Update local tracks to trigger re-render
      setLocalTracks(prev =>
          prev.map(t =>
              t.kind === "video" && t.source !== "screen"
                  ? { ...t, track: track.mediaStreamTrack || track.track }
                  : t
          )
      );

      setCameraMuted(!cameraMuted);
    } catch (err: any) {
      status(err.message || t("camera_toggle_failed"));
    }
  }, [cameraMuted, status]);

  const startScreenShare = useCallback(async () => {
    if (!roomRef.current || !livekitRef.current) return;

    if (!navigator.mediaDevices?.getDisplayMedia) {
      status("Screen sharing is not supported on this device");
      return;
    }

    if (isAnyoneSharing) {
      status("Someone else is already sharing their screen")
      return
    }
    const livekit = livekitRef.current

    try {
      // Use getDisplayMedia directly with constraints that prevent tab capture.
      // Allowing browser-tab capture causes an infinite mirror effect because
      // the captured tab contains the <video> showing the capture itself.
      // By restricting to monitor/window only we prevent this entirely for all
      // participants (local AND remote).
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // Prefer monitor or window – NOT browser tab
          // @ts-ignore – displaySurface is valid but not in all TS definitions
          displaySurface: "monitor",
        },
        audio: false,
        // @ts-ignore – these are valid Chrome 107+ constraints
        selfBrowserSurface: "exclude",
        preferCurrentTab: false,
        surfaceSwitching: "exclude",
      } as any)

      const mediaTrack = stream.getVideoTracks()[0]
      if (!mediaTrack) {
        throw new Error("Failed to create screen track")
      }

      // Wrap the raw MediaStreamTrack in a LiveKit LocalVideoTrack so it can
      // be published with the correct source metadata.
      let screenTrack: any
      const LVT = livekit.LocalVideoTrack
      if (LVT) {
        // LiveKit 2.x exposes LocalVideoTrack
        screenTrack = new LVT(mediaTrack, undefined, false)
      } else {
        // Fallback: use createLocalScreenTracks as a factory then swap in our
        // constrained track. This shouldn't normally happen with livekit 2.16.
        screenTrack = mediaTrack
      }

      // Publish with explicit source option
      await roomRef.current.localParticipant.publishTrack(screenTrack, {
        source: livekit.Track.Source.ScreenShare,
        name: "screen_share",
      })

      screenTrackRef.current = screenTrack

      const publishedMediaTrack =
          screenTrack?.mediaStreamTrack ?? screenTrack?.track ?? mediaTrack

      setLocalTracks((prev) => [
        ...prev,
        {
          kind: "video",
          track: publishedMediaTrack,
          sid: screenTrack?.sid ?? "local-screen",
          muted: false,
          source: "screen",
        },
      ])

      // Handle when user stops sharing via browser UI
      mediaTrack.addEventListener("ended", () => {
        stopScreenShare()
      })


      setIsScreenSharing(true);
      status(t("screen_started"));
    } catch (err: any) {
      status(err.message || t("screen_failed"));
    }
  }, [status, isAnyoneSharing]);

  const stopScreenShare = useCallback(() => {
    if (!roomRef.current || !screenTrackRef.current) return;

    const ref = screenTrackRef.current;
    try {
      roomRef.current.localParticipant.unpublishTrack(ref);
      // Stop the track – it might be a LiveKit LocalVideoTrack or a raw
      // MediaStreamTrack depending on which branch was used in startScreenShare.
      if (typeof ref.stop === "function") {
        ref.stop();
      }
      // Also stop the underlying MediaStreamTrack if it's a LiveKit wrapper
      const raw = ref.mediaStreamTrack ?? ref.track;
      if (raw && typeof raw.stop === "function") {
        raw.stop();
      }
    } catch {}

    screenTrackRef.current = null;
    setLocalTracks((prev) => prev.filter((t) => t.source !== "screen"))
    setIsScreenSharing(false);
    status(t("screen_stopped"));
  }, [status]);

  const toggleVolumeMuted = () => {
    setIsVolumeMuted((prev) => {
      const next = !prev;
      // Apply immediately to existing audio elements
      audioElementsRef.current.forEach((audioEl) => {
        try {
          audioEl.muted = next;
        } catch {}
      });
      return next;
    });
  };

  useEffect(() => {
    // Ensure all remote audio elements follow isVolumeMuted
    audioElementsRef.current.forEach((audioEl) => {
      try {
        audioEl.muted = isVolumeMuted;
      } catch {}
    });
  }, [isVolumeMuted]);

  useEffect(() => {
    return () => {
      leave();
    };
  }, []);


  return {
    connectionState,
    localTracks,
    remoteTracks,
    participants,
    micMuted,
    cameraMuted,
    isScreenSharing,
    join,
    leave,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    isVolumeMuted,
    toggleVolumeMuted,
    isAnyoneSharing
  };
}
