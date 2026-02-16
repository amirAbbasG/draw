import React, { useMemo, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";

import type { MeetUser } from "../types";
import {useTranslations} from "@/i18n";

interface MentionMember {
  username: string;
  displayName: string;
  avatarUrl?: string;
}

interface MentionPopupProps {
  members: MeetUser[];
  /** Optional mention-specific members with username for @mention */
  mentionMembers?: MentionMember[];
  filter?: string;
  onSelect: (mention: string) => void;
  onClose?: () => void;
  className?: string;
}

/**
 * A popup list of mentionable users (+ AI) for the chat input.
 * Shown when user types `@` or clicks the mention button.
 */
const MentionPopup: FC<MentionPopupProps> = ({
  members,
  mentionMembers,
  filter = "",
  onSelect,
  className,
}) => {
    const t = useTranslations("meet.chat");

  // If mentionMembers are provided, use those (username-based); otherwise fall back to MeetUser[]
  const hasMentionMembers = mentionMembers && mentionMembers.length > 0;

  const filteredMentionMembers = useMemo(() => {
    if (!hasMentionMembers) return [];
    const list = mentionMembers!;
    if (!filter) return list;
    const lower = filter.toLowerCase();
    return list.filter(m =>
      m.displayName.toLowerCase().includes(lower) ||
      m.username.toLowerCase().includes(lower),
    );
  }, [mentionMembers, filter, hasMentionMembers]);

  const filteredMembers = useMemo(() => {
    if (hasMentionMembers) return [];
    if (!filter) return members;
    const lower = filter.toLowerCase();
    return members.filter(m => m.name.toLowerCase().includes(lower));
  }, [members, filter, hasMentionMembers]);

  const showAi = !filter || "ai".includes(filter.toLowerCase());

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-popover shadow-lg overflow-hidden max-h-48 overflow-y-auto",
        className,
      )}
    >
      {/* AI mention - always first */}
      {showAi && (
        <button
          type="button"
          className="flex items-center gap-2.5 px-3 py-2 hover:bg-primary-lighter transition-colors text-start"
          onMouseDown={e => {
            e.preventDefault();
            onSelect("ai");
          }}
        >
          <div className="size-7 rounded-full bg-primary-lighter flex items-center justify-center shrink-0">
            <AppIcon icon={sharedIcons.ai} className="size-4 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <AppTypo variant="small" className="font-semibold">
                {t("ai_assistant")}
            </AppTypo>
            <AppTypo variant="xs" color="secondary">
                {t("mention_ai")}
            </AppTypo>
          </div>
        </button>
      )}

      {/* Member list (username-based mentions) */}
      {hasMentionMembers && filteredMentionMembers.map(member => (
        <button
          key={member.username}
          type="button"
          className="flex items-center gap-2.5 px-3 py-2 hover:bg-primary-lighter transition-colors text-start"
          onMouseDown={e => {
            e.preventDefault();
            onSelect(member.username);
          }}
        >
          <UserAvatar
            imageSrc={member.avatarUrl}
            name={member.displayName}
            className="size-7 text-[10px]"
          />
          <div className="col min-w-0">
            <AppTypo variant="small">{member.displayName}</AppTypo>
            <AppTypo variant="xs" color="secondary">@{member.username}</AppTypo>
          </div>
        </button>
      ))}

      {/* Member list (fallback MeetUser-based) */}
      {!hasMentionMembers && filteredMembers.map(member => (
        <button
          key={member.id}
          type="button"
          className="flex items-center gap-2.5 px-3 py-2 hover:bg-primary-lighter transition-colors text-start"
          onMouseDown={e => {
            e.preventDefault();
            onSelect(member.name.replace(/\s+/g, ""));
          }}
        >
          <UserAvatar
            imageSrc={member.avatarUrl}
            name={member.name}
            className="size-7 text-[10px]"
          />
          <AppTypo variant="small">{member.name}</AppTypo>
        </button>
      ))}

      {/* Empty state */}
      {!showAi && filteredMembers.length === 0 && filteredMentionMembers.length === 0 && (
        <div className="px-3 py-4 flex items-center justify-center">
          <AppTypo variant="xs" color="muted">
              {("no_match")}
          </AppTypo>
        </div>
      )}
    </div>
  );
};

export default MentionPopup;
