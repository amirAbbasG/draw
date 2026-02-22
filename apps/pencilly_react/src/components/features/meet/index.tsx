import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react";

import { createPortal } from "react-dom";

import { CallView } from "@/components/features/meet/call";
import StartCall from "@/components/features/meet/start";
import StatusBadge from "@/components/features/meet/StatusBadge";
import { createTemConversation } from "@/components/features/meet/utils";
import AppDrawer from "@/components/shared/AppDrawer";
import DynamicButton from "@/components/shared/DynamicButton";
import RenderIf from "@/components/shared/RenderIf";
import { Show } from "@/components/shared/Show";
import { isEmpty } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { CALL_SESSION_KEY } from "@/constants/keys";
import { useTranslations } from "@/i18n";

import type { CallRoom } from "./call/types";
import Chat from "./chat";
import ConversationPage from "./conversation";
import { useChatMessages } from "./hooks/useChatMessages";
import { useConversationApi } from "./hooks/useConversationApi";
import { useConversationMembers } from "./hooks/useConversationMembers";
import { useConversations } from "./hooks/useConversations";
import { useConversationWs } from "./hooks/useConversationWs";
import { useMeetCall } from "./hooks/useMeetCall";
import { useReadReceipts } from "./hooks/useReadReceipts";
import type {
  CallType,
  Conversation,
  ConversationEvent,
  MeetUser,
  WsServerMessage,
} from "./types";

