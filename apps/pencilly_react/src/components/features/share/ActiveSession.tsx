import React, { type FC } from "react";

import { SocketId } from "@excalidraw/excalidraw/types";
import { useShallow } from "zustand/react/shallow";

import ActionBox from "@/components/features/share/ActionBox";
import CollaboratorCard from "@/components/features/share/CollaboratorCard";
import { ROOM_KEY } from "@/components/features/share/constants";
import CopyValue from "@/components/features/share/CopyValue";
import ConfirmAlert from "@/components/shared/ConfirmAlert";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCollaboratorsActions } from "@/hooks/collaboration/useCollaboratorsActions";
import { useCollaborateStore } from "@/stores/zustand/collaborate/collaborate-store";
import { envs } from "@/constants/envs";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  stopSession: () => void;
  userName: string;
  isCurrentOwner: boolean;
  sendKickCollaboratorMessage: (id: SocketId) => void;
}

const ActiveSession: FC<IProps> = ({
  stopSession,
  userName,
  isCurrentOwner,
  sendKickCollaboratorMessage,
}) => {
  const t = useTranslations("share");
  const [collaborators, roomId] = useCollaborateStore(
    useShallow(s => [s.collaborators, s.roomId]),
  );

  const {
    handleRemoveClick,
    handleScopeChange,
    handleRemoveConfirm,
    pendingId,
    removeDialogOpen,
    setRemoveDialogOpen,
    selectedCollaborator,
  } = useCollaboratorsActions();

  const collaboratorsList = Array.from(collaborators.entries()).map(
    ([id, collab]) => ({
      id,
      ...collab,
    }),
  );

  return (
    <>
      <DialogHeader className="px-6 py-4 border-b ">
        <DialogTitle className="text-2xl font-semibold">
          {t("active_session")}
        </DialogTitle>
      </DialogHeader>

      <div className="px-6 py-6 space-y-6">
        {/* Session Status Card */}

        <ActionBox
          icon={sharedIcons.live}
          title={t("hosting_session")}
          subtitle={`${t("connected_as")} ${userName || t("anonymous")}`}
        >
          <div className="col gap-1 max-h-44 overflow-y-auto">
            {collaboratorsList.map(collaborator => (
              <CollaboratorCard
                collaborator={collaborator}
                isOwner={isCurrentOwner}
                handleRemoveClick={handleRemoveClick}
                onScopeChange={handleScopeChange}
                key={collaborator.id}
                isPending={pendingId === collaborator.id}
              />
            ))}
            {/*<div className=" flex -space-x-2 ">*/}
            {/*{Array.from(collaborators.entries()).map(([id, user]) => {*/}
            {/*  const userColor = getClientColor(id, user)*/}
            {/*  return (*/}
            {/*      <AppTooltip title={user.username} key={user.id} asChild={false}>*/}
            {/*        <UserAvatar*/}
            {/*            className="size-6 text-xs  border-1 p-[1px] select-none "*/}
            {/*            imageSrc={user.avatarUrl}*/}
            {/*            name={user.username}*/}
            {/*            backgroundColor={userColor}*/}
            {/*            style={{borderColor: userColor}}*/}
            {/*        />*/}
            {/*      </AppTooltip>*/}
            {/*  )*/}
            {/*})}*/}
            {/*</div>*/}

            {/*<span className="text-foreground-light pt-0.5">*/}
            {/*  {participantCount}{" "}*/}
            {/*  {participantCount === 1 ? t("participant") : t("participants")}*/}
            {/*</span>*/}
          </div>
        </ActionBox>

        {/* Room ID Card */}

        <CopyValue
          value={`${envs.siteUrl}?tab=2d_canvas&${ROOM_KEY}=${roomId}`}
          title={t("room_link")}
          description={t("room_link_desc")}
        />
        <CopyValue
          value={roomId}
          title={t("room_id")}
          description={t("room_id_desc")}
        />

        {/* Info Box */}
        {/*<NoteBox note={t("live_active_note")} title={t("live_active")}/>*/}

        {/* Stop Session Button */}
        <Button
          color="danger"
          size="lg"
          className="w-full !h-10"
          onClick={stopSession}
        >
          <AppIcon icon={sharedIcons.logout} className="mr-2 h-4 w-4" />
          {t("stop_session")}
        </Button>
      </div>
      <ConfirmAlert
        title={t("collaborators_popup.action_remove_confirm")}
        btnTitle={t("collaborators_popup.action_remove")}
        message={t("collaborators_popup.action_remove_description").replace(
          "{{name}}",
          collaborators?.get(selectedCollaborator as SocketId)?.username || "",
        )}
        onAccept={() =>
          handleRemoveConfirm(id => sendKickCollaboratorMessage(id as SocketId))
        }
        open={removeDialogOpen}
        setOpen={setRemoveDialogOpen}
        isDanger
      />
    </>
  );
};

export default ActiveSession;
