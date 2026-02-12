import React, { useRef, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import RenderIf from "@/components/shared/RenderIf";
import { Show } from "@/components/shared/Show";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { Conversation } from "../types";

interface ChatInfoProps {
  conversation: Conversation;
  isOwner?: boolean;
  onBack: () => void;
  onCall?: () => void;
  onMuteToggle?: () => void;
  isMuted?: boolean;
  onSettings?: () => void;
  onLeaveGroup?: () => void;
  onAvatarChange?: (file: File) => void;
  onNameChange?: (name: string) => void;
  onCallMember: (memberId: string) => void;
  onDeleteMember: (memberId: string) => void;
  className?: string;
  isGroup?: boolean;
}

const ChatInfo: FC<ChatInfoProps> = ({
  conversation,
  isOwner = false,
  onBack,
  onCall,
  onMuteToggle,
  isMuted = false,
  onSettings,
  onLeaveGroup,
  onAvatarChange,
  onNameChange,
  onCallMember,
  className,
  onDeleteMember,
  isGroup,
}) => {
  const t = useTranslations("meet.chat.info");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { members, title, avatarUrl } = conversation;

  const displayTitle = title || members.map(m => m.name).join(", ");

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarChange?.(file);
    }
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
          {/* Group / User avatar with edit overlay */}
          <div className="relative">
            <UserAvatar
              imageSrc={avatarUrl}
              name={displayTitle}
              className="!h-24 !w-24 "
              backgroundColor="var(--bg-dark)"
            />
            <RenderIf isTrue={isGroup}>
              <AppIconButton
                icon={sharedIcons.edit}
                size="xs"
                variant="fill"
                onClick={handleAvatarClick}
                className="absolute bottom-1 right-1"
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
                  if (val && val !== displayTitle) onNameChange?.(val);
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                aria-label={t("group_name")}
                className="bg-background"
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
          />

          {/* Mute / Unmute notification */}
          <ActionButton
            icon={
              isMuted
                ? "hugeicons:notification-off-03"
                : "hugeicons:notification-snooze-03"
            }
            label={isMuted ? t("unmute") : t("mute")}
            onClick={onMuteToggle}
          />

          {/* Settings - owner only */}
          <RenderIf isTrue={isGroup}>
          {isOwner && (
            <ActionButton
              icon={sharedIcons.settings}
              label={t("settings")}
              onClick={onSettings}
            />
          )}

            <ActionButton
              icon={sharedIcons.logout}
              label={t("leave")}
              onClick={onLeaveGroup}
            />
          </RenderIf>
        </div>

        <RenderIf isTrue={isGroup}>
          <div className="py-2 bg-background-lighter">
            <AppTypo variant="headingS" className=" px-2">
              {t("members")} ({members.length})
            </AppTypo>

            <div className="col gap-1">
              {members.map(member => (
                <div
                  key={member.id}
                  className="row p-2 gap-2 hover:bg-background transition-colors"
                >
                  <UserAvatar
                    imageSrc={member.avatarUrl}
                    name={member.name}
                    className="size-12"
                  />
                  <AppTypo
                    variant="headingXS"
                    className="flex-1 truncate font-medium"
                  >
                    {member.name}
                  </AppTypo>
                  <AppIconButton
                    icon={sharedIcons.call}
                    size="sm"
                    variant="outline"
                    title={t("call")}
                    onClick={() => onCallMember?.(member.id)}
                  />
                  {isOwner && (
                    <AppIconButton
                      icon={sharedIcons.delete}
                      size="sm"
                      variant="outline"
                      color="danger"
                      title={t("delete")}
                      onClick={() => onDeleteMember(member.id)}
                    />
                  )}
                </div>
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
}

const ActionButton: FC<ActionButtonProps> = ({ icon, label, onClick }) => (
  <AppIconButton
    type="button"
    icon={icon}
    variant="fill"
    color="background"
    className="h-11 w-[52px]"
    title={label}
    onClick={onClick}
  />
);
