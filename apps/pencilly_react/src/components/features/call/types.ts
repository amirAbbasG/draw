
export interface StreamSession {
    id: string
    is_active: boolean
    created_at: string
    broadcast_url: string
    viewer_url: string
    ws_url: string
    livekit_url: string
    room_name: string
}

export interface TokenRequest {
    identity?: string
    name?: string
    metadata?: Record<string, unknown>
    ttl_seconds?: number
}

export interface TokenResponse {
    token: string
    ttl_seconds: number
    livekit_url: string
    room_name: string
    identity: string
}

export interface AgentDispatchRequest {
    metadata?: string
}

export interface AgentDispatchResponse {
    id: string
    agent_name: string
    room: string
    metadata: string
}

export interface ChatMessage {
    id: string
    text: string
    sender: {
        name: string
        is_ai?: boolean
    }
    createdAt: string
    status?: "pending" | "sent" | "error"
}

export interface Participant {
    identity: string
    name?: string
    profileImage?: string
    isSpeaking?: boolean
    isLocal?: boolean

}

export interface LocalTrack {
    kind: "audio" | "video"
    track: MediaStreamTrack
    sid?: string
    muted: boolean
    source?: "camera" | "screen"
}

export interface RemoteTrack {
    kind: "audio" | "video"
    participantIdentity: string
    participantName?: string
    participantProfileImage?: string
    track: MediaStreamTrack
    sid: string
    source?: "camera" | "screen"
    isMuted?: boolean;
}

export type ConnectionState =
    | "idle"
    | "connecting"
    | "connected"
    | "disconnected";
