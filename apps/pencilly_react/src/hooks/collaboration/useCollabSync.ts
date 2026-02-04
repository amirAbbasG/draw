
import React, { useRef, useEffect, useCallback } from "react";
import { ExcalidrawElement } from "@excalidraw/element/types";
import { AppState, BinaryFiles, BinaryFileData } from "@excalidraw/excalidraw/types";
import * as Y from "yjs";
import { getElementsFingerprint, getFilesFingerprint } from "@/components/features/share/utils";

export const useCollabSync = (
    yDocRef: React.RefObject<Y.Doc | null>,
    drawAPI: any,
    isCollaborating: boolean
) => {
    const remoteRef = useRef(false);
    const lastElementsFingerprintRef = useRef("");
    const lastFilesFingerprintRef = useRef("");

    // 1. Sync Remote -> Local
    useEffect(() => {
        const doc = yDocRef.current;
        if (!doc || !drawAPI) return;

        const yElements = doc.getArray<ExcalidrawElement>("elements");
        const yFiles = doc.getMap<BinaryFileData>("files");

        const handleYChange = (_events: Y.YEvent<any>[], transaction: Y.Transaction) => {
            if (transaction.local) return;
            remoteRef.current = true;

            try {
                const newElements = yElements.toArray();
                const newFiles = yFiles.toJSON() as BinaryFiles;

                const elFingerprint = getElementsFingerprint(newElements);
                const flFingerprint = getFilesFingerprint(newFiles);

                if (
                    elFingerprint === lastElementsFingerprintRef.current &&
                    flFingerprint === lastFilesFingerprintRef.current
                ) {
                    remoteRef.current = false;
                    return;
                }

                lastElementsFingerprintRef.current = elFingerprint;
                lastFilesFingerprintRef.current = flFingerprint;

                drawAPI.addFiles(Object.values(newFiles));
                drawAPI.updateScene({ elements: newElements });
            } catch(e) {
                console.error("Error in handleYChange:", e);
            } finally {
                remoteRef.current = false;
            }
        };

        yElements.observeDeep(handleYChange);
        yFiles.observeDeep(handleYChange);

        return () => {
            yElements.unobserveDeep(handleYChange);
            yFiles.unobserveDeep(handleYChange);
        };
    }, [yDocRef.current, drawAPI]);

    // 2. Handle Initial Join (Sync immediately)
    const handleInitialSync = useCallback((isJoin: boolean) => {
        if(!yDocRef.current || !drawAPI) return;

        const doc = yDocRef.current;
        const yElements = doc.getArray<ExcalidrawElement>("elements");
        const yFiles = doc.getMap<BinaryFileData>("files");

        if (isJoin) {
            remoteRef.current = true;
            try {
                drawAPI.updateScene({ elements: [] }); // Clear scene first

                const newElements = yElements.toArray();
                const newFiles = yFiles.toJSON() as BinaryFiles;

                lastElementsFingerprintRef.current = getElementsFingerprint(newElements);
                lastFilesFingerprintRef.current = getFilesFingerprint(newFiles);

                drawAPI.addFiles(Object.values(newFiles));
                drawAPI.updateScene({ elements: newElements });
            } catch(e) {
                console.error("Error in initial sync:", e);
            } finally {
                remoteRef.current = false;
            }
        }
    }, [drawAPI]);

    // 3. Sync Local -> Remote
    const syncLocalToRemote = useCallback(
        (elements: readonly ExcalidrawElement[], _appState: AppState, files: BinaryFiles) => {
            if (!yDocRef.current || remoteRef.current || !isCollaborating) return;

            const newElFingerprint = getElementsFingerprint(elements);
            const newFlFingerprint = getFilesFingerprint(files);

            if (
                newElFingerprint === lastElementsFingerprintRef.current &&
                newFlFingerprint === lastFilesFingerprintRef.current
            ) return;

            lastElementsFingerprintRef.current = newElFingerprint;
            lastFilesFingerprintRef.current = newFlFingerprint;

            const doc = yDocRef.current;
            try {
                doc.transact(() => {
                    const yElements = doc.getArray("elements");
                    const yFiles = doc.getMap("files");

                    yElements.delete(0, yElements.length);
                    yElements.push(elements.slice());

                    yFiles.clear();
                    Object.entries(files).forEach(([k, v]) => yFiles.set(k, v));
                });
            } catch (error) {
                console.error("Transact error:", error);
            }
        },
        [isCollaborating]
    );

    return { syncLocalToRemote, handleInitialSync };
};