interface MeetDrawerProps {
  Trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MeetDrawer: FC<MeetDrawerProps> = ({
  Trigger,
  open: controlledOpen,
  onOpenChange,
}) => {
  const t = useTranslations("meet");

  const [internalOpen, setInternalOpen] = useState(false);
  const [tempChat, setTempChat] = useState<Conversation | null>(null);
  const [showCallView, setShowCallView] = useState(false);
  const [isConnectingCall, setIsConnectingCall] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  // ─── API ────────────────────────────────────────────────
  const conversationApi = useConversationApi();

  // ─── Conversations ──────────────────────────────────────
  const {
    conversations,
    isLoading: isLoadingConversations,
    handleWsMessage: handleConversationsWs,
    updateConversation,
    removeConversation,
    activeConversation,
    setActiveConversation,
    handleOpenChat,
    setConversations,
  } = useConversations(setIsOpen);

  // ─── Members for active conversation ───────────────────
  const {
    allMembers: apiMembers,
    removeMember,
    handleMembersMessageEvent,
  } = useConversationMembers(activeConversation?.id ?? null);

  const startChatWithUser = (user: MeetUser, me?: MeetUser) => {
    const existConv = conversations.find(c => c.id === user.convesation_id);
    if (existConv) {
      setActiveConversation(existConv);
      return;
    }

    const currentUser = me || apiMembers?.find(m => m.isCurrentUser)!;
    const tempConv = createTemConversation(user, currentUser);
    setTempChat(tempConv);
    chatMessages.clear();
    setActiveConversation(null);
  };

  useEffect(() => {
    (async () => {
      if (!activeConversation && !!tempChat) {
        const usrIds = tempChat.members
          .filter(m => !m.isCurrentUser)
          .map(m => Number(m.id));
        const data = await conversationApi.createConversation(
          tempChat.title,
          usrIds,
        );
        setActiveConversation(data);
        setConversations(prev => [
          data!,
          ...prev.filter(c => c.id !== tempChat.id && c.id !== data.id),
        ]);
        setTempChat(null);
      }
    })();
  }, [tempChat, activeConversation]);

  // ─── Call ───────────────────────────────────────────────
  const meetCall = useMeetCall({
    onCallAccepted: () => {
      setShowCallView(true);
    },
  });

  // ─── WebSocket connection (declared early, handler uses refs) ──
  const chatMessagesRef = useRef<ReturnType<typeof useChatMessages>>(null!);
  const readReceiptsRef = useRef<ReturnType<typeof useReadReceipts>>(null!);

  // ─── WS handler that dispatches to all sub-hooks ───────
  const handleWsMessage = useCallback(
    (message: WsServerMessage) => {
      console.log("Received WS message:", message);
      // Dispatch to sub-handlers (unchanged)
      handleConversationsWs(message);
      meetCall.handleWsMessage(message);
      handleMembersMessageEvent(message as ConversationEvent);
      chatMessagesRef.current?.handleWsMessage(message);
      readReceiptsRef.current?.handleWsMessage(message);
    },
    [handleConversationsWs, meetCall, handleMembersMessageEvent],
  );

  // ─── WebSocket connection ──────────────────────────────
  const conversationWs = useConversationWs({
    enabled: true,
    onMessage: handleWsMessage,
  });

  const connectionState =
    conversationWs.connectionState === "connected"
      ? ("connected" as const)
      : conversationWs.connectionState === "connecting"
        ? ("connecting" as const)
        : ("disconnected" as const);

  // ─── Chat messages ─────────────────────────────────────
  const chatMessages = useChatMessages({
    conversationId: activeConversation?.id ?? null,
    wsSendMessage: conversationWs.sendMessage,
  });
  chatMessagesRef.current = chatMessages;

  // ─── Read receipts ────────────────────────────────────
  readReceiptsRef.current = useReadReceipts({
    conversationId: activeConversation?.id ?? null,
    wsMarkRead: conversationWs.markRead,
  });

  // ─── Handlers ─────────────────────────────────────────

  const handleBackToList = useCallback(() => {
    setActiveConversation(null);
    chatMessages.clear();
    setTempChat(null);
  }, [chatMessages]);

  const handleMuteToggle = useCallback(
    async (conversation: Conversation) => {
      const newMuted = !conversation.muted;
      const success = await conversationApi.changeConversationMuted(
        conversation.id,
        newMuted,
      );
      if (success) {
        updateConversation(conversation.id, { muted: newMuted });
        if (activeConversation.id === conversation.id) {
          setActiveConversation(prev =>
            prev ? { ...prev, muted: newMuted } : null,
          );
        }
      }
    },
    [activeConversation, updateConversation, conversationApi],
  );

  // Start call from StartCall page (no conversation_id)
  const handleStartNewCall = useCallback(
    async (callType?: CallType) => {
      setIsConnectingCall(true);
      const session = await meetCall.startCall(undefined, callType);
      setIsConnectingCall(false);
      if (session) {
        setShowCallView(true);
      }
      return session;
    },
    [meetCall],
  );

  // Join call from StartCall page
  const handleJoinCall = useCallback(
    async (sessionId: string, callType?: CallType) => {
      await meetCall.joinCall(sessionId, callType);
      setShowCallView(true);
    },
    [meetCall],
  );

  const handleConversationCall = useCallback(
    async (conversation: Conversation, callType: CallType) => {
      setIsConnectingCall(true);
      setShowCallView(true);
      const participants =
        activeConversation && !isEmpty(apiMembers)
          ? apiMembers.filter(m => !m.isCurrentUser)
          : [
              {
                id: "group",
                avatarUrl: conversation.profile_image_url,
                name: conversation?.title || "Group Call",
                username: conversation?.id,
              },
            ];
      meetCall.addPending(participants);
      const session = await meetCall.startCall(conversation.id, callType);

      setIsConnectingCall(false);
      if (!session) {
        setShowCallView(false);
        return;
      }
    },
    [meetCall, apiMembers],
  );

  const handleInviteUser = useCallback(
    async (
      user: MeetUser,
      inviteToCal: boolean = true,
      conversationId?: string,
      includeChat?: number,
    ) => {
      const cId = conversationId || meetCall.activeConversationId;
      if (cId) {
        if (inviteToCal) {
          meetCall.addPending([user]);
        }
        await conversationApi.addToConversation(
          cId,
          +user.id,
          inviteToCal,
          includeChat,
        );
      }
    },
    [activeConversation, conversationApi],
  );

  const handleEndCall = useCallback(async () => {
    await meetCall.endCall();
    setShowCallView(false);
  }, [meetCall]);

  const onOpenChatFromCall = useCallback(() => {
    setIsOpen(true);
    if (conversations.length > 0) {
      setActiveConversation(conversations[0]);
    }
  }, [setIsOpen, conversations]);

  // ─── Leave / Delete handlers ──────────────────────────
  const handleLeaveConversation = useCallback(
    async (conversation: Conversation) => {
      const success = await conversationApi.leaveConversation(conversation.id);
      if (success) {
        removeConversation(conversation.id);
        if (activeConversation?.id === conversation.id) {
          handleBackToList();
        }
      }
    },
    [conversationApi, removeConversation, activeConversation, chatMessages],
  );

  const handleDeleteForEveryone = useCallback(
    async (conversation: Conversation) => {
      const success = await conversationApi.deleteConversation(conversation.id);
      if (success) {
        removeConversation(conversation.id);
        if (activeConversation?.id === conversation.id) {
          handleBackToList();
        }
      }
    },
    [conversationApi, removeConversation, activeConversation, chatMessages],
  );

  const handleKickFromConversation = useCallback(
    async (userId: string) => {
      if (activeConversation) {
        const success = await conversationApi.kickFromConversation(
          activeConversation.id,
          userId,
        );
        if (success) {
          removeMember(userId);
        }
      }
    },
    [conversationApi, removeMember, activeConversation],
  );

  // ─── Build CallView props ─────────────────────────────

  const room: CallRoom = useMemo(
    () => ({
      id: meetCall.activeSession?.id ?? "",
      link: meetCall.activeSession
        ? `${window.location.origin}?${CALL_SESSION_KEY}=${meetCall.activeSession.id}`
        : "",
    }),
    [meetCall.activeSession],
  );

  // Dynamic call title
  const callTitle = useMemo(() => {
    if (meetCall.activeConversationId) {
      const conv = conversations.find(
        c => c.id === meetCall.activeConversationId,
      );
      if (conv?.title) return `${conv.title} - Meet`;
    }
    return "Pencilly Meet";
  }, [meetCall.activeConversationId, conversations]);

  const appLayoutMain =
    typeof document !== "undefined"
      ? document.getElementById("app-layout-main")
      : null;

  const defaultTrigger = (
    <DynamicButton
      icon={sharedIcons.call}
      title="Meet"
      variant="outline"
      hideLabel
    />
  );

  return (
    <>
      {/* Call View (portal into main layout) */}
      {showCallView &&
        appLayoutMain &&
        createPortal(
          <CallView
            onInviteUser={(user, includeChat) =>
              handleInviteUser(
                user,
                true,
                meetCall.activeConversationId,
                includeChat,
              )
            }
            conversation={conversations.find(c => c.id === meetCall.activeConversationId) ?? null}
            participants={meetCall.participants}
            room={room}
            title={callTitle}
            startTime={Date.now()}
            isSidebarOpen={isOpen}
            activeConversationId={meetCall.activeConversationId}
            isMicMuted={meetCall.liveKitAPI.micMuted}
            isCameraMuted={meetCall.liveKitAPI.cameraMuted}
            isScreenSharing={meetCall.liveKitAPI.isScreenSharing}
            onToggleMic={meetCall.liveKitAPI.toggleMic}
            onToggleCamera={meetCall.liveKitAPI.toggleCamera}
            isVolumeMuted={meetCall.liveKitAPI.isVolumeMuted}
            onToggleVolume={meetCall.liveKitAPI.toggleVolumeMuted}
            pendingParticipants={meetCall.pendingParticipants}
            isConnecting={isConnectingCall}
            onToggleScreenShare={() => {
              if (meetCall.liveKitAPI.isScreenSharing) {
                meetCall.liveKitAPI.stopScreenShare();
              } else {
                void meetCall.liveKitAPI.startScreenShare();
              }
            }}
            onReaction={conversationWs.sendReaction}
            onOpenChat={onOpenChatFromCall}
            onEndCall={handleEndCall}
            onClose={() => setShowCallView(false)}
            isOpenSidebar={isOpen}
          />,
          appLayoutMain,
        )}

      <AppDrawer
        open={isOpen}
        setOpen={setIsOpen}
        title="Call"
        Trigger={Trigger ?? defaultTrigger}
        contentClassName="overflow-x-hidden"
        modal={false}
      >
        {/* Header bar */}
        <div className="spacing-row gap-2 px-3 py-2 border-y">
          <RenderIf
            isTrue={!activeConversation && !isEmpty(conversations) && !tempChat}
          >
            <DynamicButton
              icon="hugeicons:call-add"
              title={t("new_call")}
              variant="default"
              className="!h-7 !text-xs"
              onClick={() => handleStartNewCall()}
              isPending={isConnectingCall}
            />
          </RenderIf>
          <StatusBadge className="ms-auto" status={connectionState} />
        </div>

        <Show>
          {/* No conversations: show StartCall */}
          <Show.When
            isTrue={
              isEmpty(conversations) && !isLoadingConversations && !tempChat
            }
          >
            <StartCall
              handleStartCall={handleStartNewCall}
              handleJoin={handleJoinCall}
              connectionState={connectionState}
            />
          </Show.When>

          {/* Active conversation: show Chat */}
          <Show.When isTrue={!!activeConversation || !!tempChat}>
            <Chat
              conversation={activeConversation! || tempChat}
              messages={chatMessages.messages || []}
              typingUsers={[]}
              onBack={handleBackToList}
              onJoinCall={handleJoinCall}
              isTemp={!activeConversation && !!tempChat}
              onSendMessage={chatMessages.sendMessage}
              onEditMessage={chatMessages.editMessage}
              onDeleteMessage={chatMessages.deleteMessage}
              onCall={type => {
                if (activeConversation) {
                  void handleConversationCall(activeConversation, type);
                }
              }}
              onDeleteMember={handleKickFromConversation}
              className="flex-1 overflow-hidden"
              onMuteToggle={handleMuteToggle}
              handeInviteUser={handleInviteUser}
              isInCall={!!meetCall.activeConversationId}
              chatWithMember={startChatWithUser}
              isLoadingMessages={chatMessages.isLoading}
              onLeaveGroup={() =>
                activeConversation &&
                handleLeaveConversation(activeConversation)
              }
              onDeleteForEveryone={() =>
                activeConversation &&
                handleDeleteForEveryone(activeConversation)
              }
              apiMembers={apiMembers || []}
              onMarkAsRead={readReceiptsRef.current?.markAsRead}
            />
          </Show.When>

          {/* Conversation list */}
          <Show.Else>
            <ConversationPage
              conversations={conversations}
              isLoading={isLoadingConversations}
              onCall={handleConversationCall}
              onOpenChat={handleOpenChat}
              onLeave={handleLeaveConversation}
              onDelete={handleDeleteForEveryone}
              onMute={handleMuteToggle}
              className="flex-1 overflow-x-hidden"
            />
          </Show.Else>
        </Show>
      </AppDrawer>
    </>
  );
};

export default MeetDrawer;
