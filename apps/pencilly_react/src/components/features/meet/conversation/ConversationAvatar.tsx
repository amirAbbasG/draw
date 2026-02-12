import React, { FC } from "react";

import type { Conversation } from "@/components/features/meet/types";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import { sharedIcons } from "@/constants/icons";

interface ConversationAvatarProps {
  isGroup: boolean;
  avatarUrl?: string;
  members: Conversation["members"];
}

export const ConversationAvatar: FC<ConversationAvatarProps> = ({
  isGroup,
  avatarUrl,
  members,
}) => {
  if (isGroup) {
    if (avatarUrl) {
      return (
        <UserAvatar
          imageSrc={avatarUrl}
          name="Group"
          className="!h-12 text-xs"
        />
      );
    }

    return (
      <div className="size-12 rounded-full bg-primary-lighter flex items-center justify-center shrink-0">
        <AppIcon
          icon={sharedIcons.user_group}
          className="size-5 text-primary"
        />
      </div>
    );
  }

  const member = members[0];
  return (
    <UserAvatar
      imageSrc={member?.avatarUrl}
      name={member?.name ?? "Unknown"}
      className="size-12 text-sm"
    />
  );
};
