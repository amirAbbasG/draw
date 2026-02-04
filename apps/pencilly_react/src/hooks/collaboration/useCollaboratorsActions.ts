import { useState } from "react";

import { Collaborator, SocketId } from "@excalidraw/excalidraw/types";
import { useMutation } from "@tanstack/react-query";

import { useAxiosFetcher } from "@/hooks/useAxiosFetch";

interface Params {
  user_id?: number;
  guest_id?: string;
  room_id: string;
  id: string;
}

interface SetScopeParams extends Params {
  scope: Collaborator["roomInfo"]["scope"];
}

export const useCollaboratorsActions = (
  collaborators: CollabAPI["collaborators"],
  setCollaborators: CollabAPI["setCollaborators"],
) => {
  const { axiosFetch } = useAxiosFetcher();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [pendingId, setPendingId] = useState("");
  const [selectedCollaborator, setSelectedCollaborator] = useState<
    string | null
  >(null);

  const { mutateAsync: kickCollaborator, isPending: isPendingKick } =
    useMutation({
      mutationFn: ({ guest_id, room_id, user_id }: Params) =>
        axiosFetch(
          {
            url: `/collab/rooms/${room_id}/kick/`,
            showError: true,
            method: "post",
          },
          { guest_id, user_id },
        ),
      onMutate: async ({ id }) => {
        // Optimistic update
        const prevCollaborators = new Map(collaborators);

        setCollaborators(prev => {
          const newCollaborators = new Map(prev);
          newCollaborators.delete(id as SocketId);
          return newCollaborators;
        });
        return { prevCollaborators };
      },
      onError: (_err, _variables, context) => {
        // Rollback on error
        if (context?.prevCollaborators) {
          setCollaborators(context.prevCollaborators);
        }
      },
    });

  const { mutateAsync: setScope, isPending: isPendingScope } = useMutation({
    mutationFn: ({ guest_id, room_id, user_id, scope }: SetScopeParams) =>
      axiosFetch(
        {
          url: `/collab/rooms/${room_id}/${user_id ? "permissions" : "guest-permissions"}/`,
          showError: true,
          method: "post",
        },
        { guest_id, user_id, scope },
      ),
    onMutate: async ({ id, scope }) => {
      // Optimistic update
      const prevCollaborators = new Map(collaborators);

      setCollaborators(prev => {
        const newCollaborators = new Map(prev);
        const collaborator = newCollaborators.get(id as SocketId);
        if (collaborator && collaborator.roomInfo) {
          newCollaborators.set(id as SocketId, {
            ...collaborator,
            roomInfo: {
              ...collaborator.roomInfo,
              scope,
            },
          });
        }
        return newCollaborators;
      });
      return { prevCollaborators };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.prevCollaborators) {
        setCollaborators(context.prevCollaborators);
      }
    },
  });

  const handleRemoveClick = (id: string) => {
    setSelectedCollaborator(id);
    setRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = async (onSuccess?: (id: string) => void) => {
    if (!selectedCollaborator) return;
    const collaborator = collaborators.get(selectedCollaborator as SocketId);
    const roomInfo = collaborator?.roomInfo;
    if (!roomInfo) return;
    setPendingId(selectedCollaborator);
    await kickCollaborator(
      {
        room_id: roomInfo.roomId, // Replace with actual room ID
        guest_id: roomInfo.guestId,
        user_id: roomInfo.userId,
        id: selectedCollaborator,
      },
      {
        onSuccess: () => {
          onSuccess?.(selectedCollaborator);
        },
      },
    );
    setPendingId("");
    setRemoveDialogOpen(false);
    setSelectedCollaborator(null);
  };

  const handleScopeChange = async (
    id: string,
    scope: Collaborator["roomInfo"]["scope"],
  ) => {
    const collaborator = collaborators.get(id as SocketId);
    const roomInfo = collaborator?.roomInfo;
    if (!roomInfo) return;
    console.log(collaborator);
    setPendingId(selectedCollaborator);
    await setScope({
      room_id: roomInfo.roomId, // Replace with actual room ID
      guest_id: roomInfo.guestId,
      user_id: roomInfo.userId,
      id,
      scope,
    });
    setPendingId("");
  };

  return {
    kickCollaborator,
    isPendingKick,
    setScope,
    isPendingScope,
    handleScopeChange,
    handleRemoveClick,
    handleRemoveConfirm,
    pendingId,
    removeDialogOpen,
    setRemoveDialogOpen,
    selectedCollaborator,
  };
};
