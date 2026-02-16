import { useCallback, useEffect, useState } from "react";

import { CallChat } from "@/components/features/call/CallChat";
import { CallControls } from "@/components/features/call/CallControls";
import { CallStatusBadge } from "@/components/features/call/CallStatusBadge";
import { InviteSection } from "@/components/features/call/InviteSection";
import { ParticipantsList } from "@/components/features/call/ParticipantsList";
import RoomName from "@/components/features/call/RoomName";
import StartCall from "@/components/features/call/StartCall";
import { StreamSession } from "@/components/features/call/types";
import { VideoGrid } from "@/components/features/call/VideoGrid";
import { Show } from "@/components/shared/Show";
import AppIcon from "@/components/ui/custom/app-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useUser } from "@/stores/context/user";
import { envs } from "@/constants/envs";
import { sharedIcons } from "@/constants/icons";
import { CALL_SESSION_KEY } from "@/constants/keys";
import { useTranslations } from "@/i18n";

import { useCallChat } from "./hooks/useCallChat";
import { useLiveKit } from "../meet/hooks/useLiveKit";
import { useStreamSession } from "../meet/hooks/useStreamSession";

interface CallDrawerContentProps {
  sessionId?: string;
  className?: string;
  streamSessionAPI: ReturnType<typeof useStreamSession>;
  liveKitAPI: ReturnType<typeof useLiveKit>;
  statusMessage: string;
  setStatusMessage: (msg: string) => void;
  sessionFromUrl: StreamSession | null;
  setSessionFromUrl: (session: StreamSession | null) => void;
}

