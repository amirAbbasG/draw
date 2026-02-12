import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";
import type { ScheduledMeeting } from "./types";

interface MeetingNotificationProps {
  meeting: ScheduledMeeting;
  onJoin?: () => void;
  onDismiss?: () => void;
  autoClose?: number; // milliseconds
  className?: string;
}

export const MeetingNotification: React.FC<MeetingNotificationProps> = ({
  meeting,
  onJoin,
  onDismiss,
  autoClose = 5000,
  className,
}) => {
  const t = useTranslations("meet.schedule");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground truncate">
            {meeting.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {meeting.startTime} - {meeting.endTime}
          </p>
          {meeting.participants.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {meeting.participants.length} participants
            </p>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 flex-shrink-0"
          onClick={() => {
            setIsVisible(false);
            onDismiss?.();
          }}
        >
          <AppIcon icon="hugeicons:x" className="w-3.5 h-3.5" />
        </Button>
      </div>
      {onJoin && (
        <Button
          size="sm"
          className="w-full mt-3 gap-1 text-xs h-7"
          onClick={() => {
            onJoin();
            setIsVisible(false);
          }}
        >
          <AppIcon icon="hugeicons:call" className="w-3 h-3" />
          {t("join_meeting")}
        </Button>
      )}
    </div>
  );
};
