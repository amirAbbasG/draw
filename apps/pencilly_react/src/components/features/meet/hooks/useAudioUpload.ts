import { useCallback, useRef } from "react";

import type { AudioRecordingResult } from "./useAudioRecorder";
import type { WsServerMessage } from "../types";
import { generateClientEventId } from "../utils";

interface AudioUploadReadyMessage {
  type: "audio:upload_ready";
  uploadId: string;
  conversationId: string;
  maxChunkBytes: number;
  frameFormat: string;
  expiresAt: string;
}

interface AudioUploadChunkAckMessage {
  type: "audio:upload_chunk_ack";
  uploadId: string;
  seq: number;
  receivedSizeBytes: number;
}

interface AudioUploadCommittedMessage {
  type: "audio:upload_committed";
  uploadId: string;
  conversationId: string;
  messageId: string;
  seq: number;
  deduped: boolean;
}

interface PendingUpload {
  blob: Blob;
  maxChunkBytes: number;
  uploadId: string;
}

interface UseAudioUploadOptions {
  /** Active conversation ID */
  conversationId: string | null;
  /** WS audio:upload_init sender */
  sendAudioUploadInit: (payload: {
    conversationId: string;
    clientEventId: string;
    mimeType: string;
    fileSizeBytes: number;
    durationMs: number;
    replyTo?: string;
  }) => boolean;
  /** WS binary chunk sender */
  sendAudioChunk: (
    uploadId: string,
    seq: number,
    chunkData: Uint8Array,
  ) => boolean;
  /** WS audio:upload_complete sender */
  sendAudioUploadComplete: (uploadId: string) => boolean;
}

export function useAudioUpload({
  conversationId,
  sendAudioUploadInit,
  sendAudioChunk,
  sendAudioUploadComplete,
}: UseAudioUploadOptions) {
  const pendingUploadRef = useRef<PendingUpload | null>(null);

  /**
   * Initiate an audio upload for the given recording result.
   * Sends audio:upload_init and waits for audio:upload_ready via handleWsMessage.
   */
  const uploadAudio = useCallback(
    (result: AudioRecordingResult, replyToId?: string) => {
      if (!conversationId) return;

      const clientEventId = generateClientEventId();

      // Store the blob for when we get the upload_ready response
      pendingUploadRef.current = {
        blob: result.blob,
        maxChunkBytes: 524288, // default, will be overridden
        uploadId: "",
      };

      sendAudioUploadInit({
        conversationId,
        clientEventId,
        mimeType: result.mimeType,
        fileSizeBytes: result.fileSizeBytes,
        durationMs: result.durationMs,
        replyTo: replyToId,
      });
    },
    [conversationId, sendAudioUploadInit],
  );

  /**
   * Send all chunks for the pending upload blob.
   */
  const sendChunks = useCallback(
    async (uploadId: string, blob: Blob, maxChunkBytes: number) => {
      const arrayBuffer = await blob.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const totalChunks = Math.ceil(data.length / maxChunkBytes);

      for (let seq = 0; seq < totalChunks; seq++) {
        const start = seq * maxChunkBytes;
        const end = Math.min(start + maxChunkBytes, data.length);
        const chunk = data.slice(start, end);
        sendAudioChunk(uploadId, seq, chunk);
      }

      // All chunks sent, signal completion
      sendAudioUploadComplete(uploadId);
    },
    [sendAudioChunk, sendAudioUploadComplete],
  );

  /**
   * Handle incoming WS messages relevant to audio upload.
   * Call this from the global WS message handler.
   */
  const handleWsMessage = useCallback(
    (message: WsServerMessage) => {
      const msg = message as any;

      if (msg.type === "audio:upload_ready") {
        const ready = msg as AudioUploadReadyMessage;
        const pending = pendingUploadRef.current;
        if (pending) {
          pending.uploadId = ready.uploadId;
          pending.maxChunkBytes = ready.maxChunkBytes;
          // Start sending chunks
          sendChunks(ready.uploadId, pending.blob, ready.maxChunkBytes);
          pendingUploadRef.current = null;
        }
      }

      // audio:upload_chunk_ack - we can log or track progress if needed
      if (msg.type === "audio:upload_chunk_ack") {
        // Optional: track chunk progress
      }

      // audio:upload_committed - upload is done, message will arrive as conversation:event
      if (msg.type === "audio:upload_committed") {
        // The actual audio message will be delivered via conversation:event
        // and handled by useChatMessages
      }
    },
    [sendChunks],
  );

  return {
    uploadAudio,
    handleWsMessage,
  };
}
