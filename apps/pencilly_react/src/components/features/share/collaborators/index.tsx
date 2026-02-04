import type React from "react";
import { useState } from "react";

import { SocketId } from "@excalidraw/excalidraw/types";

import CollaboratorCard from "@/components/features/share/collaborators/CollaboratorCard";
import EmptyCollabMessage from "@/components/features/share/collaborators/EmptyCollabMessage";
import { useCollaboratorsActions } from "@/hooks/collaboration/useCollaboratorsActions";
import ConfirmAlert from "@/components/shared/ConfirmAlert";
import DynamicButton from "@/components/shared/DynamicButton";
import PopupHeader from "@/components/shared/PopupHeader";
import { Show } from "@/components/shared/Show";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { isEmpty } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface CollaboratorsPopupProps {
  collaborators: CollabAPI["collaborators"];
  setCollaborators: CollabAPI["setCollaborators"];
  isCurrentOwner: boolean;
  trigger?: React.ReactNode;
  sendKickCollaboratorMessage: (id: SocketId) => void;
}

export function CollaboratorsPopup({
  collaborators,
  trigger,
  isCurrentOwner,
  setCollaborators,
  sendKickCollaboratorMessage,
}: CollaboratorsPopupProps) {
  const t = useTranslations("share.collaborators_popup");
  const [open, setOpen] = useState(false);

  const {
    handleRemoveClick,
    handleScopeChange,
    handleRemoveConfirm,
    pendingId,
    removeDialogOpen,
    setRemoveDialogOpen,
    selectedCollaborator,
  } = useCollaboratorsActions(collaborators, setCollaborators);

  const collaboratorsList = Array.from(collaborators.entries()).map(
    ([id, collab]) => ({
      id,
      ...collab,
    }),
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          {trigger || (
            <DynamicButton
              variant="outline"
              icon={sharedIcons.user_group}
              title={collaboratorsList.length?.toString() || "0"}
              element="div"
              className="!h-full"
            />
          )}
        </PopoverTrigger>
        <PopoverContent className="w-64 sm:w-80  p-3.5" align="end">
          <PopupHeader
            icon={sharedIcons.user_group}
            title={t("collaborators_title")}
            subtitle={t("collaborators_description")}
            onClose={() => setOpen(false)}
            rootClassName="mb-3.5"
          />
          <Show>
            <Show.When isTrue={isEmpty(collaboratorsList)}>
              <EmptyCollabMessage />
            </Show.When>
            <Show.Else>
              <div className="max-h-[400px]  overflow-y-auto ">
                <div className="col gap-2">
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
                </div>
              </div>
            </Show.Else>
          </Show>
        </PopoverContent>
      </Popover>

      <ConfirmAlert
        title={t("action_remove_confirm")}
        btnTitle={t("action_remove")}
        message={t("action_remove_description").replace(
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
}
