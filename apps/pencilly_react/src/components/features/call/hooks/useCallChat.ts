
import { useCallback, useEffect, useRef, useState } from "react"
import type {ChatMessage} from "@/components/features/call/types";


interface UseCallChatOptions {
    wsUrl: string
    enabled?: boolean
}

export function useCallChat({ wsUrl, enabled = false }: UseCallChatOptions) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const socketRef = useRef<WebSocket | null>(null)


    const connect = useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) return

        const socket = new WebSocket(wsUrl)
        socketRef.current = socket

        socket.onopen = () => {
            setIsConnected(true)
        }

        socket.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data)
                if (payload.type === "chat:message" || payload.type === "chat:update") {
                    setMessages((prev) => {
                        const existing = prev.find((m) => m.id === payload.id)
                        if (existing) {
                            return prev.map((m) =>
                                m.id === payload.id
                                    ? {
                                        ...m,
                                        text: payload.text || m.text,
                                        status: payload.status,
                                    }
                                    : m,
                            )
                        }
                        return [
                            ...prev,
                            {
                                id: payload.id || Date.now().toString(),
                                text: payload.text || "",
                                sender: payload.sender || { name: "Unknown" },
                                createdAt: payload.createdAt || new Date().toISOString(),
                                status: payload.status,
                            },
                        ]
                    })
                }
            } catch {}
        }

        socket.onclose = () => {
            setIsConnected(false)
        }

        socket.onerror = () => {
            setIsConnected(false)
        }
    }, [wsUrl])

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.close()
            socketRef.current = null
        }
        setIsConnected(false)
    }, [])

    const sendMessage = useCallback((text: string) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            return false
        }
        socketRef.current.send(JSON.stringify({ type: "chat:send", text }))
        return true
    }, [])

    useEffect(() => {
        if (enabled) {
            connect()
        } else {
            disconnect()
        }

        return () => {
            disconnect()
        }
    }, [enabled, connect, disconnect])

    return {
        messages,
        isConnected,
        sendMessage,
        connect,
        disconnect,
    }
}
