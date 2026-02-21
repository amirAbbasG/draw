import React, { useEffect, useState, type FC } from "react";

import type { StreamSession } from "@/components/features/call/types";
import { CallBox } from "@/components/features/meet/start/CallBox";
import { OrDivider } from "@/components/shared/OrDivider";
import { Button } from "@/components/ui/button";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import { useUser } from "@/stores/context/user";
import { sharedIcons } from "@/constants/icons";
import { CALL_SESSION_KEY } from "@/constants/keys";
import { useTranslations } from "@/i18n";

import type { CallType, ConnectionState } from "../types";

interface IProps {
  handleStartCall: (callType?: CallType) => Promise<StreamSession | null>;
  handleJoin: (sessionId: string, callType?: CallType) => Promise<void>;
  connectionState: ConnectionState;
}

const StartCall: FC<IProps> = ({ handleJoin, handleStartCall }) => {
  const t = useTranslations("meet.start");
  const [sessionId, setSessionId] = useState("");
  const [pendingCreate, setPendingCreate] = useState(false);
  const [pendingJoin, setPendingJoin] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");
  const [callType, setCallType] = useState<CallType>("video");

  const { user } = useUser();

  useEffect(() => {
    setDisplayName(
      user?.first_name
        ? `${user.first_name} ${user.last_name || ""}`.trim()
        : user?.username || "",
    );
  }, []);

  const create = async () => {
    setPendingCreate(true);
    await handleStartCall(callType);
    setPendingCreate(false);
  };

  const join = async () => {
    if (!sessionId.trim()) return;
    setPendingJoin(true);
    await handleJoin(sessionId, callType);
    setPendingJoin(false);
  };

  const isLoading = pendingCreate || pendingJoin;

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // 1. Get the pasted string

    const pastedData = e.clipboardData.getData("Text");
    try {
      // 2. Check if it's a valid URL
      const url = new URL(pastedData);

      // 3. Extract the 'call_session' parameter
      const callSession = url.searchParams.get(CALL_SESSION_KEY);
      const callSessionFallback = url.searchParams.get(
        CALL_SESSION_KEY.replace("-", "_"),
      );
      const sessionValue = callSession || callSessionFallback;

      if (sessionValue) {
        // 4. Prevent the default paste behavior and set the state
        e.preventDefault();
        setSessionId(sessionValue);
      }
    } catch (err) {}
  };

  return (
    <>
      <div className="col gap-6 p-4">
        <div className="flex flex-col gap-2">
          <AppTypo variant="small" color="secondary" type="label">
            {t("display_name")}
          </AppTypo>
          <Input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder={t("enter_name")}
            disabled={isLoading}
          />
        </div>

        {/* Call type selector */}
        <div className="flex flex-col gap-2">
          <AppTypo variant="small" color="secondary" type="label">
            {t("select_call_type")}
          </AppTypo>
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={sharedIcons.call}
              selected={callType === "audio"}
              onClick={() => setCallType("audio")}
              disabled={isLoading}
              className="flex-1"
            >
              {t("audio_call")}
            </Button>
            <Button
              icon={sharedIcons.video}
              selected={callType === "video"}
              onClick={() => setCallType("video")}
              disabled={isLoading}
              className="flex-1"
            >
              {t("video_call")}
            </Button>
          </div>
        </div>

        <OrDivider title={t("choose_option")} />

        <CallBox
          icon={sharedIcons.user_group}
          title={t("start_call")}
          subtitle={t("start_call_desc")}
        >
          <Button
            onClick={create}
            icon="hugeicons:call-add"
            isPending={pendingCreate}
            disabled={isLoading}
            className="w-full !gap-2"
          >
            {t("start")}
          </Button>
        </CallBox>

        <CallBox
          icon={sharedIcons.plus}
          title={t("join_call")}
          subtitle={t("join_call_desc")}
        >
          <div className="col gap-2">
            <AppTypo variant="small" color="secondary" type="label">
              {t("session_id")}
            </AppTypo>
            <Input
              value={sessionId}
              onChange={e => setSessionId(e.target.value)}
              placeholder={t("session_id_placeholder")}
              disabled={isLoading}
              onPaste={handlePaste}
            />
            <Button
              onClick={join}
              className="w-full !gap-2 mt-1"
              icon="hugeicons:call-incoming-01"
              disabled={isLoading}
              isPending={pendingJoin}
            >
              {t("join")}
            </Button>
          </div>
        </CallBox>
      </div>
    </>
  );
};

export default StartCall;
