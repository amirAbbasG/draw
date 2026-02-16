import React, { useEffect, useState, type FC } from "react";

import type { StreamSession } from "@/components/features/call/types";
import { CallBox } from "@/components/features/meet/start/CallBox";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import { useUser } from "@/stores/context/user";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";
import { OrDivider } from "@/components/shared/OrDivider";
import { cn } from "@/lib/utils";

import type { CallType, ConnectionState } from "../types";

interface IProps {
  handleStartCall: (callType?: CallType) => Promise<StreamSession | null>;
  getSession: (sessionId: string) => Promise<StreamSession | null>;
  handleJoin: (sessionId: string, callType?: CallType) => Promise<void>;
  connectionState: ConnectionState;
}

const StartCall: FC<IProps> = ({
  getSession,
  handleJoin,
  handleStartCall,
}) => {
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
    const session = await handleStartCall(callType);
    setPendingCreate(false);
  };

  const join = async () => {
    if (!sessionId.trim()) return;
    setPendingJoin(true);
    await handleJoin(sessionId, callType);
    setPendingJoin(false);
  };

  const isLoading = pendingCreate || pendingJoin;

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
            <CallTypeButton
              icon={sharedIcons.call}
              label={t("audio_call")}
              isActive={callType === "audio"}
              onClick={() => setCallType("audio")}
              disabled={isLoading}
            />
            <CallTypeButton
              icon={sharedIcons.video}
              label={t("video_call")}
              isActive={callType === "video"}
              onClick={() => setCallType("video")}
              disabled={isLoading}
            />
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

/* ---------- Sub-component ---------- */

const CallTypeButton: FC<{
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, label, isActive, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 transition-colors",
      isActive
        ? "border-primary bg-primary/10 text-primary"
        : "border-border bg-background hover:bg-muted text-foreground-light",
      disabled && "opacity-50 cursor-not-allowed",
    )}
  >
    <AppIcon icon={icon} className="size-4" />
    <AppTypo variant="small" className="font-medium">
      {label}
    </AppTypo>
  </button>
);
