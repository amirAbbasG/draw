import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useAxiosFetcher } from "@/hooks/useAxiosFetch";
import { useCollaborateStore } from "@/stores/zustand/collaborate/collaborate-store";
import {toast} from "sonner";

export type CallState = "collaboration" | "livekit-call";

export interface CallInput {
  origin_state: CallState;
  origin_id: string;
  destination_state: CallState;
  destination_id: string;
  user_ids: number[];
}

export const useCallCollaborators = () => {
  const roomId = useCollaborateStore(useShallow(state => state.roomId));
  const { axiosFetch } = useAxiosFetcher();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (
      input: Pick<CallInput, "destination_id" | "user_ids">,
    ) => {
      if (!roomId) {
        return toast.error("No active collaboration room found. Please join a room to start a call.");
      }
      return axiosFetch(
        {
          url: "/collab/rooms/broadcast/",
          method: "post",
          showError: true,
        },
        {
          origin_state: "collaboration",
          origin_id: roomId,
          destination_state: "livekit-call",
          ...input,
        },
      );
    },
  });

  return {
    callCollaborators: mutateAsync,
    isCalling: isPending,
  };
};
