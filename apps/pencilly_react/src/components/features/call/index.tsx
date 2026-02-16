import React, { useEffect, useState, type FC } from "react";

import { CallDrawerContent } from "@/components/features/call/CallDrawerContent";
import { useLiveKit } from "@/components/features/meet/hooks/useLiveKit";
import { useStreamSession } from "@/components/features/meet/hooks/useStreamSession";
import { StreamSession } from "@/components/features/call/types";
import AppDrawer from "@/components/shared/AppDrawer";
import DynamicButton from "@/components/shared/DynamicButton";
import RenderIf from "@/components/shared/RenderIf";
import { useCustomSearchParams } from "@/hooks/useCustomSearchParams";
import { sharedIcons } from "@/constants/icons";
import { CALL_SESSION_KEY } from "@/constants/keys";
import { useTranslations } from "@/i18n";

interface CallDrawerProps {
  sessionId?: string;
  Trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CallDrawer: FC<CallDrawerProps> = ({
  sessionId,
  Trigger,
  open: controlledOpen,
  onOpenChange,
}) => {
  const t = useTranslations("call");
  const [internalOpen, setInternalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [sessionFromUrl, setSessionFromUrl] = useState<StreamSession | null>(
    null,
  );
  const { removeParam, currentValue: paramRoom } =
    useCustomSearchParams(CALL_SESSION_KEY);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const streamSessionAPI = useStreamSession({
    onError: setStatusMessage,
  });

  const liveKitAPI = useLiveKit({
    onStatusChange: setStatusMessage,
  });

  const { session, getSession } = streamSessionAPI;

  useEffect(() => {
    if (paramRoom && !session) {
      getSession(paramRoom)
        .then(data => {
          if (data) {
            setStatusMessage(t("session_created"));
            setSessionFromUrl(data);
            setIsOpen(true);
          }
        })
        .catch(() => {
          removeParam(CALL_SESSION_KEY);
        });
    }
  }, [paramRoom]);

  const defaultTrigger = (
    <DynamicButton
      icon={sharedIcons.call}
      title={t("call")}
      variant="outline"
      hideLabel
      className="relative"
    >
      <RenderIf isTrue={liveKitAPI.connectionState === "connected"}>
        <div className="absolute size-3 rounded-full bg-success centered-col border-2 border-white -top-1 -end-1 ">
          <span className="bg-success size-1.5 rounded-full animate-ping shadow-lg shadow-success-light" />
        </div>
      </RenderIf>
    </DynamicButton>
  );

  return (
    <AppDrawer
      open={isOpen}
      setOpen={setIsOpen}
      title={t("call")}
      Trigger={Trigger || defaultTrigger}
      needsAuth
      contentClassName=" overflow-x-hidden"
      modal={false}
    >
      <CallDrawerContent
        sessionId={sessionId}
        className="flex-1 overflow-x-hidden"
        streamSessionAPI={streamSessionAPI}
        liveKitAPI={liveKitAPI}
        statusMessage={statusMessage}
        setStatusMessage={setStatusMessage}
        sessionFromUrl={sessionFromUrl}
        setSessionFromUrl={setSessionFromUrl}
      />
    </AppDrawer>
  );
};

export default CallDrawer;
