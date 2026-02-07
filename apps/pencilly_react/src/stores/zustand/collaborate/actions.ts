import { useCollaborateStore } from "@/stores/zustand/collaborate/collaborate-store";
import { CallData , CollaborateState} from "@/stores/zustand/collaborate/types";

export const setCallData = (data: CallData | null) => {
  useCollaborateStore.setState(state => {
    state.callData = data;
  });
};

export const setRoomId = (id: string) => {
  useCollaborateStore.setState(state => {
    state.roomId = id;
  });
};


export const setCollaborators = (
    data: CollaborateState["collaborators"]
) => {
  useCollaborateStore.setState(state => {
    state.collaborators = data;
  });
};
