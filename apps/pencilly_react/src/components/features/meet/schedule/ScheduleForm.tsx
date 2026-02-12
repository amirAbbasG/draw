import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import type { ScheduleMeetingFormData } from "./types";

interface ScheduleFormProps {
  onSubmit: (data: ScheduleMeetingFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ScheduleMeetingFormData>;
  isLoading?: boolean;
  className?: string;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  className,
}) => {
  const t = useTranslations("meet.schedule");
  const [formData, setFormData] = useState<Partial<ScheduleMeetingFormData>>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    date: initialData?.date || new Date(),
    startTime: initialData?.startTime || "10:00",
    endTime: initialData?.endTime || "11:00",
    eventType: initialData?.eventType || "meeting",
    participants: initialData?.participants || [],
    location: initialData?.location || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      return;
    }
    onSubmit({
      title: formData.title,
      description: formData.description,
      date: formData.date,
      startTime: formData.startTime || "10:00",
      endTime: formData.endTime || "11:00",
      participants: formData.participants || [],
      eventType: formData.eventType || "meeting",
      location: formData.location,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      date: new Date(e.target.value),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-4", className)}
    >
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          {t("meeting_title")}
        </label>
        <Input
          type="text"
          placeholder={t("meeting_title_placeholder")}
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          {t("description")}
        </label>
        <Input
          type="text"
          placeholder={t("description_placeholder")}
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            {t("date")}
          </label>
          <Input
            type="date"
            value={
              formData.date
                ? formData.date.toISOString().split("T")[0]
                : ""
            }
            onChange={handleDateChange}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            {t("event_type")}
          </label>
          <Select
            value={formData.eventType || "meeting"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                eventType: value as "meeting" | "event",
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meeting">{t("meeting")}</SelectItem>
              <SelectItem value="event">{t("event")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            {t("start_time")}
          </label>
          <Input
            type="time"
            value={formData.startTime || "10:00"}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            {t("end_time")}
          </label>
          <Input
            type="time"
            value={formData.endTime || "11:00"}
            onChange={(e) =>
              setFormData({ ...formData, endTime: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          {t("location")}
        </label>
        <Input
          type="text"
          placeholder={t("location_placeholder")}
          value={formData.location || ""}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {t("schedule_meeting")}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            {t("cancel")}
          </Button>
        )}
      </div>
    </form>
  );
};
