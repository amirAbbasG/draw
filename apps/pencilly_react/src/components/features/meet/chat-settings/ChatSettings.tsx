"use client";

import React, { type FC } from "react";
import { useForm, Controller } from "react-hook-form";

import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { ChatGroupSettings } from "../types";
import {
  SettingsSection,
  SettingsToggleRow,
  SettingsRadioField,
  SettingsCheckboxGrid,
  SettingsTimeRange,
  SettingsDaySelector,
} from "./SettingsField";

interface ChatSettingsProps {
  /** Initial / current settings values */
  defaultValues: ChatGroupSettings;
  /** Called on every field change (auto-save) */
  onSettingsChange?: (settings: ChatGroupSettings) => void;
  onBack: () => void;
  className?: string;
}

const ChatSettings: FC<ChatSettingsProps> = ({
  defaultValues,
  onSettingsChange,
  onBack,
  className,
}) => {
  const t = useTranslations("meet.settings");

  const { control, watch, getValues } = useForm<ChatGroupSettings>({
    defaultValues,
  });

  /** Trigger callback on any change */
  const emitChange = () => {
    onSettingsChange?.(getValues());
  };

  const availability = watch("message.availability");

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-popover">
        <AppIconButton
          icon={sharedIcons.arrow_left}
          size="sm"
          onClick={onBack}
          title={t("back")}
        />
        <AppTypo variant="headingXXS">{t("advanced_settings")}</AppTypo>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-8">
        {/* ============= MESSAGE SECTION ============= */}
        <SettingsSection title={t("message_section")}>
          {/* Allow Members To Send Messages */}
          <Controller
            control={control}
            name="message.allowMembersToSend"
            render={({ field }) => (
              <SettingsToggleRow
                label={t("allow_members_send")}
                checked={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  emitChange();
                }}
              />
            )}
          />

          {/* Message Availability */}
          <Controller
            control={control}
            name="message.availability"
            render={({ field }) => (
              <SettingsRadioField
                label={t("message_availability")}
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  emitChange();
                }}
                options={[
                  { value: "always", label: t("always_available") },
                  {
                    value: "only_during_meetings",
                    label: t("only_during_meetings"),
                  },
                  {
                    value: "custom_schedule",
                    label: t("custom_schedule"),
                  },
                ]}
              />
            )}
          />

          {/* Schedule: Start / End time + Repeat (visible only for custom_schedule) */}
          {availability === "custom_schedule" && (
            <div className="flex flex-col gap-3 pl-2 border-l-2 border-primary/20">
              {/* Time range */}
              <Controller
                control={control}
                name="message.schedule"
                render={({ field }) => (
                  <>
                    <SettingsTimeRange
                      startLabel={t("start")}
                      endLabel={t("end")}
                      start={field.value.start}
                      end={field.value.end}
                      onStartChange={(v) => {
                        field.onChange({ ...field.value, start: v });
                        emitChange();
                      }}
                      onEndChange={(v) => {
                        field.onChange({ ...field.value, end: v });
                        emitChange();
                      }}
                    />
                    <SettingsDaySelector
                      label={t("repeat")}
                      selected={field.value.repeat}
                      onChange={(days) => {
                        field.onChange({ ...field.value, repeat: days });
                        emitChange();
                      }}
                    />
                  </>
                )}
              />
            </div>
          )}

          {/* Allowed Message Types */}
          <Controller
            control={control}
            name="message.allowedTypes"
            render={({ field }) => (
              <SettingsCheckboxGrid
                label={t("allowed_message_types")}
                columns={2}
                options={[
                  {
                    key: "all",
                    label: t("type_all"),
                    checked: field.value.all,
                  },
                  {
                    key: "textMessages",
                    label: t("type_text"),
                    checked: field.value.textMessages,
                  },
                  {
                    key: "images",
                    label: t("type_images"),
                    checked: field.value.images,
                  },
                  {
                    key: "videos",
                    label: t("type_videos"),
                    checked: field.value.videos,
                  },
                  {
                    key: "fileUploads",
                    label: t("type_files"),
                    checked: field.value.fileUploads,
                  },
                  {
                    key: "links",
                    label: t("type_links"),
                    checked: field.value.links,
                  },
                ]}
                onChange={(key, checked) => {
                  const updated = { ...field.value, [key]: checked };
                  // If "all" toggled on, enable everything
                  if (key === "all" && checked) {
                    Object.keys(updated).forEach((k) => {
                      (updated as Record<string, boolean>)[k] = true;
                    });
                  }
                  // If any individual is unchecked, uncheck "all"
                  if (key !== "all" && !checked) {
                    updated.all = false;
                  }
                  field.onChange(updated);
                  emitChange();
                }}
              />
            )}
          />

          {/* Allow Message Deletion */}
          <Controller
            control={control}
            name="message.allowDeletion"
            render={({ field }) => (
              <SettingsToggleRow
                label={t("allow_deletion")}
                checked={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  emitChange();
                }}
              />
            )}
          />
        </SettingsSection>

        {/* ============= MEETING SECTION ============= */}
        <SettingsSection title={t("meeting_section")}>
          {/* Allow Meeting Creation */}
          <Controller
            control={control}
            name="meeting.allowCreation"
            render={({ field }) => (
              <SettingsToggleRow
                label={t("allow_meeting_creation")}
                checked={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  emitChange();
                }}
              />
            )}
          />

          {/* Allow Chat During Meeting Only */}
          <Controller
            control={control}
            name="meeting.chatDuringMeetingOnly"
            render={({ field }) => (
              <SettingsToggleRow
                label={t("chat_during_meeting_only")}
                checked={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  emitChange();
                }}
              />
            )}
          />

          {/* Allow Meeting Recording */}
          <Controller
            control={control}
            name="meeting.allowRecording"
            render={({ field }) => (
              <SettingsToggleRow
                label={t("allow_recording")}
                checked={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  emitChange();
                }}
              />
            )}
          />
        </SettingsSection>
      </div>
    </div>
  );
};

export default ChatSettings;
