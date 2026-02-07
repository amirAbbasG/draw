import type {Collaborator, SocketId} from "@excalidraw/excalidraw/types";

export interface CallData {
  type: string
  roomId: string
  originState: string
  originId: string
  destinationState: string
  destinationId: string
  createdBy: {
    id: number
    name: string
  }
  createdAt: string
}

export interface CollaborateState {
  callData?: CallData | null;
  collaborators: Map<SocketId, Collaborator>
  roomId: string
}
