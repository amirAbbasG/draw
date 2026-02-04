import React, { useEffect, useState, type FC } from "react";

import type { StreamSession } from "@/components/features/call/types";
import { OrDivider } from "@/components/shared/OrDivider";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUser } from "@/stores/context/user";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface CallBoxProps {
  icon: string;
  title: string;
  subtitle: string;
  iconClassName?: string;
  rootClassName?: string;
}

const CallBox: FC<PropsWithChildren<CallBoxProps>> = ({
  children,
  icon,
  iconClassName,
  rootClassName,
  subtitle,
  title,
}) => {
  return (
    <div
      className={cn(
        "rounded border p-3 col gap-3 hover:border-primary transition-colors",
        rootClassName,
      )}
    >
      <div className="row gap-3 mb-3">
        <AppIcon
          icon={icon}
          className={cn(
            "h-10 w-10 rounded-lg bg-primary-light/10 centered-col text-primary p-2.5",
            iconClassName,
          )}
        />
        <div className="col gap-0.5">
          <AppTypo variant="headingXS" type="h3">
            {title}
          </AppTypo>
          <AppTypo variant="small" color="secondary">
            {subtitle}
          </AppTypo>
        </div>
      </div>
      {children}
    </div>
  );
};

interface IProps {
  displayName: string;
  setDisplayName: (name: string) => void;
  handleStartCall: () => Promise<StreamSession>;
  getSession: (sessionId: string) => Promise<StreamSession | null>;
  handleJoin: (name?: string, newSession?: StreamSession) => Promise<void>;
  existingSession?: StreamSession | null;
  isLeaving?: boolean;
  isPendingUrlRoom?: boolean;
}

const StartCall: FC<IProps> = ({
  getSession,
  handleJoin,
  handleStartCall,
  existingSession,
  isLeaving,
  isPendingUrlRoom,
  displayName,
  setDisplayName,
}) => {
  const t = useTranslations("call");
  const [sessionId, setSessionId] = useState("");
  const [pendingCreate, setPendingCreate] = useState(false);
  const [pendingJoin, setPendingJoin] = useState(false);
  const [pendingRejoin, setPendingRejoin] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
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
    const session = await handleStartCall();
    if (session) {
      await handleJoin(displayName, session);
    }
    setPendingCreate(false);
  };

  const join = async () => {
    setPendingJoin(true);
    const session = await getSession(sessionId);
    if (session) {
      await handleJoin(displayName, session);
    }
  };

  const rejoin = async () => {
    if (!existingSession) return;
    setPendingRejoin(true);
    setJoinError(null);
    await handleJoin(displayName, existingSession);
    setPendingRejoin(false);
  };

  const isLoading = pendingCreate || pendingJoin;

  return (
    <div className="col gap-4 p-4">
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

      {existingSession && !isLoading && !isLeaving && !isPendingUrlRoom && (
        <CallBox
          icon={sharedIcons.restore}
          title={t("rejoin_call")}
          subtitle={t("rejoin_call_desc")}
          rootClassName="border-primary/50 bg-primary/5"
        >
          <div className="flex items-center gap-2">
            <AppTypo variant="xs" color="secondary">
              {t("room_name")}:
            </AppTypo>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {existingSession?.room_name}
            </code>
          </div>
          <Button
            onClick={rejoin}
            disabled={isLoading}
            className="w-full gap-2"
            isPending={pendingRejoin}
          >
            {t("rejoin")}
          </Button>
        </CallBox>
      )}

      <OrDivider title={t("choose_option")} className="my-2" />

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
          {joinError && (
            <AppTypo variant="xs" className="text-destructive">
              {joinError}
            </AppTypo>
          )}
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
  );
};

export default StartCall;
