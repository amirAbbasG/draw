import { useEffect, useState } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import PopupHeader from "@/components/shared/PopupHeader";
import { Button } from "@/components/ui/button";
import AppTypo from "@/components/ui/custom/app-typo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { PendingJoinRequest } from "@/hooks/collaboration/useCollaboration";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface JoinRequestPopupProps {
  requests: PendingJoinRequest[];
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}

export function JoinRequestPopup({
  requests,
  onApprove,
  onDeny,
}: JoinRequestPopupProps) {
  const t = useTranslations("share.join_request");
  const [currentRequest, setCurrentRequest] =
    useState<PendingJoinRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (requests.length > 0 && !currentRequest) {
      setCurrentRequest(requests[0]);
      setIsOpen(true);
    } else if (requests.length === 0) {
      setCurrentRequest(null);
      setIsOpen(false);
    }
  }, [requests, currentRequest]);

  const handleApprove = () => {
    if (currentRequest) {
      onApprove(currentRequest.id);
      setCurrentRequest(null);
    }
  };

  const handleDeny = () => {
    if (currentRequest) {
      onDeny(currentRequest.id);
      setCurrentRequest(null);
    }
  };

  if (!currentRequest) return null;

  return (
    <Popover open={isOpen}>
      <PopoverTrigger className="fixed top-10 end-4 h-5 ">
        <></>
      </PopoverTrigger>
      <PopoverContent align="end" className="border p-3.5 z-100">
        <PopupHeader
          title={t("title")}
          icon={sharedIcons.user_add}
          subtitle={t("description")}
        />

        <div className="centered-col gap-2 py-3.5">
          <UserAvatar
            imageSrc={currentRequest.avatarUrl}
            name={currentRequest.username}
            className="size-12"
          />

          <AppTypo className="font-semibold ">
            {currentRequest.username}
          </AppTypo>
          <AppTypo variant="small" color="secondary">
            {t("user_wants_to_join")}
          </AppTypo>
        </div>

        <div className="flex gap-3 justify-center pt-1">
          <Button
            variant="outline"
            icon={sharedIcons.close}
            onClick={handleDeny}
          >
            {t("deny")}
          </Button>
          <Button icon={sharedIcons.check} onClick={handleApprove}>
            {t("approve")}
          </Button>
        </div>

        {requests.length > 1 && (
          <AppTypo type="p" variant="small" color="secondary" className="text-center mt-4 pt-3.5 border-t ">
            +{requests.length - 1} {t("more_pending")}
          </AppTypo>
        )}
      </PopoverContent>
    </Popover>
  );
}
