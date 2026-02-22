import { useCallback, useEffect, useRef, useState } from "react";

export type WsConnectionState = "idle" | "connecting" | "connected" | "disconnected";

export interface UseWebSocketOptions {
  /** WebSocket URL to connect to */
  url: string;
  /** Whether the connection should be active */
  enabled?: boolean;
  /** Called when a message is received (already JSON-parsed) */
  onMessage?: (data: any) => void;
  /** Called when connection is established */
  onConnect?: () => void;
  /** Called when connection is lost */
  onDisconnect?: (code?: number, reason?: string) => void;
  /** Called on connection error */
  onError?: (error: Event) => void;
  /** Enable auto-reconnect on disconnect (default: true) */
  reconnect?: boolean;
  /** Max reconnection attempts (default: 5) */
  maxRetries?: number;
  /** Heartbeat interval in ms (default: 30000) */
  heartbeatInterval?: number;
}

export interface UseWebSocketReturn {
  /** Send a JSON-serializable message. Returns true if sent. */
  send: (data: Record<string, unknown>) => boolean;
  /** Send binary data (ArrayBuffer). Returns true if sent. */
  sendBinary: (data: ArrayBuffer) => boolean;
  /** Current connection state */
  connectionState: WsConnectionState;
  /** Manually disconnect */
  disconnect: () => void;
  /** Manually reconnect */
  reconnect: () => void;
}

const BACKOFF_BASE = 1000;
const MAX_BACKOFF = 16000;

function getBackoff(attempt: number): number {
  return Math.min(BACKOFF_BASE * Math.pow(2, attempt), MAX_BACKOFF);
}

/**
 * Generic, reusable WebSocket hook with auto-reconnect,
 * heartbeat (ping/pong), and typed message sending.
 */
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    enabled = true,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnect: shouldReconnect = true,
    maxRetries = 5,
    heartbeatInterval = 30000,
  } = options;

  const [connectionState, setConnectionState] = useState<WsConnectionState>("idle");
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intentionalCloseRef = useRef(false);
  const mountedRef = useRef(true);

  // Keep latest callbacks in refs to avoid re-connecting on callback change
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  onMessageRef.current = onMessage;
  onConnectRef.current = onConnect;
  onDisconnectRef.current = onDisconnect;
  onErrorRef.current = onError;

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    heartbeatTimerRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  const connect = useCallback(() => {
    if (!url || !mountedRef.current) return;

    // Close existing connection if any
    if (wsRef.current) {
      intentionalCloseRef.current = true;
      wsRef.current.close();
      wsRef.current = null;
    }

    intentionalCloseRef.current = false;
    setConnectionState("connecting");

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      retriesRef.current = 0;
      setConnectionState("connected");
      startHeartbeat();
      onConnectRef.current?.();
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data);
        // Ignore pong messages at this level
        if (data.type === "pong") return;
        onMessageRef.current?.(data);
      } catch {
        // Non-JSON message, ignore
      }
    };

    ws.onerror = (event: Event) => {
      if (!mountedRef.current) return;
      onErrorRef.current?.(event);
    };

    ws.onclose = (event: CloseEvent) => {
      if (!mountedRef.current) return;

      clearTimers();
      wsRef.current = null;
      setConnectionState("disconnected");
      onDisconnectRef.current?.(event.code, event.reason);

      // Auto-reconnect unless intentional or auth error
      if (
        !intentionalCloseRef.current &&
        shouldReconnect &&
        retriesRef.current < maxRetries &&
        event.code !== 4001 // auth error
      ) {
        const delay = getBackoff(retriesRef.current);
        retriesRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, delay);
      }
    };
  }, [url, shouldReconnect, maxRetries, startHeartbeat, clearTimers]);

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionState("disconnected");
  }, [clearTimers]);

  const manualReconnect = useCallback(() => {
    retriesRef.current = 0;
    connect();
  }, [connect]);

  const send = useCallback((data: Record<string, unknown>): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  const sendBinary = useCallback((data: ArrayBuffer): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
      return true;
    }
    return false;
  }, []);

  // Connect/disconnect based on enabled flag
  useEffect(() => {
    mountedRef.current = true;

    if (enabled && url) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      mountedRef.current = false;
      intentionalCloseRef.current = true;
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enabled, url]);

  return {
    send,
    sendBinary,
    connectionState,
    disconnect,
    reconnect: manualReconnect,
  };
}
