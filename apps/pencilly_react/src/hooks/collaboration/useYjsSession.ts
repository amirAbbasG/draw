import { useCallback, useRef, useState, useEffect } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { RECONNECT_ATTEMPTS, RECONNECT_BASE_DELAY } from "@/components/features/share/constants";
import { useTranslations } from "@/i18n";

export const useYjsSession = () => {
    const t = useTranslations("collaboration");
    const yDocRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const undoManagerRef = useRef<Y.UndoManager | null>(null);
    const wsUrlRef = useRef<string>("");
    const isStoppingRef = useRef(false); // Prevents error alerts during destroy

    const [isOffline, setIsOffline] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    // Cleanup Function
    const destroySession = useCallback(() => {
        isStoppingRef.current = true;

        // Cleanup Provider
        if (providerRef.current) {
            const provider = providerRef.current;
            provider.disconnect(); // Ensure WS closes
            provider.destroy();
            providerRef.current = null;
        }

        // Cleanup Doc
        if (yDocRef.current) {
            yDocRef.current.destroy();
            yDocRef.current = null;
        }

        undoManagerRef.current = null;
        wsUrlRef.current = "";

        // Reset flags after short delay to allow async events to settle
        setTimeout(() => {
            isStoppingRef.current = false;
        }, 100);
    }, []);

    const connect = useCallback((roomId: string, wsUrl: string, handleMessage: (e: MessageEvent) => void) => {
        destroySession(); // Ensure clean slate

        const doc = new Y.Doc();
        yDocRef.current = doc;

        const baseUrl = wsUrl.split("room/")[0] + "room/";
        const provider = new WebsocketProvider(baseUrl, roomId, doc);
        providerRef.current = provider;
        wsUrlRef.current = wsUrl;

        // Attach custom message handler (for room permissions/info)
        provider.ws.addEventListener("message", handleMessage);

        // Setup UndoManager
        const yElements = doc.getArray("elements");
        undoManagerRef.current = new Y.UndoManager(yElements);

        // Connection Listeners
        provider.on("status", (event: { status: string }) => {
            const connected = event.status === "connected";
            setIsOffline(!connected);

            if (connected) {
                setReconnectAttempts(0); // Reset on success
                setConnectionError(null);
            } else if (!isStoppingRef.current) {
                // Only error if not intentionally stopping
                // Note: Actual error setting moved to connection-error event or handled by parent
            }
        });

        provider.on("connection-error", (e: any) => {
            if (!isStoppingRef.current) {
                console.error("Connection error:", e);
                setConnectionError(t("alerts.collabConnectionFailed"));
                destroySession();
            }
        });

        return { doc, provider };
    }, [destroySession, t]);

    // Reconnect Logic
    const attemptReconnect = useCallback((roomId: string) => {
        if (reconnectAttempts >= RECONNECT_ATTEMPTS || !wsUrlRef.current) {
            setConnectionError(t("alerts.collabReconnectFailed"));
            return;
        }

        const delay = RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts);
        setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            // We need to re-trigger the connect logic from the parent usually,
            // or we can expose a simplified re-connect here if we stored the handler.
            // For safety, the parent should trigger the re-connect using the exposed state.
        }, delay);
    }, [reconnectAttempts, t]);

    // Cleanup on unmount
    useEffect(() => () => destroySession(), [destroySession]);

    return {
        yDocRef,
        providerRef,
        undoManagerRef,
        wsUrlRef,
        connect,
        destroySession,
        isOffline,
        connectionError,
        reconnectAttempts,
        setConnectionError, // Allow parent to clear errors
        attemptReconnect
    };
};