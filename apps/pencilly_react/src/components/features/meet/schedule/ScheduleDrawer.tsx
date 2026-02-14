import React, { useState, type FC } from "react";

import DailyEventCard from "@/components/features/meet/schedule/DailyEventCard";
import UpcomingMeetingForm from "@/components/features/meet/schedule/UpcomingMeetingForm";
import StatusBadge from "@/components/features/meet/StatusBadge";
import AppDrawer from "@/components/shared/AppDrawer";
import { Show } from "@/components/shared/Show";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import AppTabs from "@/components/ui/custom/app-tabs";
import AppTypo from "@/components/ui/custom/app-typo";
import { useTranslations } from "@/i18n";

import type { ConnectionState } from "../types";
import MeetingCard from "./MeetingCard";
import type { DailyEvent, ScheduledMeeting, TabType } from "./types";

interface ScheduleDrawerProps {
  Trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  connectionState?: ConnectionState;
  onJoinMeeting?: (meeting: ScheduledMeeting) => void;
  onEditMeeting?: (meeting: ScheduledMeeting) => void;
  onDeleteMeeting?: (meeting: ScheduledMeeting) => void;
}

const ScheduleDrawer: FC<ScheduleDrawerProps> = ({
  Trigger,
  open: controlledOpen,
  onOpenChange,
  connectionState = "connected",
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
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const meetings = DEMO_MEETINGS;
  const dailyEvents = DEMO_DAILY_EVENTS;

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const defaultTrigger = (
    <Button
      variant="outline"
      className="w-full !gap-2"
      icon="hugeicons:calendar-03"
    >
      {t("schedule_meeting")}
    </Button>
  );

  //test
  const [openUpcoming, setOpenUpcoming] = useState(false);

  return (
    <>
      <UpcomingMeetingForm isOpen={openUpcoming} setIsOpen={setOpenUpcoming} />
      <AppDrawer
        open={isOpen}
        setOpen={setIsOpen}
        title={t("calendar")}
        Trigger={Trigger ?? defaultTrigger}
        contentClassName="overflow-x-hidden"
        triggerClassName="w-full"
        modal={false}
      >
        {/* Top bar: Schedule Meeting button + Status */}
        <div className="flex items-center justify-between px-3 py-2 border-y">
          <Button
            variant="outline"
            className="!h-7 !text-xs gap-1"
            icon="hugeicons:call"
          >
            {t("schedule_meeting")}
          </Button>
          <StatusBadge status={connectionState} />
        </div>

        <div className="col p-2 gap-4 flex-1 ">
          <div className="flex justify-center ">
            <Calendar
              mode="single"
              className="bg-background-lighter border-b w-full max-w-full p-0"
              selected={selectedDate}
              onSelect={setSelectedDate}
            />
          </div>

          <AppTypo variant="headingXS" className="font-semibold">
            {formattedDate}
          </AppTypo>

          {/* Tabs: Schedule Meeting | Daily Event */}
          <AppTabs
            className="w-fit mx-0"
            tabs={[
              { tabKey: "schedule", title: t("schedule_meeting") },
              { tabKey: "daily", title: t("daily_event") },
            ]}
            onTabChange={tab => setActiveTab(tab as TabType)}
            activeTab={activeTab}
          />

          {/* Content */}
          <div
            className="flex-1 overflow-y-auto  pb-4 col gap-4"
            key={activeTab}
          >
            <Show>
              <Show.When
                isTrue={
                  (activeTab === "schedule" && !meetings.length) ||
                  (activeTab === "daily" && !dailyEvents.length)
                }
              >
                <AppTypo color="secondary" className="text-center py-8">
                  {t(activeTab === "schedule" ? "no_meetings" : "no_events")}
                </AppTypo>
              </Show.When>

              <Show.When isTrue={activeTab === "schedule"}>
                {meetings.map(meeting => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onJoin={onJoinMeeting}
                    onEdit={onEditMeeting}
                    onDelete={onDeleteMeeting}
                    //@ts-ignore
                    status={meeting.color || "primary"}
                  />
                ))}
              </Show.When>

              <Show.When isTrue={activeTab === "daily"}>
                {dailyEvents.map(event => (
                  <DailyEventCard key={event.id} event={event} />
                ))}
              </Show.When>
            </Show>
          </div>
        </div>
        {/* Bottom Schedule Button */}
        <div className="p-2 ">
          <Button className="w-full gap-1.5" icon="hugeicons:calendar-03" onClick={() => setOpenUpcoming(true)}>
            {t("create_meeting")}
          </Button>
        </div>
      </AppDrawer>
    </>
  );
};

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
    color: "warning",
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
    color: "danger",
  },
];

const DEMO_DAILY_EVENTS: DailyEvent[] = [
  {
    id: "e1",
    title: "International Talk Like A Pirate Day",
    status: "info",
  },
  {
    id: "e1",
    title: "International Talk Like A Pirate Day",
  },
];
