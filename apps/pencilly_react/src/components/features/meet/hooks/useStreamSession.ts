import { useCallback, useState } from "react";

import {
  AgentDispatchResponse,
  StreamSession,
  TokenRequest,
  TokenResponse,
} from "@/components/features/call/types";
import { useAxiosFetcher } from "@/hooks/useAxiosFetch";
import { useCustomSearchParams } from "@/hooks/useCustomSearchParams";
import { CALL_SESSION_KEY } from "@/constants/keys";
import { useTranslations } from "@/i18n";
import {envs} from "@/constants/envs";

// API endpoints
const API_BASE = "/stream/sessions";

interface UseStreamSessionOptions {
  onError?: (error: string) => void;
}

export function useStreamSession({ onError }: UseStreamSessionOptions = {}) {
  const [session, setSession] = useState<StreamSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { axiosFetch } = useAxiosFetcher();
  const t = useTranslations("call.errors");
  const { setSearchParams, removeParam } =
    useCustomSearchParams(CALL_SESSION_KEY);

  const createSession = useCallback(async (conversationId?: string): Promise<StreamSession | null> => {
    setIsLoading(true);
    try {
      const data = await axiosFetch<StreamSession>({
        method: "post",
        url: API_BASE + "/",
        showError: true,
        throwError: true,
      },{
        "only_chat": false,
        "encrypted": false,
        "is_public":  envs.isDev,
        // "is_public":  false,
        conversation_id: conversationId,
      });
      if (data) {
        setSession(data);
        setSearchParams({ [CALL_SESSION_KEY]: data.id });
      }
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("create_failed");
      onError?.(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  const getSession = useCallback(
    async (sessionId: string): Promise<StreamSession | null> => {
      setIsLoading(true);
      try {
        const data = await axiosFetch<StreamSession>({
          method: "get",
          url: `${API_BASE}/${sessionId}/`,
          showError: true,
          throwError: true,
        });
        setSession(data);
        setSearchParams({ [CALL_SESSION_KEY]: data.id });
        return data;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("get_failed");
        onError?.(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [onError],
  );

  const endSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      try {
        await axiosFetch({
          method: "post",
          url: `${API_BASE}/${sessionId}/end/`,
          showError: true,
        });
        setSession(null);
        removeParam(CALL_SESSION_KEY);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("end_failed");
        onError?.(message);
        return false;
      }
    },
    [onError],
  );

  const getToken = useCallback(
    async (
      sessionId: string,
      options?: TokenRequest,
    ): Promise<TokenResponse | null> => {
      try {
        return await axiosFetch<TokenResponse>(
          {
            method: "post",
            url: `${API_BASE}/${sessionId}/token/`,
            showError: true,
            throwError: true,
          },
          options || {},
        );
      } catch (err: unknown) {
        removeParam(CALL_SESSION_KEY);
        const message =
          err instanceof Error ? err.message : t("get_token_failed");
        onError?.(message);
        setSession(null);
        return null;
      }
    },
    [onError],
  );

  const dispatchAgent = useCallback(
    async (sessionId: string, metadata?: string): Promise<boolean> => {
      try {
        await axiosFetch<AgentDispatchResponse>(
          {
            method: "post",
            url: `${API_BASE}/${sessionId}/agent/dispatch/`,
            showError: true,
          },
          { metadata: metadata || "" },
        );

        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : t("dispatch_agent_failed");
        onError?.(message);
        return false;
      }
    },
    [onError],
  );

  return {
    session,
    isLoading,
    createSession,
    getSession,
    endSession,
    getToken,
    dispatchAgent,
    setSession,
  };
}
