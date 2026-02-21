import React, { useMemo, type FC } from "react";

import { decorators } from "@/components/features/meet/constants";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn, isEmpty } from "@/lib/utils";

import type { MeetUser } from "../types";
import {AppTooltip} from "@/components/ui/custom/app-tooltip";
import {useTranslations} from "@/i18n";

interface MentionPopupProps {
  members: MeetUser[];
  filter?: string;
  onSelect: (mention: string) => void;
  onClose?: () => void;
  className?: string;
  textDecorators?: string[];
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
  textDecorators = [],
}) => {
  const t = useTranslations("meet.chat")
  const hasMembers = !isEmpty(members);

  const filteredMembers = useMemo(() => {
    if (!hasMembers) return [];
    if (!filter) return members;
    const lower = filter.toLowerCase();
    return members.filter(m => m.name.toLowerCase().includes(lower));
  }, [members, filter, hasMembers]);

  const filteredDecorators = useMemo(() => {
    if (!filter) return decorators;
    const lower = filter.toLowerCase();
    return decorators.filter(
      d => d.title.includes(lower) || d.description.includes(lower),
    );
  }, [filter]);

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-popover shadow-lg overflow-hidden max-h-48 overflow-y-auto",
        className,
      )}
    >
      {/* AI mention - always first */}
      {filteredDecorators.map(decorator => (
          <AppTooltip title={!!textDecorators?.length ? t("only_one_decorator") : undefined} key={decorator.id}>
        <button
          type="button"
          disabled={textDecorators.includes(decorator.key)}
          className={cn(
              "flex items-center gap-2.5 px-3 py-2 hover:bg-primary-lighter transition-colors text-start",
                !!textDecorators?.length && "opacity-80 !cursor-not-allowed",
              textDecorators.includes(decorator.key) && "bg-primary-lighter"
          )}
          onMouseDown={e => {
            e.preventDefault();
            onSelect(decorator.key);
          }}
        >
          <div className="size-7 rounded-full bg-primary-lighter flex items-center justify-center shrink-0">
            <AppIcon icon={decorator.icon} className="size-4 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <AppTypo variant="small" className="font-semibold">
              {decorator.title}
            </AppTypo>
            <AppTypo variant="xs" color="secondary">
              {decorator.description}
            </AppTypo>
          </div>
        </button>
          </AppTooltip>
      ))}

      {/* Member list (fallback MeetUser-based) */}
      {hasMembers &&
        filteredMembers.map(member => (
          <button
            key={member.id}
            type="button"
            className="flex items-center gap-2.5 px-3 py-2 hover:bg-primary-lighter transition-colors text-start"
            onMouseDown={e => {
              e.preventDefault();
              onSelect(member.username.replace(/\s+/g, ""));
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
      {!filteredDecorators.length && !hasMembers && (
        <div className="px-3 py-4 flex items-center justify-center">
          <AppTypo variant="xs" color="muted">
            {"no_match"}
          </AppTypo>
        </div>
      )}
    </div>
  );
};

export default MentionPopup;
