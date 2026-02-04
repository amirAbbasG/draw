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

  const isAnyoneSharing = remoteTracks.some((t) => t.kind === "video" && t.source === "screen")


  const roomRef = useRef<any>(null);
  const livekitRef = useRef<any>(null);
  const screenTrackRef = useRef<any>(null);
  const localTracksRef = useRef<any[]>([]);

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

  // Helper to parse participant metadata for profile image
  const getProfileImageFromMetadata = (participant: any): string | undefined => {
    // Try multiple places the SDK might put metadata
    const raw = participant?.metadata ?? participant?.info?.metadata;
    if (!raw || typeof raw !== "string" || raw.trim() === "") return undefined;

    try {
      const metadata = JSON.parse(raw);
      return metadata?.profileImage || metadata?.profile_image_url;
    } catch {
      // Not JSON or invalid, ignore
      return undefined;
    }
  };


  const join = useCallback(
      async (livekitUrl: string, token: string, displayName?: string, profileImage?: string) => {
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

          // ✅ Set up all event listeners BEFORE connecting
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

                  setRemoteTracks(prev => [
                    ...prev,
                    {
                      kind: track.kind,
                      participantIdentity: participant.identity,
                      participantName: participant.name,
                      participantProfileImage: getProfileImageFromMetadata(participant),
                      track: track.mediaStreamTrack || track.track,
                      sid: track.sid,
                      source: isScreenShare ? "screen" : "camera",
                      isMuted: pub?.isMuted || false,
                    },
                  ]);
                }
              },
          );

          room.on(livekit.RoomEvent.TrackUnsubscribed, (track: any) => {
            setRemoteTracks(prev => prev.filter(t => t.sid !== track.sid));
          });

          // Track muted/unmuted events
          room.on(livekit.RoomEvent.TrackMuted, (pub: any, _participant: any) => {
            setRemoteTracks(prev =>
                prev.map(t =>
                    t.sid === pub.trackSid
                        ? { ...t, isMuted: true }
                        : t
                )
            );
          });

          room.on(livekit.RoomEvent.TrackUnmuted, (pub: any, _participant: any) => {
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

          // ✅ Connect to the room
          await room.connect(livekitUrl, token);

          status(t("publishing"));
          const tracks = await livekit.createLocalTracks({
            audio: true,
            video: true,
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
            });
          }

          setLocalTracks(newLocalTracks);

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

          // ✅ Set connected state LAST
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
      try {
        roomRef.current?.localParticipant?.unpublishTrack(screenTrackRef.current)
        screenTrackRef.current.stop()
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
              t.kind === "video"
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

    if (isAnyoneSharing) {
      status("Someone else is already sharing their screen")
      return
    }
    const livekit = livekitRef.current

    try {
      // Use LiveKit's createLocalScreenTracks which properly sets the source
      const screenTracks = await livekit.createLocalScreenTracks({
        audio: false,
        video: true,
      })

      const screenTrack = screenTracks.find((t: any) => t.kind === "video")
      if (!screenTrack) {
        throw new Error("Failed to create screen track")
      }

      // Publish with explicit source option
      await roomRef.current.localParticipant.publishTrack(screenTrack, {
        source: livekit.Track.Source.ScreenShare,
        name: "screen_share",
      })

      screenTrackRef.current = screenTrack

      const mediaTrack = screenTrack.mediaStreamTrack || screenTrack.track
      setLocalTracks((prev) => [
        ...prev,
        {
          kind: "video",
          track: mediaTrack,
          sid: screenTrack.sid,
          muted: false,
          source: "screen",
        },
      ])

      // Handle when user stops sharing via browser UI
      mediaTrack?.addEventListener("ended", () => {
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

    try {
      roomRef.current.localParticipant.unpublishTrack(screenTrackRef.current);
      screenTrackRef.current.stop();
    } catch {}

    screenTrackRef.current = null;
    setLocalTracks((prev) => prev.filter((t) => t.source !== "screen"))
    setIsScreenSharing(false);
    status(t("screen_stopped"));
  }, [status]);

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
    isAnyoneSharing
  };
}
