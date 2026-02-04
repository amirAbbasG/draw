import type { Participant } from "@/components/features/call/types";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

interface ParticipantsListProps {
  participants: Participant[];
  className?: string;
}

export function ParticipantsList({
  participants,
  className,
}: ParticipantsListProps) {
  const t = useTranslations("call");

  return (
    <div className={cn("h-full overflow-y-auto", className)}>
      <div className="flex flex-col gap-2 p-3">
        {participants.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <AppTypo variant="small" color="muted">
              {t("no_participants")}
            </AppTypo>
          </div>
        ) : (
          participants.map(participant => (
            <ParticipantItem
              key={participant.identity}
              participant={participant}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ParticipantItem({ participant }: { participant: Participant }) {
  const t = useTranslations("call");

  return (
    <div className="flex items-center gap-3 rounded bg-muted p-3">
      <UserAvatar
        name={participant.name || participant.identity}
        imageSrc={participant.profileImage || ""}
      />
      <div className="flex-1 col  gap-0.5">
        <AppTypo
          variant="small"
          className="font-medium first-letter:capitalize"
        >
          {participant.name || participant.identity}
        </AppTypo>
        {participant.isLocal && (
          <AppTypo variant="xs" color="secondary">
            {t("you")}
          </AppTypo>
        )}
      </div>
      {participant.isSpeaking && (
        <div className="size-2  animate-pulse rounded-full bg-success" />
      )}
    </div>
  );
}
