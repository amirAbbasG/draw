import React, { useState, type FC } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import AppDrawer from "@/components/shared/AppDrawer";
import RenderIf from "@/components/shared/RenderIf";
import StatusBadge from "@/components/features/meet/StatusBadge";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { ConnectionState } from "../types";
import MeetingCard from "./MeetingCard";
import ScheduleMeetingForm from "./ScheduleMeetingForm";
import type { ScheduledMeeting, ScheduleMeetingFormData } from "./types";

type TabType = "schedule" | "daily";
type ViewMode = "calendar" | "form";

interface ScheduleDrawerProps {
  Trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  connectionState?: ConnectionState;
  meetings?: ScheduledMeeting[];
  dailyEvents?: DailyEvent[];
  onScheduleMeeting?: (data: ScheduleMeetingFormData) => void;
  onJoinMeeting?: (meeting: ScheduledMeeting) => void;
  onEditMeeting?: (meeting: ScheduledMeeting) => void;
  onDeleteMeeting?: (meeting: ScheduledMeeting) => void;
}

interface DailyEvent {
  id: string;
  title: string;
  color?: string;
}

const ScheduleDrawer: FC<ScheduleDrawerProps> = ({
  Trigger,
  open: controlledOpen,
  onOpenChange,
  connectionState = "connected",
  meetings = DEMO_MEETINGS,
  dailyEvents = DEMO_DAILY_EVENTS,
  onScheduleMeeting,
  onJoinMeeting,
  onEditMeeting,
  onDeleteMeeting,
}) => {
  const t = useTranslations("meet.schedule");

  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [activeTab, setActiveTab] = useState<TabType>("schedule");
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  const isOpen =
    controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const handleScheduleSubmit = (data: ScheduleMeetingFormData) => {
    onScheduleMeeting?.(data);
    setViewMode("calendar");
  };

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const defaultTrigger = (
    <Button variant="outline" className="!h-8 !px-2 gap-1.5" icon="hugeicons:calendar-03">
      <span className="max-md:hidden pe-0.5">{t("schedule_meeting")}</span>
    </Button>
  );

  // If viewing the form
  if (viewMode === "form" && isOpen) {
    return (
      <AppDrawer
        open={isOpen}
        setOpen={setIsOpen}
        title={t("calendar")}
        Trigger={Trigger ?? defaultTrigger}
        contentClassName="overflow-x-hidden"
        modal={false}
      >
        <ScheduleMeetingForm
          onSubmit={handleScheduleSubmit}
          onClose={() => setViewMode("calendar")}
        />
      </AppDrawer>
    );
  }

  return (
    <AppDrawer
      open={isOpen}
      setOpen={setIsOpen}
      title={t("calendar")}
      Trigger={Trigger ?? defaultTrigger}
      contentClassName="overflow-x-hidden"
      modal={false}
    >
      {/* Top bar: Schedule Meeting button + Status */}
      <div className="flex items-center justify-between px-3 py-2 border-y">
        <Button
          variant="outline"
          className="!h-7 !text-xs gap-1"
          icon="hugeicons:call"
          onClick={() => setViewMode("form")}
        >
          {t("schedule_meeting")}
        </Button>
        <StatusBadge status={connectionState} />
      </div>

      {/* Calendar */}
      <div className="flex justify-center px-2 pt-2">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
        />
      </div>

      {/* Selected Date Label */}
      <div className="px-4 pt-3 pb-2">
        <AppTypo variant="small" className="font-semibold">
          {formattedDate}
        </AppTypo>
      </div>

      {/* Tabs: Schedule Meeting | Daily Event */}
      <div className="flex gap-2 px-4 pb-3">
        <TabButton
          label={t("schedule_meeting")}
          isActive={activeTab === "schedule"}
          onClick={() => setActiveTab("schedule")}
        />
        <TabButton
          label={t("daily_event")}
          isActive={activeTab === "daily"}
          onClick={() => setActiveTab("daily")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 col gap-3">
        <RenderIf isTrue={activeTab === "schedule"}>
          {meetings.length > 0 ? (
            meetings.map(meeting => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onJoin={onJoinMeeting}
                onEdit={onEditMeeting}
                onDelete={onDeleteMeeting}
              />
            ))
          ) : (
            <AppTypo variant="small" color="muted" className="text-center py-8">
              {t("no_meetings")}
            </AppTypo>
          )}
        </RenderIf>
        <RenderIf isTrue={activeTab === "daily"}>
          {dailyEvents.length > 0 ? (
            dailyEvents.map(event => (
              <DailyEventCard key={event.id} event={event} />
            ))
          ) : (
            <AppTypo variant="small" color="muted" className="text-center py-8">
              {t("no_events")}
            </AppTypo>
          )}
        </RenderIf>
      </div>

      {/* Bottom Schedule Button */}
      <div className="p-3 border-t">
        <Button
          className="w-full gap-1.5"
          icon="hugeicons:calendar-03"
          onClick={() => setViewMode("form")}
        >
          {t("schedule_meeting")}
        </Button>
      </div>
    </AppDrawer>
  );
};

/* ---- Tab Button ---- */
interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: FC<TabButtonProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer",
      isActive
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-foreground-light hover:bg-muted/80",
    )}
  >
    {label}
  </button>
);

/* ---- Daily Event Card ---- */
interface DailyEventCardProps {
  event: DailyEvent;
}

const DailyEventCard: FC<DailyEventCardProps> = ({ event }) => (
  <div
    className={cn(
      "rounded-lg border-l-4 px-3 py-2.5",
      event.color ? "" : "border-l-primary bg-primary/5",
    )}
    style={
      event.color
        ? {
            borderLeftColor: event.color,
            backgroundColor: `${event.color}10`,
          }
        : undefined
    }
  >
    <AppTypo variant="small" className="font-medium">
      {event.title}
    </AppTypo>
  </div>
);

export default ScheduleDrawer;

/* ---- Demo Data ---- */
const DEMO_MEETINGS: ScheduledMeeting[] = [
  {
    id: "m1",
    title: "PRD Review \u2013 Checkout Flow V2",
    date: "Thu, Sep 19",
    startTime: "10:00",
    endTime: "11:30 AM",
    timezone: "GMT+3:30",
    repeat: ["Mo", "Tu"],
    members: [
      { id: "u1", name: "Ali Reza" },
      { id: "u2", name: "Sara Mohammadi" },
      { id: "u3", name: "Hossein Darvishi" },
      { id: "u4", name: "Ahmad Rezaei" },
      { id: "u5", name: "Fatemeh Karimi" },
    ],
    attachedBoard: "Checkout \u2013 User Flow & PRD",
  },
  {
    id: "m2",
    title: "PRD Review \u2013 Checkout Flow V2",
    date: "Thu, Sep 19",
    startTime: "10:00",
    endTime: "11:30 AM",
    timezone: "GMT+3:30",
    repeat: ["Mo", "Tu"],
    members: [
      { id: "u1", name: "Ali Reza" },
      { id: "u2", name: "Sara Mohammadi" },
      { id: "u3", name: "Hossein Darvishi" },
      { id: "u4", name: "Ahmad Rezaei" },
      { id: "u5", name: "Fatemeh Karimi" },
    ],
    attachedBoard: "Checkout \u2013 User Flow & PRD",
  },
];

const DEMO_DAILY_EVENTS: DailyEvent[] = [
  {
    id: "e1",
    title: "International Talk Like A Pirate Day",
    color: "#22c55e",
  },
];
