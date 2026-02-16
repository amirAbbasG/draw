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
import { showMessageNotification } from "@/components/features/meet/notification";
import StartCall from "@/components/features/meet/start";
import StatusBadge from "@/components/features/meet/StatusBadge";
import AppDrawer from "@/components/shared/AppDrawer";
import DynamicButton from "@/components/shared/DynamicButton";
import RenderIf from "@/components/shared/RenderIf";
import { Show } from "@/components/shared/Show";
import { isEmpty } from "@/lib/utils";
import { useUser } from "@/stores/context/user";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { CallOwner, CallRoom } from "./call/types";
import Chat from "./chat";
import ConversationPage from "./conversation";
import { useChatMessages } from "./hooks/useChatMessages";
import { useConversationApi } from "./hooks/useConversationApi";
import { useConversationMembers } from "./hooks/useConversationMembers";
import { useConversations } from "./hooks/useConversations";
import { useConversationWs } from "./hooks/useConversationWs";
import { useMeetCall } from "./hooks/useMeetCall";
import { useReadReceipts } from "./hooks/useReadReceipts";
import type { CallType, Conversation, WsServerMessage } from "./types";

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
  const { user } = useUser();

  const [internalOpen, setInternalOpen] = useState(false);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [showCallView, setShowCallView] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  // Track active conversation ID for WS message filtering
  const activeConvIdRef = useRef<string | null>(null);
  activeConvIdRef.current = activeConversation?.id ?? null;
  const processedEventKeysRef = useRef<Map<string, number>>(new Map());
  const DEDUP_MS = 30_000;

  useEffect(() => {
    return () => {
      processedEventKeysRef.current.clear();
    };
  }, []);

  // ─── API ────────────────────────────────────────────────
  const conversationApi = useConversationApi();

  // ─── Conversations ──────────────────────────────────────
  const {
    conversations,
    isLoading: isLoadingConversations,
    handleWsMessage: handleConversationsWs,
    updateConversation,
    removeConversation,
  } = useConversations();

  // ─── Members for active conversation ───────────────────
  const { allMembers: apiMembers, mentionMembers } = useConversationMembers(
    activeConversation?.id ?? null,
  );

  // ─── Call ───────────────────────────────────────────────
  const meetCall = useMeetCall({
    onCallAccepted: () => {
      setShowCallView(true);
    },
  });

  // ─── WebSocket connection (declared early, handler uses refs) ──
  const chatMessagesRef = useRef<ReturnType<typeof useChatMessages>>(null!);
  const readReceiptsRef = useRef<ReturnType<typeof useReadReceipts>>(null!);
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  // ─── WS handler that dispatches to all sub-hooks ───────
  const handleWsMessage = useCallback(
    (message: WsServerMessage) => {
      // Top-level dedupe for conversation:event messages
      if (message.type === "conversation:event") {
        const convEvent = message as any;
        const ev = convEvent.event ?? {};
        const sessionId =
          ev.payload?.payload?.sessionId ?? ev.payload?.sessionId ?? undefined;
        const eventId = ev.id ?? convEvent.eventId ?? undefined;

        let key = "evt:";
        if (sessionId) key = `session:${sessionId}`;
        else if (eventId) key = `id:${eventId}`;
        else
          key = `type:${ev.type ?? ev.subtype ?? "unknown"}:conv:${convEvent.conversationId ?? "global"}`;

        const now = Date.now();
        const last = processedEventKeysRef.current.get(key);
        if (last && now - last < DEDUP_MS) {
          console.debug("Skipping duplicate top-level WS event", key);
          return;
        }
        processedEventKeysRef.current.set(key, now);

        // Prune old entries
        processedEventKeysRef.current.forEach((ts, k) => {
          if (now - ts > DEDUP_MS * 2) processedEventKeysRef.current.delete(k);
        });
      }

      // Dispatch to sub-handlers (unchanged)
      handleConversationsWs(message);
      meetCall.handleWsMessage(message);
      chatMessagesRef.current?.handleWsMessage(message);
      readReceiptsRef.current?.handleWsMessage(message);

      // Handle message notifications (only when not viewing that conversation)
      if (message.type === "conversation:event") {
        const convEvent = message as any;
        const { event } = convEvent;

        if (
          event.type === "message" &&
          event.senderUserId !== user?.id &&
          convEvent.conversationId !== activeConvIdRef.current
        ) {
          showMessageNotification(
            {
              senderName: event.actor?.name ?? "Unknown",
              senderAvatarUrl: event.actor?.profileImageUrl ?? undefined,
              messagePreview: event.body ?? "",
              conversationId: convEvent.conversationId,
            },
            convId => {
              const conv = conversationsRef.current.find(c => c.id === convId);
              if (conv) {
                setActiveConversation(conv);
                setIsOpen(true);
              }
            },
          );
        }

        // Handle incoming reactions from other users (custom WS event)
        if (event.type === "activity" && event.subtype === "reaction") {
          // This would be handled by CallView's reaction display
        }
      }
    },
    [handleConversationsWs, meetCall, user?.id, setIsOpen],
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

  const handleOpenChat = useCallback(
    (conversation: Conversation) => {
      setActiveConversation(conversation);
      // Reset unseen count when opening
      updateConversation(conversation.id, { unseenCount: 0 });
    },
    [updateConversation],
  );

  const handleBackToList = useCallback(() => {
    setActiveConversation(null);
    chatMessages.clear();
  }, [chatMessages]);

  const handleSendMessage = useCallback(
    (text: string, replyToId?: string) => {
      chatMessages.sendMessage(text, replyToId);
    },
    [chatMessages],
  );

  const handleEditMessage = useCallback(
    (eventId: string, newText: string) => {
      void chatMessages.editMessage(eventId, newText);
    },
    [chatMessages],
  );

  const handleDeleteMessage = useCallback(
    (eventId: string) => {
      void chatMessages.deleteMessage(eventId);
    },
    [chatMessages],
  );

  const handleTitleEdit = useCallback(
    (newTitle: string) => {
      if (activeConversation) {
        setActiveConversation(prev =>
          prev ? { ...prev, title: newTitle } : null,
        );
        updateConversation(activeConversation.id, { title: newTitle });
      }
    },
    [activeConversation, updateConversation],
  );

  const handleMuteToggle = useCallback(() => {
    if (activeConversation) {
      const newMuted = !activeConversation.isMuted;
      setActiveConversation(prev =>
        prev ? { ...prev, isMuted: newMuted } : null,
      );
      updateConversation(activeConversation.id, { isMuted: newMuted });
    }
  }, [activeConversation, updateConversation]);

  // Start call from StartCall page (no conversation_id)
  const handleStartCall = useCallback(
    async (callType?: CallType) => {
      const session = await meetCall.startCall(undefined, callType);
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

  // Start audio call from a conversation card
  const handleConversationAudioCall = useCallback(
    (conversation: Conversation) => {
      meetCall.startCall(conversation.id, "audio").then(session => {
        if (session) {
          setShowCallView(true);
          // Add all members as pending for conversation calls
          apiMembers.forEach(m => {
            if (m.id !== String(user?.id)) {
              meetCall.addPending({
                userId: Number(m.id),
                name: m.name,
                profileImageUrl: m.avatarUrl,
                addedAt: Date.now(),
              });
            }
          });
        }
      });
    },
    [meetCall, apiMembers, user?.id],
  );

  // Start video call from a conversation card
  const handleConversationVideoCall = useCallback(
    (conversation: Conversation) => {
      meetCall.startCall(conversation.id, "video").then(session => {
        if (session) {
          setShowCallView(true);
          apiMembers.forEach(m => {
            if (m.id !== String(user?.id)) {
              meetCall.addPending({
                userId: Number(m.id),
                name: m.name,
                profileImageUrl: m.avatarUrl,
                addedAt: Date.now(),
              });
            }
          });
        }
      });
    },
    [meetCall, apiMembers, user?.id],
  );

  // Audio call from inside chat
  const handleChatAudioCall = useCallback(() => {
    if (activeConversation) handleConversationAudioCall(activeConversation);
  }, [activeConversation, handleConversationAudioCall]);

  // Video call from inside chat
  const handleChatVideoCall = useCallback(() => {
    if (activeConversation) handleConversationVideoCall(activeConversation);
  }, [activeConversation, handleConversationVideoCall]);

  // Start New Call from header (no conversation)
  const handleStartNewCall = useCallback(() => {
    meetCall.startCall(undefined, "video").then(session => {
      if (session) setShowCallView(true);
    });
  }, [meetCall]);

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
          setActiveConversation(null);
          chatMessages.clear();
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
          setActiveConversation(null);
          chatMessages.clear();
        }
      }
    },
    [conversationApi, removeConversation, activeConversation, chatMessages],
  );

  // Mute from card popup
  const handleMuteConversation = useCallback(
    (conversation: Conversation) => {
      const newMuted = !conversation.isMuted;
      updateConversation(conversation.id, { isMuted: newMuted });
    },
    [updateConversation],
  );

  // ─── Build CallView props ─────────────────────────────

  const owner: CallOwner = useMemo(
    () => ({
      id: String(user?.id ?? "me"),
      name: user
        ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
          user.username ||
          "Me"
        : "Me",
      avatarUrl: user?.profile_image_url ?? undefined,
    }),
    [user],
  );

  const room: CallRoom = useMemo(
    () => ({
      id: meetCall.activeSession?.id ?? "",
      link: meetCall.activeSession
        ? `${window.location.origin}?call_session=${meetCall.activeSession.id}`
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
            participants={meetCall.participants}
            owner={owner}
            room={room}
            title={callTitle}
            startTime={Date.now()}
            isSidebarOpen={isOpen}
            isMicMuted={meetCall.liveKitAPI.micMuted}
            isCameraMuted={meetCall.liveKitAPI.cameraMuted}
            isScreenSharing={meetCall.liveKitAPI.isScreenSharing}
            onToggleMic={meetCall.liveKitAPI.toggleMic}
            onToggleCamera={meetCall.liveKitAPI.toggleCamera}
            onToggleScreenShare={() => {
              if (meetCall.liveKitAPI.isScreenSharing) {
                meetCall.liveKitAPI.stopScreenShare();
              } else {
                void meetCall.liveKitAPI.startScreenShare();
              }
            }}
            onReaction={emoji => {
              console.log(emoji)
              // Reactions are shown locally by CallView, no custom WS needed yet
            }}
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
          <RenderIf isTrue={!activeConversation && !isEmpty(conversations)}>
            <DynamicButton
              icon="hugeicons:call-add"
              title={t("new_call")}
              variant="default"
              className="!h-7 !text-xs"
              onClick={handleStartNewCall}
            />
          </RenderIf>
          <StatusBadge className="ms-auto" status={connectionState} />
        </div>

        <Show>
          {/* No conversations: show StartCall */}
          <Show.When isTrue={isEmpty(conversations) && !isLoadingConversations}>
            <StartCall
              handleStartCall={handleStartCall}
              getSession={meetCall.streamSessionAPI.getSession}
              handleJoin={handleJoinCall}
              connectionState={connectionState}
            />
          </Show.When>

          {/* Active conversation: show Chat */}
          <Show.When isTrue={!!activeConversation}>
            <Chat
              conversation={activeConversation!}
              messages={chatMessages.messages}
              typingUsers={[]}
              onBack={handleBackToList}
              onSendMessage={handleSendMessage}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onCall={handleChatAudioCall}
              onVideoCall={handleChatVideoCall}
              onTitleEdit={handleTitleEdit}
              onDeleteMember={() => {}}
              className="flex-1 overflow-hidden"
              onMuteToggle={handleMuteToggle}
              onCallMember={() => {}}
              isLoadingMessages={chatMessages.isLoading}
              onLeaveGroup={() =>
                activeConversation &&
                handleLeaveConversation(activeConversation)
              }
              onDeleteForEveryone={() =>
                activeConversation &&
                handleDeleteForEveryone(activeConversation)
              }
              apiMembers={apiMembers}
              mentionMembers={mentionMembers}
            />
          </Show.When>

          {/* Conversation list */}
          <Show.Else>
            <ConversationPage
              conversations={conversations}
              isLoading={isLoadingConversations}
              onCall={handleConversationAudioCall}
              onVideoCall={handleConversationVideoCall}
              onOpenChat={handleOpenChat}
              onLeave={handleLeaveConversation}
              onDelete={handleDeleteForEveryone}
              onMute={handleMuteConversation}
              className="flex-1 overflow-x-hidden"
            />
          </Show.Else>
        </Show>

      </AppDrawer>
    </>
  );
};

export default MeetDrawer;
