import { FileId } from "@excalidraw/element/types";
import { useMutation } from "@tanstack/react-query";

import { useAxiosFetcher } from "@/hooks/useAxiosFetch";

export interface Room {
  room_id: string;
  ws_url: string;
  role?: string
}

export interface RoomDetails extends Room {
  channel_layer: string;
  engine: string;
  persisted: boolean;
  members: number;

}

export const useConnections = () => {
  const { axiosFetch } = useAxiosFetcher();

  const { mutateAsync: createRoom, isPending: isCreatingRoom } = useMutation({
    mutationFn: () =>
      axiosFetch<Room>({
        method: "post",
        url: "collab/rooms/",
        showError: true,
      }),
  });

  const { mutateAsync: joinRoom, isPending: isJoiningRoom } = useMutation({
    mutationFn: ({ room_id }: { room_id: string }) =>
      axiosFetch<RoomDetails>({
        url: `/collab/rooms/${room_id}/info/`,
        showError: true,
      }),
  });

  return {
    createRoom,
    isCreatingRoom,
    joinRoom,
    isJoiningRoom,
  };
};
