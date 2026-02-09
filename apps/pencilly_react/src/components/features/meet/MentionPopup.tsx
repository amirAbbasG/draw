import React, { type FC, useMemo } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";

import type { MeetUser } from "./types";

interface MentionPopupProps {
  members: MeetUser[];
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
  filter = "",
  onSelect,
  className,
}) => {
  const filteredMembers = useMemo(() => {
    if (!filter) return members;
    const lower = filter.toLowerCase();
    return members.filter(m => m.name.toLowerCase().includes(lower));
  }, [members, filter]);

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
            <AppIcon
              icon={sharedIcons.ai}
              className="size-4 text-primary"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <AppTypo variant="small" className="font-semibold">
              AI Assistant
            </AppTypo>
            <AppTypo variant="xs" color="secondary">
              Mention AI for help
            </AppTypo>
          </div>
        </button>
      )}

      {/* Member list */}
      {filteredMembers.map(member => (
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
      {!showAi && filteredMembers.length === 0 && (
        <div className="px-3 py-4 flex items-center justify-center">
          <AppTypo variant="xs" color="muted">
            No matches found.
          </AppTypo>
        </div>
      )}
    </div>
  );
};

export default MentionPopup;
