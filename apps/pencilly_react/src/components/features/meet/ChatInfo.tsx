"use client";

import React, { useRef, useState, type FC } from "react";

import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import AppIcon from "@/components/ui/custom/app-icon";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { Conversation, ChatView } from "./types";

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
  onCallMember?: (memberId: string) => void;
  className?: string;
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
}) => {
  const t = useTranslations("meet.info");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isGroup, members, title, avatarUrl } = conversation;

  const displayTitle = title || members.map((m) => m.name).join(", ");

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
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Header - back button */}
      <div className="flex items-center px-4 py-3 border-b bg-popover">
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
        <div className="flex flex-col items-center px-4 pt-6 pb-4 gap-4">
          {/* Group / User avatar with edit overlay */}
          <div className="relative">
            <UserAvatar
              imageSrc={avatarUrl}
              name={displayTitle}
              className="!h-24 !w-24"
            />
            {isGroup && (
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute -bottom-1 -right-1 h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary-dark transition-colors"
                aria-label={t("change_avatar")}
              >
                <AppIcon icon={sharedIcons.edit} fontSize={18} />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Group name - editable for groups */}
          <div className="w-full max-w-xs">
            {isGroup ? (
              <input
                defaultValue={displayTitle}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && val !== displayTitle) onNameChange?.(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                className="w-full text-center text-sm bg-background-lighter border border-background-dark rounded px-3 py-2 outline-none focus:border-primary transition-colors text-foreground"
                aria-label={t("group_name")}
              />
            ) : (
              <AppTypo
                variant="headingXXS"
                className="text-center truncate"
              >
                {displayTitle}
              </AppTypo>
            )}
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center justify-center gap-1 px-4 pb-4 border-b">
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
            active={isMuted}
          />

          {/* Settings - owner only */}
          {isGroup && isOwner && (
            <ActionButton
              icon={sharedIcons.settings}
              label={t("settings")}
              onClick={onSettings}
            />
          )}

          {/* Leave group */}
          {isGroup && (
            <ActionButton
              icon={sharedIcons.logout}
              label={t("leave")}
              onClick={onLeaveGroup}
              danger
            />
          )}
        </div>

        {/* Members list - groups only */}
        {isGroup && (
          <div className="px-4 py-4">
            <AppTypo variant="small" className="font-semibold mb-3">
              {t("members")} ({members.length})
            </AppTypo>

            <div className="flex flex-col gap-1">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-background-lighter transition-colors"
                >
                  <UserAvatar
                    imageSrc={member.avatarUrl}
                    name={member.name}
                    className="!h-10 !w-10"
                  />
                  <AppTypo variant="small" className="flex-1 truncate font-medium">
                    {member.name}
                  </AppTypo>
                  <AppIconButton
                    icon={sharedIcons.call}
                    size="sm"
                    variant="ghost"
                    title={t("call")}
                    onClick={() => onCallMember?.(member.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
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
  active?: boolean;
  danger?: boolean;
}

const ActionButton: FC<ActionButtonProps> = ({
  icon,
  label,
  onClick,
  active,
  danger,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1.5 px-4 py-2 rounded-lg transition-colors",
      "hover:bg-background-lighter",
      active && "text-primary",
      danger && "text-danger hover:text-danger-dark",
    )}
  >
    <div
      className={cn(
        "h-10 w-10 rounded-lg border flex items-center justify-center",
        danger
          ? "border-danger/30"
          : active
            ? "border-primary/30"
            : "border-background-darker",
      )}
    >
      <AppIcon icon={icon} fontSize={20} />
    </div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);
