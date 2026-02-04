import React, {
  useEffect,
  useRef,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";

import ActiveSession from "@/components/features/share/ActiveSession";
import { InitialMenu } from "@/components/features/share/InitialMenu";
import LiveShare from "@/components/features/share/LiveShare";
import SharableLink from "@/components/features/share/SharableLink";
import ShareTrigger from "@/components/features/share/ShareTrigger";
import { Show } from "@/components/shared/Show";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
} from "@/components/ui/dialog";
import { useCustomSearchParams } from "@/hooks/useCustomSearchParams";
import { setActiveHistory } from "@/stores/zustand/ui/actions";
import { HISTORY_KEY } from "@/constants/keys";

interface IProps {
  onClose: () => void;
  isOpen: boolean;
  link: string;
  collabAPI: CollabAPI;
  onExportToBackend: () => void;
  clearLink: () => void;
  isPendingExport: boolean;
}

const ShareDialog: FC<PropsWithChildren<IProps>> = ({
  onClose,
  link,
  isOpen,
  collabAPI,
  onExportToBackend,
  clearLink,
  isPendingExport,
}) => {
  const [showCollaboration, setShowCollaboration] = useState(false);
  const stopSessionRef = useRef<(() => void) | null>(null);
  const { removeParam } = useCustomSearchParams();

  const {
    isCollaborating,
    startCollaboration,
    username,
    setUsername,
    roomId,
    paramRoom,
    shouldJoinFromParam,
    collaborators,
  } = collabAPI;

  useEffect(() => {
    if (shouldJoinFromParam && !isCollaborating) {
      setShowCollaboration(true);
      void onStartSession(paramRoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldJoinFromParam]);

  const onOpenChange = (val: boolean) => {
    if (!val) onClose();
  };

  const onStartSession = async (room?: string) => {
    if (room) {
      setActiveHistory("");
      removeParam(HISTORY_KEY);
    }
    const stop = await startCollaboration(room);
    if (typeof stop === "function") stopSessionRef.current = stop;
  };

  const onStopSession = () => {
    stopSessionRef.current?.();
    stopSessionRef.current = null;
    setShowCollaboration(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 col  gap-0  z-100 responsive-dialog-sm">
        <DialogCloseButton className="absolute top-5 end-4" />
        <Show>
          <Show.When isTrue={!link && !showCollaboration}>
            <InitialMenu
              onLiveShareClick={() => setShowCollaboration(true)}
              onExportToLink={onExportToBackend}
              isPendingExport={isPendingExport}
            />
          </Show.When>

          <Show.When isTrue={!!link || !showCollaboration}>
            <SharableLink link={link} onClose={clearLink} />
          </Show.When>

          <Show.When isTrue={showCollaboration && !isCollaborating}>
            <LiveShare
              onClose={() => setShowCollaboration(false)}
              onStartSession={onStartSession}
              setUsername={setUsername}
              username={username}
            />
          </Show.When>

          <Show.Else>
            <ActiveSession
              collaborators={collaborators}
              roomId={roomId!}
              stopSession={onStopSession}
              userName={username}
            />
          </Show.Else>
        </Show>
      </DialogContent>
    </Dialog>
  );
};

export { ShareTrigger };

export default ShareDialog;
