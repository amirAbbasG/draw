import React, { useRef, type FC } from "react";

import AddUserPopup from "@/components/features/meet/AddUserPopup";
import MemberCard from "@/components/features/meet/chat/MemberCard";
import ConversationDeleteAlert from "@/components/features/meet/conversation/ConversationDeleteAlert";
import { useUpdateConversationInfo } from "@/components/features/meet/hooks/useUpdateConversationInfo";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import RenderIf from "@/components/shared/RenderIf";
import { Show } from "@/components/shared/Show";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppLoading from "@/components/ui/custom/app-loading";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { Conversation, MeetUser } from "../types";

interface ChatInfoProps {
  conversation: Conversation;
  onBack: () => void;
  onCall?: () => void;
  onMuteToggle?: () => void;
  onSettings?: () => void;
  onLeaveGroup?: () => void;
  /** Delete for everyone (owner only) */
  onDeleteForEveryone?: () => void;
  handeInviteUser: (
    user: MeetUser,
    inviteToCal?: boolean,
    conversationId?: string,
    includeChat?: number,
  ) => void;
  onDeleteMember: (memberId: string) => void;
  className?: string;
  /** Real members from API (overrides conversation.members) */
  apiMembers?: MeetUser[];
  chatWithMember: (user: MeetUser, me?: MeetUser) => void;
  isInCall?: boolean;
}

const ChatInfo: FC<ChatInfoProps> = ({
  conversation,
  onBack,
  onCall,
  onMuteToggle,
  onSettings,
  onLeaveGroup,
  onDeleteForEveryone,
  handeInviteUser,
  className,
  onDeleteMember,
  apiMembers,
  chatWithMember,
  isInCall,
}) => {
  const t = useTranslations("meet.chat.info");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isUpdating, updateConversationInfo, isUploading, uploadImage } =
    useUpdateConversationInfo(conversation.id);

  // Use API members if provided, otherwise fall back to conversation.members
  const members = apiMembers ?? conversation.members ?? [];
  const { title, profile_image_url, muted, role, isGroup, call_state } =
    conversation;
  const isOwner = role === "owner";
  const canCallAction = isOwner || call_state === "open";

  const displayTitle =
    title || members.map(m => m.name).join(", ") || "Conversation";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { url } = await uploadImage({ file: e.target.files?.[0] } as {
      file: File;
    });
    if (url) {
      updateConversationInfo({
        profile_image: url,
      });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "col h-full relative overflow-hidden bg-gradient-to-b from-primary-lighter from-5% to-15% to-background-lighter",
        className,
      )}
    >
      {/* Header - back button */}
      <div className="px-4 pt-4">
        <AppIconButton
          icon={sharedIcons.arrow_left}
          size="sm"
          onClick={onBack}
          title={t("back")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Avatar section */}
        <div className="centered-col p-4 gap-4">
          <div className="relative">
            <UserAvatar
              imageSrc={profile_image_url}
              name={displayTitle}
              className="!h-24 !w-24"
              backgroundColor="var(--bg-dark)"
            />
            <RenderIf isTrue={isUploading}>
              <AppLoading
                rootClass="center-position"
                svgClass="text-primary-lighter"
              />
            </RenderIf>
            <RenderIf isTrue={isGroup}>
              <AppIconButton
                icon={sharedIcons.edit}
                size="xs"
                variant="fill"
                onClick={handleAvatarClick}
                className="absolute bottom-1 right-1"
                disabled={isUpdating || isUploading}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </RenderIf>
          </div>

          <Show>
            <Show.When isTrue={isGroup}>
              <Input
                defaultValue={displayTitle}
                onBlur={e => {
                  const val = e.target.value.trim();
                  if (val && val !== displayTitle)
                    updateConversationInfo({ title: val });
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                aria-label={t("group_name")}
                className="bg-background"
                wrapperClassName="max-w-64"
              />
            </Show.When>
            <Show.Else>
              <AppTypo variant="headingS" className="text-center">
                {displayTitle}
              </AppTypo>
            </Show.Else>
          </Show>
        </div>

        {/* Action buttons row */}
        <div className="centered-row gap-2.5 px-4 pb-4 border-b">
          {/* Call */}
          <ActionButton
            icon={sharedIcons.call}
            label={t("call")}
            onClick={onCall}
            disabled={!canCallAction}
          />

          {/* Mute / Unmute notification */}
          <ActionButton
            icon={
              muted
                ? "hugeicons:notification-off-03"
                : "hugeicons:notification-snooze-03"
            }
            label={muted ? t("unmute") : t("mute")}
            onClick={onMuteToggle}
          />

          {/* Settings - owner only */}
          <RenderIf isTrue={isOwner && isGroup}>
            <ActionButton
              icon={sharedIcons.settings}
              label={t("settings")}
              onClick={onSettings}
            />
          </RenderIf>

          {/* Leave / Delete with confirmation */}
          <div>
            <ConversationDeleteAlert
              onLeaveGroup={onLeaveGroup}
              onDeleteForEveryone={onDeleteForEveryone}
              isOwner={isOwner}
              isGroup={isGroup}
              renderTrigger={label => (
                <ActionButton icon={sharedIcons.logout} label={label} />
              )}
            />
          </div>
        </div>

        {/* Members list */}
        <RenderIf isTrue={(isGroup ?? false) || members.length > 0}>
          <div className="py-2 bg-background-lighter">
            <div className="spacing-row px-2">
              <AppTypo variant="headingS">
                {t("members")} ({members.length})
              </AppTypo>
              <AddUserPopup
                onInvite={(user, includeChat) =>
                  handeInviteUser(user, false, conversation.id, includeChat)
                }
              />
            </div>

            <div className="col gap-1">
              {members.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onAddToCall={isInCall ? handeInviteUser : undefined}
                  isOwner={isOwner}
                  onDeleteMember={onDeleteMember}
                  onClick={
                    member.isCurrentUser
                      ? undefined
                      : () => {
                          chatWithMember(member);
                          onBack();
                        }
                  }
                />
              ))}
            </div>
          </div>
        </RenderIf>
      </div>
    </div>
  );
};

export default ChatInfo;

/* ---------- Sub-components ---------- */

interface ActionButtonProps {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ActionButton: FC<ActionButtonProps> = ({
  icon,
  label,
  onClick,
  disabled,
}) => (
  <AppIconButton
    type="button"
    icon={icon}
    variant="fill"
    color="background"
    className="h-11 w-[52px] shrink-0"
    title={label}
    onClick={onClick}
    disabled={disabled}
  />
);
