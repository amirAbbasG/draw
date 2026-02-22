import { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  LocalVideoTrack,
  createLocalTracks,
  type LocalTrack as LKLocalTrack,
  type RemoteTrack as LKRemoteTrack,
  type RemoteTrackPublication,
  type RemoteParticipant,
  type Participant as LKParticipant,
  type LocalTrackPublication,
} from "livekit-client";

import type {
  LocalTrack,
  Participant,
  RemoteTrack,
  ConnectionState,
} from "@/components/features/call/types";
import { useTranslations } from "@/i18n";
import { useUser } from "@/stores/context/user";

interface UseLiveKitOptions {
  onStatusChange?: (status: string) => void;
}

const getMetadata = (participant: LKParticipant) => {
  const raw = participant?.metadata;
  if (!raw || typeof raw !== "string" || raw.trim() === "") return undefined;

  try {
    const metadata = JSON.parse(raw);
    return {
      profileImage: metadata?.profileImage || metadata?.profile_image_url,
      username: metadata?.username || participant.identity,
    };
  } catch {
    return {
      profileImage: undefined,
      username: participant.identity,
    };
  }
};

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
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);
  const { user: userData } = useUser();

  const isAnyoneSharing = remoteTracks.some(
      (t) => t.kind === "video" && t.source === "screen",
  );

  const roomRef = useRef<Room | null>(null);
  const screenTrackRef = useRef<LocalVideoTrack | null>(null);
  const localTracksRef = useRef<LKLocalTrack[]>([]);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const status = useCallback(
      (msg: string) => {
        onStatusChange?.(msg);
      },
      [onStatusChange],
  );

  const join = useCallback(
      async (
          livekitUrl: string,
          token: string,
          displayName?: string,
          profileImage?: string,
          options?: { publishVideo?: boolean },
      ) => {
        try {
          setConnectionState("connecting");
          status(t("loading"));

          if (!livekitUrl) {
            throw new Error(t("url_not_configured"));
          }

          status(t("connecting"));
          const room = new Room();
          roomRef.current = room;

          // --- Track Subscribed ---
          room.on(
              RoomEvent.TrackSubscribed,
              (
                  track: LKRemoteTrack,
                  pub: RemoteTrackPublication,
                  participant: RemoteParticipant,
              ) => {
                if (track.kind !== "video" && track.kind !== "audio") return;

                const isScreenShare =
                    pub.source === Track.Source.ScreenShare ||
                    track.source === Track.Source.ScreenShare;

                const mediaStreamTrack = track.mediaStreamTrack;

                if (track.kind === "audio" && mediaStreamTrack) {
                  const audioEl = document.createElement("audio");
                  audioEl.autoplay = true;
                  audioEl.setAttribute("playsinline", "true");
                  audioEl.srcObject = new MediaStream([mediaStreamTrack]);
                  audioEl.style.display = "none";
                  document.body.appendChild(audioEl);
                  audioEl.play().catch(() => {});
                  audioElementsRef.current.set(track.sid, audioEl);
                }

                setRemoteTracks((prev) => [
                  ...prev,
                  {
                    kind: track.kind as "audio" | "video",
                    participantIdentity: participant.identity,
                    participantName: participant.name,
                    participantProfileImage: getMetadata(participant)
                        ?.profileImage,
                    track: mediaStreamTrack,
                    sid: track.sid,
                    source: isScreenShare ? "screen" : "camera",
                    isMuted: pub.isMuted || false,
                  },
                ]);
              },
          );

          // --- Track Unsubscribed ---
          room.on(RoomEvent.TrackUnsubscribed, (track: LKRemoteTrack) => {
            const audioEl = audioElementsRef.current.get(track.sid);
            if (audioEl) {
              audioEl.pause();
              audioEl.srcObject = null;
              audioEl.remove();
              audioElementsRef.current.delete(track.sid);
            }
            setRemoteTracks((prev) => prev.filter((t) => t.sid !== track.sid));
          });

          // --- Track Muted ---
          room.on(
              RoomEvent.TrackMuted,
              (pub: LocalTrackPublication | RemoteTrackPublication) => {
                const mutedAudioEl = audioElementsRef.current.get(pub.trackSid);
                if (mutedAudioEl) {
                  mutedAudioEl.muted = true;
                }
                setRemoteTracks((prev) =>
                    prev.map((t) =>
                        t.sid === pub.trackSid ? { ...t, isMuted: true } : t,
                    ),
                );
              },
          );

          // --- Track Unmuted ---
          room.on(
              RoomEvent.TrackUnmuted,
              (pub: LocalTrackPublication | RemoteTrackPublication) => {
                const unmutedAudioEl = audioElementsRef.current.get(pub.trackSid);
                if (unmutedAudioEl) {
                  unmutedAudioEl.muted = false;
                }
                setRemoteTracks((prev) =>
                    prev.map((t) =>
                        t.sid === pub.trackSid ? { ...t, isMuted: false } : t,
                    ),
                );
              },
          );

          // --- Participant Connected ---
          room.on(
              RoomEvent.ParticipantConnected,
              (participant: RemoteParticipant) => {
                const meta = getMetadata(participant);
                setParticipants((prev) => [
                  ...prev,
                  {
                    identity: participant.identity,
                    name: participant.name,
                    profileImage: meta?.profileImage,
                    username: meta?.username ?? participant.identity,
                    isLocal: false,
                    isSpeaking: false,
                  },
                ]);
                status(
                    `${participant.name || participant.identity} joined`,
                );
              },
          );

          // --- Participant Disconnected ---
          room.on(
              RoomEvent.ParticipantDisconnected,
              (participant: RemoteParticipant) => {
                setParticipants((prev) =>
                    prev.filter((p) => p.identity !== participant.identity),
                );
                status(
                    `${participant.name || participant.identity} left`,
                );
              },
          );

          // --- Active Speakers Changed (isSpeaking) ---
          room.on(
              RoomEvent.ActiveSpeakersChanged,
              (speakers: LKParticipant[]) => {
                const speakingIdentities = new Set(
                    speakers.map((s) => s.identity),
                );
                setParticipants((prev) =>
                    prev.map((p) => ({
                      ...p,
                      isSpeaking: speakingIdentities.has(p.identity),
                    })),
                );
              },
          );

          // --- Connect ---
          await room.connect(livekitUrl, token);
          status(t("publishing"));

          const publishVideo = options?.publishVideo !== false;
          const tracks = await createLocalTracks({
            audio: true,
            video: publishVideo,
          });

          localTracksRef.current = tracks;

          const newLocalTracks: LocalTrack[] = [];
          for (const track of tracks) {
            await room.localParticipant.publishTrack(track);
            newLocalTracks.push({
              kind: track.kind as "audio" | "video",
              track: track.mediaStreamTrack,
              sid: track.sid,
              muted: false,
              source: (track.source ?? undefined) as LocalTrack["source"],
            });
          }

          setLocalTracks(newLocalTracks);
          setCameraMuted(!publishVideo);

          // Set initial participants
          const localMeta = getMetadata(room.localParticipant);
          const initialParticipants: Participant[] = [
            {
              identity: room.localParticipant.identity,
              name: room.localParticipant.name || displayName,
              profileImage:
                  profileImage ||
                  userData.profile_image_url ||
                  localMeta?.profileImage,
              username:
                  userData.username || localMeta?.username || room.localParticipant.identity,
              isLocal: true,
              isSpeaking: false,
            },
          ];

          room.remoteParticipants.forEach((participant: RemoteParticipant) => {
            const meta = getMetadata(participant);
            initialParticipants.push({
              identity: participant.identity,
              name: participant.name,
              profileImage: meta?.profileImage,
              username: meta?.username ?? participant.identity,
              isLocal: false,
              isSpeaking: participant.isSpeaking,
            });
          });

          setParticipants(initialParticipants);
          setConnectionState("connected");
          status("connected");
        } catch (err: unknown) {
          setConnectionState("disconnected");
          const message =
              err instanceof Error ? err.message : t("connection_failed");
          status(message);
          throw err;
        }
      },
      [status, t, userData],
  );

  const leave = useCallback(() => {
    // Stop screen share track
    if (screenTrackRef.current) {
      const ref = screenTrackRef.current;
      try {
        void roomRef.current?.localParticipant?.unpublishTrack(ref);
        ref.stop();
      } catch {}
      screenTrackRef.current = null;
    }

    // Stop all local tracks
    for (const track of localTracksRef.current) {
      try {
        void roomRef.current?.localParticipant?.unpublishTrack(track);
        track.stop();
      } catch {}
    }
    localTracksRef.current = [];

    // Clean up all remote audio elements
    audioElementsRef.current.forEach((audioEl) => {
      audioEl.pause();
      audioEl.srcObject = null;
      audioEl.remove();
    });
    audioElementsRef.current.clear();

    // Disconnect room
    if (roomRef.current) {
      try {
        void roomRef.current.disconnect();
      } catch {}
      roomRef.current = null;
    }

    setLocalTracks([]);
    setRemoteTracks([]);
    setParticipants([]);
    setMicMuted(false);
    setCameraMuted(false);
    setIsScreenSharing(false);
    setConnectionState("disconnected");
    status("Disconnected");
  }, [status]);

  const toggleMic = useCallback(async () => {
    const track = localTracksRef.current.find(
        (t: LKLocalTrack) => t.kind === "audio",
    );
    if (!track) return;

    try {
      if (micMuted) {
        await track.unmute();
      } else {
        await track.mute();
      }

      setLocalTracks((prev) =>
          prev.map((t) =>
              t.kind === "audio"
                  ? { ...t, track: track.mediaStreamTrack }
                  : t,
          ),
      );

      setMicMuted(!micMuted);
    } catch (err: unknown) {
      const message =
          err instanceof Error ? err.message : t("mic_toggle_failed");
      status(message);
    }
  }, [micMuted, status, t]);

  const toggleCamera = useCallback(async () => {
    const track = localTracksRef.current.find(
        (t: LKLocalTrack) => t.kind === "video",
    );
    if (!track) return;

    try {
      if (cameraMuted) {
        await track.unmute();
      } else {
        await track.mute();
      }

      setLocalTracks((prev) =>
          prev.map((t) =>
              t.kind === "video" && t.source !== "screen"
                  ? { ...t, track: track.mediaStreamTrack }
                  : t,
          ),
      );

      setCameraMuted(!cameraMuted);
    } catch (err: unknown) {
      const message =
          err instanceof Error ? err.message : t("camera_toggle_failed");
      status(message);
    }
  }, [cameraMuted, status, t]);

  const startScreenShare = useCallback(async () => {
    if (!roomRef.current) return;

    if (!navigator.mediaDevices?.getDisplayMedia) {
      status("Screen sharing is not supported on this device");
      return;
    }

    if (isAnyoneSharing) {
      status("Someone else is already sharing their screen");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
        },
        audio: false,
        selfBrowserSurface: "exclude",
        preferCurrentTab: false,
        surfaceSwitching: "exclude",
      } as DisplayMediaStreamOptions);

      const mediaTrack = stream.getVideoTracks()[0];
      if (!mediaTrack) {
        throw new Error("Failed to create screen track");
      }

      const screenTrack = new LocalVideoTrack(mediaTrack, undefined, false);

      await roomRef.current.localParticipant.publishTrack(screenTrack, {
        source: Track.Source.ScreenShare,
        name: "screen_share",
      });

      screenTrackRef.current = screenTrack;

      setLocalTracks((prev) => [
        ...prev,
        {
          kind: "video",
          track: screenTrack.mediaStreamTrack,
          sid: screenTrack.sid ?? "local-screen",
          muted: false,
          source: "screen",
        },
      ]);

      // Handle when user stops sharing via browser UI
      mediaTrack.addEventListener("ended", () => {
        stopScreenShare();
      });

      setIsScreenSharing(true);
      status(t("screen_started"));
    } catch (err: unknown) {
      const message =
          err instanceof Error ? err.message : t("screen_failed");
      status(message);
    }
  }, [status, isAnyoneSharing, t]);

  const stopScreenShare = useCallback(() => {
    if (!roomRef.current || !screenTrackRef.current) return;

    const ref = screenTrackRef.current;
    try {
      void roomRef.current.localParticipant.unpublishTrack(ref);
      ref.stop();
    } catch {}

    screenTrackRef.current = null;
    setLocalTracks((prev) => prev.filter((t) => t.source !== "screen"));
    setIsScreenSharing(false);
    status(t("screen_stopped"));
  }, [status, t]);

  const toggleVolumeMuted = useCallback(() => {
    setIsVolumeMuted((prev) => {
      const next = !prev;
      audioElementsRef.current.forEach((audioEl) => {
        try {
          audioEl.muted = next;
        } catch {}
      });
      return next;
    });
  }, []);

  useEffect(() => {
    audioElementsRef.current.forEach((audioEl) => {
      try {
        audioEl.muted = isVolumeMuted;
      } catch {}
    });
  }, [isVolumeMuted]);

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
    isAnyoneSharing,
  };
}
