import { useEffect } from "react";

import type { WebsocketProvider } from "y-websocket";
import type * as Y from "yjs";

import type { PendingJoinRequest } from "./useCollaboration";

interface UseCollabCommandsProps {
  yDoc: Y.Doc | null;
  provider: WebsocketProvider | null;
  isOwner: boolean;
  onKick: () => void;
  onApproved?: () => void;
  onDenied?: () => void;
  onJoinRequest?: (request: PendingJoinRequest) => void;
}

export const useCollabCommands = ({
  yDoc,
  provider,
  isOwner,
  onKick,
  onApproved,
  onDenied,
  onJoinRequest,
}: UseCollabCommandsProps) => {

  useEffect(() => {
    if (!yDoc || !provider) return;
    const yCommands = yDoc.getMap<any>("commands");
    const awareness = provider.awareness;

    const handleCommands = (
      event: Y.YMapEvent<any>,
      transaction: Y.Transaction,
    ) => {
      if (transaction.local) return;

      for (const key of event.keysChanged) {
        const cmd = yCommands.get(key);
        if (!cmd) continue;

        const localClientId = awareness.clientID.toString();

        if (cmd.type === "kick") {
          if (cmd.targetId === localClientId) {
            onKick();
          }
        }


        if (cmd.type === "join_request" && isOwner) {
          onJoinRequest?.({
            id: cmd.senderId,
            username: cmd.username || "Anonymous",
            avatarUrl: cmd.avatarUrl,
            timestamp: cmd.ts,
          });
        }

        if (cmd.type === "join_approved") {
          if (cmd.targetId === localClientId) {
            onApproved?.();
          }
        }

        if (cmd.type === "join_denied") {
          if (cmd.targetId === localClientId) {
            onDenied?.();
          }
        }

        yCommands.delete(key);
      }
    };

    yCommands.observe(handleCommands);
    return () => yCommands.unobserve(handleCommands);
  }, [yDoc, provider, isOwner, onKick, onApproved, onDenied, onJoinRequest]);

  const sendKickMessage = (targetId: string) => {
    if (!yDoc || !provider) return;
    const yCommands = yDoc.getMap<any>("commands");
    const key = `kick:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

    yCommands.set(key, {
      type: "kick",
      targetId,
      senderId: provider.awareness.clientID.toString(),
      ts: Date.now(),
    });
  };

  const sendJoinRequest = (
    userData: {
      username: string;
      avatarUrl?: string;
    },
    yDoc: Y.Doc,
    provider: WebsocketProvider,
  ) => {
    if (!yDoc || !provider) return;
    const yCommands = yDoc.getMap<any>("commands");
    const key = `join_request:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    yCommands.set(key, {
      type: "join_request",
      senderId: provider.awareness.clientID.toString(),
      username: userData.username,
      avatarUrl: userData.avatarUrl,
      ts: Date.now(),
    });
  };

  const sendApprovalMessage = (targetId: string) => {
    if (!yDoc || !provider) return;
    const yCommands = yDoc.getMap<any>("commands");
    const key = `approve:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

    yCommands.set(key, {
      type: "join_approved",
      targetId,
      senderId: provider.awareness.clientID.toString(),
      ts: Date.now(),
    });
  };

  const sendDenialMessage = (targetId: string) => {
    if (!yDoc || !provider) return;
    const yCommands = yDoc.getMap<any>("commands");
    const key = `deny:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

    yCommands.set(key, {
      type: "join_denied",
      targetId,
      senderId: provider.awareness.clientID.toString(),
      ts: Date.now(),
    });
  };

  return {
    sendKickMessage,
    sendJoinRequest,
    sendApprovalMessage,
    sendDenialMessage,
  };
};
