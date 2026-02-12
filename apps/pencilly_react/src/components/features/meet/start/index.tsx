import React, { useEffect, useState, type FC } from "react";

import {ConnectionState, StreamSession} from "@/components/features/call/types";
import { CallBox } from "@/components/features/meet/start/CallBox";
import { Button } from "@/components/ui/button";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import { useUser } from "@/stores/context/user";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";
import {OrDivider} from "@/components/shared/OrDivider";

interface IProps {
  handleStartCall: () => Promise<StreamSession>;
  getSession: (sessionId: string) => Promise<StreamSession | null>;
  handleJoin: (name?: string, newSession?: StreamSession) => Promise<void>;
  connectionState: ConnectionState
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

        <OrDivider title={t("choose_option")}/>

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
