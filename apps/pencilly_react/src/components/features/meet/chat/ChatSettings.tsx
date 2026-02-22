import React, { type FC } from "react";

import { Controller, useForm } from "react-hook-form";

import { DEFAULT_GROUP_SETTINGS } from "@/components/features/meet/constants";
import {
  useUpdateConversationInfo,
  type UpdateConversationInput,
} from "@/components/features/meet/hooks/useUpdateConversationInfo";
import ColorSelection from "@/components/forms/ColorSelection";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { useDebounceEffect } from "@/hooks/useDebounceEffect";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { ChatSettings, Conversation } from "../types";
import { SettingsRadioField, SettingsSection } from "./SettingsField";

interface ChatSettingsProps {
  onBack: () => void;
  className?: string;
  chatBg?: string;
  onChatBgChange?: (bg: string) => void;
  conversation: Conversation;
}

const accesses = [
  "chat_state",
  "call_state",
  "collab_state",
  "stream_state",
] as const;

const ChatSettings: FC<ChatSettingsProps> = ({
  onBack,
  className,
  chatBg,
  onChatBgChange,
  conversation,
}) => {
  const t = useTranslations("meet.chat.settings");
  const { isUpdating, updateConversationInfo } = useUpdateConversationInfo(
    conversation.id,
  );

  const { control, watch, getValues } = useForm<ChatSettings>({
    defaultValues: DEFAULT_GROUP_SETTINGS,
  });

  useDebounceEffect(
    () => {
      const values = getValues();
      updateConversationInfo(values as UpdateConversationInput);
    },
    [watch()],
    300,
  );

  return (
    <div className={cn("col h-full overflow-hidden", className)}>
      {/* Header */}
      <div className="row gap-2 px-4 py-3 border-y bg-background-lighter">
        <AppIconButton
          icon={sharedIcons.arrow_left}
          size="sm"
          onClick={onBack}
          title={t("back")}
        />
        <AppTypo variant="headingXS">{t("advanced_settings")}</AppTypo>
      </div>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 col gap-8">
        <SettingsSection title={t("chat_background")}>
          <ColorSelection onChange={onChatBgChange} value={chatBg} />
        </SettingsSection>

        <SettingsSection title={t("access")}>
          {accesses.map(access => (
            <Controller
              key={access}
              control={control}
              name={access}
              render={({ field }) => (
                <SettingsRadioField
                  label={t(access)}
                  value={field.value}
                  onChange={v => {
                    field.onChange(v);
                    const currentValues = getValues();
                    const updatedValues = {
                      ...currentValues,
                      [access]: v,
                    };
                    updateConversationInfo(
                      updatedValues as UpdateConversationInput,
                    );
                  }}
                  options={[
                    { value: "open", label: t("open") },
                    { value: "read_only", label: t("read_only") },
                    { value: "closed", label: t("closed") },
                  ]}
                />
              )}
            />
          ))}
        </SettingsSection>
        {/*  /!* ============= MESSAGE SECTION ============= *!/*/}
        {/*  <SettingsSection title={t("message_section")}>*/}
        {/*    /!* Allow Members To Send Messages *!/*/}
        {/*    <Controller*/}
        {/*      control={control}*/}
        {/*      name="message.allowMembersToSend"*/}
        {/*      render={({ field }) => (*/}
        {/*        <SettingsToggleRow*/}
        {/*          label={t("allow_members_send")}*/}
        {/*          checked={field.value}*/}
        {/*          onChange={v => {*/}
        {/*            field.onChange(v);*/}
        {/*            emitChange();*/}
        {/*          }}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    />*/}

        {/*    /!* Message Availability *!/*/}
        {/*    <Controller*/}
        {/*      control={control}*/}
        {/*      name="message.availability"*/}
        {/*      render={({ field }) => (*/}
        {/*        <SettingsRadioField*/}
        {/*          label={t("message_availability")}*/}
        {/*          value={field.value}*/}
        {/*          onChange={v => {*/}
        {/*            field.onChange(v);*/}
        {/*            emitChange();*/}
        {/*          }}*/}
        {/*          options={[*/}
        {/*            { value: "always", label: t("always_available") },*/}
        {/*            {*/}
        {/*              value: "only_during_meetings",*/}
        {/*              label: t("only_during_meetings"),*/}
        {/*            },*/}
        {/*            {*/}
        {/*              value: "custom_schedule",*/}
        {/*              label: t("custom_schedule"),*/}
        {/*            },*/}
        {/*          ]}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    />*/}

        {/*    /!* Schedule: Start / End time + Repeat (visible only for custom_schedule) *!/*/}
        {/*    {availability === "custom_schedule" && (*/}
        {/*      <div className="flex flex-col gap-3 pl-2 pb-2 border-l-2 border-primary/20">*/}
        {/*        /!* Time range *!/*/}
        {/*        <Controller*/}
        {/*          control={control}*/}
        {/*          name="message.schedule"*/}
        {/*          render={({ field }) => (*/}
        {/*            <>*/}
        {/*              <SettingsTimeRange*/}
        {/*                startLabel={t("start")}*/}
        {/*                endLabel={t("end")}*/}
        {/*                start={field.value.start}*/}
        {/*                end={field.value.end}*/}
        {/*                onStartChange={v => {*/}
        {/*                  field.onChange({ ...field.value, start: v });*/}
        {/*                  emitChange();*/}
        {/*                }}*/}
        {/*                onEndChange={v => {*/}
        {/*                  field.onChange({ ...field.value, end: v });*/}
        {/*                  emitChange();*/}
        {/*                }}*/}
        {/*              />*/}
        {/*              <SettingsDaySelector*/}
        {/*                label={t("repeat")}*/}
        {/*                selected={field.value.repeat}*/}
        {/*                onChange={days => {*/}
        {/*                  field.onChange({ ...field.value, repeat: days });*/}
        {/*                  emitChange();*/}
        {/*                }}*/}
        {/*              />*/}
        {/*            </>*/}
        {/*          )}*/}
        {/*        />*/}
        {/*      </div>*/}
        {/*    )}*/}

        {/*    /!* Allowed Message Types *!/*/}
        {/*    <Controller*/}
        {/*      control={control}*/}
        {/*      name="message.allowedTypes"*/}
        {/*      render={({ field }) => (*/}
        {/*        <SettingsCheckboxGrid*/}
        {/*          label={t("allowed_message_types")}*/}
        {/*          columns={2}*/}
        {/*          options={[*/}
        {/*            {*/}
        {/*              key: "all",*/}
        {/*              label: t("type_all"),*/}
        {/*              checked: field.value.all,*/}
        {/*            },*/}
        {/*            {*/}
        {/*              key: "textMessages",*/}
        {/*              label: t("type_text"),*/}
        {/*              checked: field.value.textMessages,*/}
        {/*            },*/}
        {/*            {*/}
        {/*              key: "images",*/}
        {/*              label: t("type_images"),*/}
        {/*              checked: field.value.images,*/}
        {/*            },*/}
        {/*            {*/}
        {/*              key: "videos",*/}
        {/*              label: t("type_videos"),*/}
        {/*              checked: field.value.videos,*/}
        {/*            },*/}
        {/*            {*/}
        {/*              key: "fileUploads",*/}
        {/*              label: t("type_files"),*/}
        {/*              checked: field.value.fileUploads,*/}
        {/*            },*/}
        {/*            {*/}
        {/*              key: "links",*/}
        {/*              label: t("type_links"),*/}
        {/*              checked: field.value.links,*/}
        {/*            },*/}
        {/*          ]}*/}
        {/*          onChange={(key, checked) => {*/}
        {/*            const updated = { ...field.value, [key]: checked };*/}
        {/*            // If "all" toggled on, enable everything*/}
        {/*            if (key === "all" && checked) {*/}
        {/*              Object.keys(updated).forEach(k => {*/}
        {/*                (updated as Record<string, boolean>)[k] = true;*/}
        {/*              });*/}
        {/*            }*/}
        {/*            // If any individual is unchecked, uncheck "all"*/}
        {/*            if (key !== "all" && !checked) {*/}
        {/*              updated.all = false;*/}
        {/*            }*/}
        {/*            field.onChange(updated);*/}
        {/*            emitChange();*/}
        {/*          }}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    />*/}

        {/*    /!* Allow Message Deletion *!/*/}
        {/*    <Controller*/}
        {/*      control={control}*/}
        {/*      name="message.allowDeletion"*/}
        {/*      render={({ field }) => (*/}
        {/*        <SettingsToggleRow*/}
        {/*          label={t("allow_deletion")}*/}
        {/*          checked={field.value}*/}
        {/*          onChange={v => {*/}
        {/*            field.onChange(v);*/}
        {/*            emitChange();*/}
        {/*          }}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    />*/}
        {/*  </SettingsSection>*/}

        {/*  /!* ============= MEETING SECTION ============= *!/*/}
        {/*  <SettingsSection title={t("meeting_section")}>*/}
        {/*    /!* Allow Meeting Creation *!/*/}
        {/*    <Controller*/}
        {/*      control={control}*/}
        {/*      name="meeting.allowCreation"*/}
        {/*      render={({ field }) => (*/}
        {/*        <SettingsToggleRow*/}
        {/*          label={t("allow_meeting_creation")}*/}
        {/*          checked={field.value}*/}
        {/*          onChange={v => {*/}
        {/*            field.onChange(v);*/}
        {/*            emitChange();*/}
        {/*          }}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    />*/}

        {/*    /!* Allow Chat During Meeting Only *!/*/}
        {/*    <Controller*/}
        {/*      control={control}*/}
        {/*      name="meeting.chatDuringMeetingOnly"*/}
        {/*      render={({ field }) => (*/}
        {/*        <SettingsToggleRow*/}
        {/*          label={t("chat_during_meeting_only")}*/}
        {/*          checked={field.value}*/}
        {/*          onChange={v => {*/}
        {/*            field.onChange(v);*/}
        {/*            emitChange();*/}
        {/*          }}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    />*/}

        {/*    /!* Allow Meeting Recording *!/*/}
        {/*    <Controller*/}
        {/*      control={control}*/}
        {/*      name="meeting.allowRecording"*/}
        {/*      render={({ field }) => (*/}
        {/*        <SettingsToggleRow*/}
        {/*          label={t("allow_recording")}*/}
        {/*          checked={field.value}*/}
        {/*          onChange={v => {*/}
        {/*            field.onChange(v);*/}
        {/*            emitChange();*/}
        {/*          }}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    />*/}
        {/*  </SettingsSection>*/}
      </div>
    </div>
  );
};

export default ChatSettings;
