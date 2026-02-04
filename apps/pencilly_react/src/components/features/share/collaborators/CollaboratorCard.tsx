import React, {type FC} from "react";

import { getClientColor } from "@excalidraw/excalidraw";
import { Collaborator, SocketId } from "@excalidraw/excalidraw/types";

import { getStatusColor } from "@/components/features/share/utils";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import { Badge } from "@/components/ui/badge";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  collaborator: Collaborator;
  isOwner: boolean;
  onScopeChange?: (id: string, scope: Collaborator["roomInfo"]["scope"]) => void;
  handleRemoveClick?: (id: string) => void;
  isPending?: boolean;
}

const CollaboratorCard: FC<IProps> = ({
  collaborator,
  isOwner,
  onScopeChange,
  handleRemoveClick,
    isPending
}) => {
  const t = useTranslations("share.collaborators_popup");

  const isCurrentUser = collaborator.isCurrentUser;
  const isCollabOwner = collaborator.roomInfo?.role === "owner";
  // const isCollabOwner = collaborator.username === "me";
  const userScope = collaborator.roomInfo?.scope || "read_write";
  const canEdit = userScope === "read_write";

  const canManage = isOwner && !isCurrentUser && !isCollabOwner;


  const background = getClientColor(collaborator.id! as SocketId, collaborator);

  return (
    <div className={cn(
        "row gap-3 p-3 rounded border hover:bg-background transition-colors ",
        isPending && "animate-pulse bg-background"

    )}>
      {/* Avatar with status indicator */}
      <div className="relative">
        <UserAvatar
          className="size-10 text-sm  border-2 p-[2px] select-none "
          imageSrc={collaborator?.avatarUrl}
          name={collaborator?.username || "A"}
          backgroundColor={background}
          style={{ borderColor: background }}
        />
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-popover",
            getStatusColor(collaborator),
          )}
        />
      </div>

      {/* Name and role */}
      <div className="flex-1 min-w-0 col gap-0.5">
        <div className="flex items-center gap-2">
          <AppTypo className="font-medium truncate capitalize">
            {collaborator.username || "Anonymous"}
          </AppTypo>
          {isCurrentUser && (
            <Badge variant="default" className="text-xs px-1.5 py-0">
              {t("you_badge")}
            </Badge>
          )}
          {isCollabOwner && (
            <AppIcon
              icon="hugeicons:crown-03"
              className="h-4 w-4 text-yellow-500 shrink-0"
            />
          )}
        </div>
        <div className="row gap-2 text-sm text-foreground-light">
          {isCollabOwner ? (
            <span className="row gap-1">
              <AppIcon icon="hugeicons:shield-01" className="h-3 w-3" />
              {t("role_owner")}
            </span>
          ) : (
            <span className="row gap-1">
              <AppIcon icon={canEdit ? sharedIcons.edit : sharedIcons.view} className="size-4" />
              {t(canEdit ? "scope_read_write" : "scope_read_only")}
            </span>
          )}
        </div>
      </div>

      {/* Actions for owner */}
      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger disabled={isPending}>
            <AppIconButton
                disabled={isPending}
              icon={sharedIcons.more_horizontal}
              size="sm"
              element="div"
              title={t("action_change_access")}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger icon={canEdit ? sharedIcons.edit : sharedIcons.view}>
                {t("action_change_access")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-34 col gap-1" sideOffset={7}>
                <DropdownMenuItem
                    selected={userScope === "read_only"}
                    onClick={() => onScopeChange(collaborator.id, "read_only")}
                    icon={sharedIcons.view}
                >
                  {t("scope_read_only")}
                </DropdownMenuItem>
                <DropdownMenuItem
                    selected={canEdit}
                    onClick={() => onScopeChange(collaborator.id, "read_write")}
                    icon={sharedIcons.edit}
                >
                  {t("scope_read_write")}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onClick={() => handleRemoveClick(collaborator.id)}
              icon="hugeicons:user-minus-01"
            >
              {t("action_remove")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default CollaboratorCard;