export function CallDrawerContent({
  className,
  liveKitAPI,
  streamSessionAPI,
  statusMessage,
  setStatusMessage,
  sessionFromUrl,
  setSessionFromUrl,
}: CallDrawerContentProps) {
  const t = useTranslations("call");
  const [displayName, setDisplayName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("video");
  const [isLeaving, setIsLeaving] = useState(false);
  const [isPendingUrlRoom, setIsPendingUrlRoom] = useState(false);
  const { user: userData } = useUser();
  const userProfileImage = userData?.profile_image_url;

  const {
    session,
    createSession,
    getSession,
    endSession,
    getToken,
  } = streamSessionAPI;

  const {
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
    isAnyoneSharing,
  } = liveKitAPI;

  const wsScheme =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "wss"
      : "ws";

  const apiDomain = envs.apiUrl
    .replace(/^https?:\/\//, "")
    .replace(/\/v1\/?$/, "");

  const chatWsUrl = session
    ? `${wsScheme}://${apiDomain}/ws/stream/${session.id}/chat/`
    : "";

  const {
    messages,
    isConnected: chatConnected,
    sendMessage,
  } = useCallChat({
    wsUrl: chatWsUrl,
    enabled: connectionState === "connected" && !!session,
  });

  const handleStartCall = useCallback(async () => {
    setStatusMessage(t("creating_session"));
    const newSession = await createSession();
    if (newSession) {
      setStatusMessage(t("session_created"));
      return newSession;
    }
    return null;
  }, [createSession, t]);

  const handleJoin = useCallback(
    async (name?: string, newSession?: StreamSession) => {
      const sessionToUse = newSession || session;
      if (!sessionToUse) return;

      const tokenData = await getToken(sessionToUse.id, {
        name,
        metadata: {
          profileImage: userProfileImage,
        },
      });
      if (!tokenData) return;

      await join(
        tokenData.livekit_url,
        tokenData.token,
        name,
        userProfileImage,
      );
    },
    [session, getToken, join, userProfileImage],
  );

  useEffect(() => {
    if (sessionFromUrl) {
      setIsPendingUrlRoom(true);
      void handleJoin(undefined, sessionFromUrl)
        .then(() => {
          setSessionFromUrl(null);
        })
        .finally(() => {
          setIsPendingUrlRoom(false);
        });
    }
  }, [sessionFromUrl]);

  const handleLeave = useCallback(async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    leave();
    if (session) {
      await endSession(session.id);
    }
    setIsLeaving(false);
  }, [leave, session, endSession]);



  const handleToggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      void startScreenShare();
    }
  };

  const isConnected = connectionState === "connected";
  const isConnecting = connectionState === "connecting";

  const shareUrl = session
    ? `${envs.siteUrl}?tab=2d_canvas&${CALL_SESSION_KEY}=${session.id}`
    : "";

  return (
    <div className={cn("col  h-full", className)}>
      {/* Status */}
      <div className="spacing-row border-b px-3 py-2">
        <CallStatusBadge
          status={connectionState}
          statusMessage={statusMessage}
        />
        {isConnected && (
          <div className="row gap-1 text-foreground-light">
            <AppIcon icon={sharedIcons.participants} className="h-4 w-4" />
            <span className="text-xs">{participants.length}</span>
          </div>
        )}
      </div>

      <RoomName session={session} />

      <Show>
        <Show.When isTrue={!isConnected && !isConnecting}>
          <StartCall
            getSession={getSession}
            handleJoin={handleJoin}
            handleStartCall={handleStartCall}
            existingSession={session}
            isLeaving={isLeaving}
            isPendingUrlRoom={isPendingUrlRoom}
            displayName={displayName}
            setDisplayName={setDisplayName}
          />
        </Show.When>

        <Show.Else>
          <>
            {/* Invite section */}
            <InviteSection shareUrl={shareUrl} />

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <TabsList className="mx-3 mt-2 grid w-auto grid-cols-3 ">
                <TabsTrigger value="video" className="gap-1.5 text-xs">
                  <AppIcon icon={sharedIcons.video} className="size-3.5" />
                  {t("video")}
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-1.5 text-xs">
                  <AppIcon icon={sharedIcons.chat} className="size-3.5" />
                  {t("chat")}
                </TabsTrigger>
                <TabsTrigger value="participants" className="gap-1.5 text-xs">
                  <AppIcon
                    icon={sharedIcons.participants}
                    className="size-3.5"
                  />
                  {t("participants")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="flex-1 overflow-auto p-3">
                <VideoGrid
                  localTracks={localTracks}
                  remoteTracks={remoteTracks}
                  localName={displayName}
                  micMuted={micMuted}
                  localProfileImage={userProfileImage}
                  isLocalVideoStopped={cameraMuted}
                />
              </TabsContent>

              <TabsContent value="chat" className="flex-1 overflow-hidden">
                <CallChat
                  messages={messages}
                  isConnected={chatConnected}
                  onSendMessage={sendMessage}
                />
              </TabsContent>

              <TabsContent
                value="participants"
                className="flex-1 overflow-hidden"
              >
                <ParticipantsList participants={participants} />
              </TabsContent>
            </Tabs>

            {/*{isConnected && !isTranslatorActive && (*/}
            {/*  <div className="mx-3 mb-2">*/}
            {/*    <Button*/}
            {/*      variant="outline"*/}
            {/*      className="w-full gap-2 bg-transparent"*/}
            {/*      onClick={handleStartTranslator}*/}
            {/*    >*/}
            {/*      <AppIcon icon={sharedIcons.translate} className="h-4 w-4" />*/}
            {/*      {t("start_translator")}*/}
            {/*    </Button>*/}
            {/*  </div>*/}
            {/*)}*/}

            {/* Controls */}
            <CallControls
              micMuted={micMuted}
              cameraMuted={cameraMuted}
              isScreenSharing={isScreenSharing}
              isConnected={isConnected}
              isAnyoneSharing={isAnyoneSharing}
              onToggleMic={toggleMic}
              onToggleCamera={toggleCamera}
              onToggleScreenShare={handleToggleScreenShare}
              onLeave={handleLeave}
              className="mx-3 mb-3"
            />
          </>
        </Show.Else>
      </Show>
    </div>
  );
}
