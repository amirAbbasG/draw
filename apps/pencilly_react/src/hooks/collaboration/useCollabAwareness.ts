import React, { useRef, useEffect, useCallback } from "react";
import { Collaborator } from "@excalidraw/excalidraw/types";
import { throttle } from "@/lib/utils";
import {
    ACTIVE_THRESHOLD,
    IDLE_THRESHOLD,
    CURSOR_SYNC_TIMEOUT
} from "@/components/features/share/constants";
import {setCollaborators} from "@/stores/zustand/collaborate/actions";

type SocketId = string & { _brand: "SocketId" };

export const useCollabAwareness = (
    providerRef: React.RefObject<any>,
    drawAPI: any,
    userInfo: { username: string; avatarUrl?: string },
    roomInfoRef: React.RefObject<any>
) => {
    const lastCollaboratorsKeysRef = useRef<string>("");

    const updateCollaborators = useCallback(() => {
        const awareness = providerRef.current?.awareness;
        if (!awareness) return;

        const localClientId = awareness.clientID;
        const states = awareness.getStates();
        const newCollaborators = new Map<SocketId, Collaborator>();

        states.forEach((state: any, clientId: number) => {
            if (state.user && state.user.userState !== "disconnected") {
                newCollaborators.set(clientId.toString() as SocketId, {
                    ...state.user,
                    isCurrentUser: clientId === localClientId,
                    id: clientId.toString(),
                });
            }
        });

        // Optimization: Skip React render if keys haven't changed (basic check)
        const newKeys = Array.from(newCollaborators.keys()).sort().join(",");
        // if (lastCollaboratorsKeysRef.current !== newKeys) {
        //     lastCollaboratorsKeysRef.current = newKeys;
        //     setCollaborators(newCollaborators);
        // }
        // Always update scene for pointer movements even if list size is same
        lastCollaboratorsKeysRef.current = newKeys;
        setCollaborators(newCollaborators); // Trigger state update to be safe

        // Update Excalidraw Scene (exclude local user)
        const renderCollaborators = new Map(newCollaborators);
        if (localClientId) renderCollaborators.delete(localClientId.toString() as SocketId);
        drawAPI?.updateScene({ collaborators: renderCollaborators });
    }, [drawAPI]);

    // Pointer Updates
    const onPointerUpdate = useCallback(
        throttle((payload: { pointer: any; button: any; pointersMap: any }) => {
            const awareness = providerRef.current?.awareness;
            if (!awareness) return;

            const { pointer, button } = payload;
            awareness.setLocalStateField("user", {
                ...awareness.getLocalState()?.user,
                username: userInfo.username || "Anonymous",
                avatarUrl: userInfo.avatarUrl,
                pointer,
                button: button || "up",
                selectedElementIds: drawAPI?.getAppState().selectedElementIds,
                tool: "pointer",
                roomInfo: roomInfoRef.current,
                userState: "active" // Touching canvas means active
            });
        }, CURSOR_SYNC_TIMEOUT),
        [userInfo, drawAPI]
    );

    // Activity/Idle Detection
    useEffect(() => {
        const awareness = providerRef.current?.awareness;
        if (!awareness) return;

        // Listen for remote changes
        const throttledUpdate = throttle(updateCollaborators, 50);
        awareness.on("change", throttledUpdate);

        let idleTimeoutId: NodeJS.Timeout | null = null;
        let activeIntervalId: NodeJS.Timeout | null = null;

        const reportIdle = () => {
            awareness.setLocalStateField("user", { ...awareness.getLocalState()?.user, userState: "idle" });
            if (activeIntervalId) { clearInterval(activeIntervalId); activeIntervalId = null; }
        };

        const reportActive = () => {
            awareness.setLocalStateField("user", { ...awareness.getLocalState()?.user, userState: "active" });
        };

        const handleActivity = () => {
            if (idleTimeoutId) clearTimeout(idleTimeoutId);
            idleTimeoutId = setTimeout(reportIdle, IDLE_THRESHOLD);
            if (!activeIntervalId) activeIntervalId = setInterval(reportActive, ACTIVE_THRESHOLD);
            reportActive();
        };

        const visibilityChangeHandler = () => {
            if (document.hidden) reportIdle();
            else handleActivity();
        };

        document.addEventListener("pointermove", handleActivity, { passive: true });
        document.addEventListener("keydown", handleActivity, { passive: true });
        document.addEventListener("visibilitychange", visibilityChangeHandler);

        const beforeUnloadHandler = () => {
            awareness.setLocalStateField("user", { ...awareness.getLocalState()?.user, userState: "disconnected" });
        };
        window.addEventListener("beforeunload", beforeUnloadHandler);

        return () => {
            awareness.off("change", throttledUpdate);
            document.removeEventListener("pointermove", handleActivity);
            document.removeEventListener("keydown", handleActivity);
            document.removeEventListener("visibilitychange", visibilityChangeHandler);
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            if (idleTimeoutId) clearTimeout(idleTimeoutId);
            if (activeIntervalId) clearInterval(activeIntervalId);
        };
    }, [providerRef.current, updateCollaborators]);

    return { onPointerUpdate };
};