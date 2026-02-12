import React, { useState, type FC } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import {
  SettingsDaySelector,
  SettingsTimeRange,
} from "../chat/SettingsField";
import type { ScheduleMeetingFormData } from "./types";

interface ScheduleMeetingFormProps {
  onSubmit?: (data: ScheduleMeetingFormData) => void;
  onClose?: () => void;
  className?: string;
}

const ScheduleMeetingForm: FC<ScheduleMeetingFormProps> = ({
  onSubmit,
  onClose,
  className,
}) => {
  const t = useTranslations("meet.schedule");

  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("08:00");
  const [repeat, setRepeat] = useState<string[]>(["Mo", "Tu"]);
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [attachedBoard, setAttachedBoard] = useState("Untitled");

  const handleAddMember = () => {
    const trimmed = memberInput.trim();
    if (trimmed && !members.includes(trimmed)) {
      setMembers(prev => [...prev, trimmed]);
      setMemberInput("");
    }
  };

  const handleRemoveMember = (email: string) => {
    setMembers(prev => prev.filter(m => m !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddMember();
    }
  };

  const handleSubmit = () => {
    onSubmit?.({
      title,
      date,
      startTime,
      endTime,
      repeat,
      members,
      attachedBoard,
    });
  };

  return (
    <div className={cn("col gap-4 p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <AppTypo variant="headingXS">{t("title")}</AppTypo>
        {onClose && (
          <AppIconButton
            icon={sharedIcons.close}
            size="xs"
            onClick={onClose}
            title={t("close")}
          />
        )}
      </div>

      {/* Event Title */}
      <div className="col gap-1.5">
        <AppTypo variant="small" color="secondary">
          {t("event_title")}
        </AppTypo>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t("event_title_placeholder")}
          className="!h-8 text-sm"
        />
      </div>

      {/* Date Picker */}
      <div className="col gap-1.5">
        <AppTypo variant="small" color="secondary">
          {t("date")}
        </AppTypo>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="!h-8 justify-start text-sm font-normal"
            >
              {date
                ? date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : t("select_date")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Start / End Time */}
      <SettingsTimeRange
        startLabel={t("start_time")}
        endLabel={t("end_time_optional")}
        start={startTime}
        end={endTime}
        onStartChange={setStartTime}
        onEndChange={setEndTime}
      />

      {/* Repeat Days */}
      <SettingsDaySelector
        label={t("repeat")}
        selected={repeat}
        onChange={setRepeat}
      />

      {/* Members */}
      <div className="col gap-1.5">
        <AppTypo variant="small" color="secondary">
          {t("members")}
        </AppTypo>
        <div className="flex flex-wrap gap-1.5 min-h-8 rounded border px-2 py-1.5 items-center">
          {members.map(email => (
            <MemberChip
              key={email}
              label={email}
              onRemove={() => handleRemoveMember(email)}
            />
          ))}
          <input
            value={memberInput}
            onChange={e => setMemberInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAddMember}
            placeholder={members.length === 0 ? t("members_placeholder") : ""}
            className="flex-1 min-w-24 bg-transparent text-sm outline-none placeholder:text-foreground-lighter"
          />
        </div>
        <AppTypo variant="xs" color="muted">
          {t("members_hint")}
        </AppTypo>
        <button
          type="button"
          className="text-xs text-primary hover:underline self-start cursor-pointer"
        >
          {t("import_email_list")}
        </button>
      </div>

      {/* Attach Board */}
      <div className="col gap-1.5">
        <AppTypo variant="small" color="secondary">
          {t("attach_board")}
        </AppTypo>
        <Input
          value={attachedBoard}
          onChange={e => setAttachedBoard(e.target.value)}
          placeholder={t("attach_board_placeholder")}
          className="!h-8 text-sm"
        />
      </div>

      {/* Submit Button */}
      <Button onClick={handleSubmit} className="mt-2">
        {t("schedule")}
      </Button>
    </div>
  );
};

/* ---- Member Chip ---- */
interface MemberChipProps {
  label: string;
  onRemove: () => void;
}

const MemberChip: FC<MemberChipProps> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="hover:text-danger transition-colors cursor-pointer"
      aria-label={`Remove ${label}`}
    >
      &times;
    </button>
  </span>
);

export default ScheduleMeetingForm;
