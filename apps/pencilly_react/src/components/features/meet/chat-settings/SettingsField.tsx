"use client";

import React, { type FC, type ReactNode } from "react";

import AppTypo from "@/components/ui/custom/app-typo";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Section Heading                                                     */
/* ------------------------------------------------------------------ */
interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const SettingsSection: FC<SectionProps> = ({
  title,
  children,
  className,
}) => (
  <div className={cn("flex flex-col gap-4", className)}>
    <AppTypo variant="small" className="font-bold text-foreground">
      {title}
    </AppTypo>
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Toggle Row (label + switch)                                        */
/* ------------------------------------------------------------------ */
interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const SettingsToggleRow: FC<ToggleRowProps> = ({
  label,
  checked,
  onChange,
  disabled,
  className,
}) => (
  <div
    className={cn(
      "flex items-center justify-between gap-3",
      className,
    )}
  >
    <AppTypo variant="small" className="flex-1 text-foreground">
      {label}
    </AppTypo>
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  </div>
);

/* ------------------------------------------------------------------ */
/* Radio Group                                                         */
/* ------------------------------------------------------------------ */
interface RadioOption {
  value: string;
  label: string;
}

interface RadioFieldProps {
  label?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SettingsRadioField: FC<RadioFieldProps> = ({
  label,
  options,
  value,
  onChange,
  className,
}) => (
  <div className={cn("flex flex-col gap-2", className)}>
    {label && (
      <AppTypo variant="small" className="text-foreground">
        {label}
      </AppTypo>
    )}
    <RadioGroup value={value} onValueChange={onChange} className="gap-2.5">
      {options.map((opt) => (
        <div key={opt.value} className="flex items-center gap-2">
          <RadioGroupItem value={opt.value} id={`radio-${opt.value}`} />
          <Label
            htmlFor={`radio-${opt.value}`}
            className="text-sm font-normal cursor-pointer"
          >
            {opt.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  </div>
);

/* ------------------------------------------------------------------ */
/* Checkbox Grid                                                       */
/* ------------------------------------------------------------------ */
interface CheckboxOption {
  key: string;
  label: string;
  checked: boolean;
}

interface CheckboxGridProps {
  label?: string;
  options: CheckboxOption[];
  onChange: (key: string, checked: boolean) => void;
  columns?: 2 | 3;
  className?: string;
}

export const SettingsCheckboxGrid: FC<CheckboxGridProps> = ({
  label,
  options,
  onChange,
  columns = 2,
  className,
}) => (
  <div className={cn("flex flex-col gap-2.5", className)}>
    {label && (
      <AppTypo variant="small" className="text-foreground">
        {label}
      </AppTypo>
    )}
    <div
      className={cn(
        "grid gap-2.5",
        columns === 2 ? "grid-cols-2" : "grid-cols-3",
      )}
    >
      {options.map((opt) => (
        <div key={opt.key} className="flex items-center gap-2">
          <Checkbox
            id={`checkbox-${opt.key}`}
            checked={opt.checked}
            onCheckedChange={(v) => onChange(opt.key, v === true)}
          />
          <Label
            htmlFor={`checkbox-${opt.key}`}
            className="text-sm font-normal cursor-pointer"
          >
            {opt.label}
          </Label>
        </div>
      ))}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Time Range Row                                                      */
/* ------------------------------------------------------------------ */
interface TimeRangeProps {
  startLabel: string;
  endLabel: string;
  start: string;
  end: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  className?: string;
}

export const SettingsTimeRange: FC<TimeRangeProps> = ({
  startLabel,
  endLabel,
  start,
  end,
  onStartChange,
  onEndChange,
  className,
}) => (
  <div className={cn("flex items-end gap-3", className)}>
    <div className="flex flex-col gap-1 flex-1">
      <AppTypo variant="xs" color="muted">
        {startLabel}
      </AppTypo>
      <Input
        type="time"
        value={start}
        onChange={(e) => onStartChange(e.target.value)}
        className="!h-8 text-xs"
      />
    </div>
    <span className="pb-1.5 text-foreground-light">-</span>
    <div className="flex flex-col gap-1 flex-1">
      <AppTypo variant="xs" color="muted">
        {endLabel}
      </AppTypo>
      <Input
        type="time"
        value={end}
        onChange={(e) => onEndChange(e.target.value)}
        className="!h-8 text-xs"
      />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Day Selector (repeat)                                               */
/* ------------------------------------------------------------------ */
const ALL_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface DaySelectorProps {
  label?: string;
  selected: string[];
  onChange: (days: string[]) => void;
  className?: string;
}

export const SettingsDaySelector: FC<DaySelectorProps> = ({
  label,
  selected,
  onChange,
  className,
}) => {
  const toggle = (day: string) => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day]);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <AppTypo variant="xs" color="muted">
          {label}
        </AppTypo>
      )}
      <div className="flex gap-1.5">
        {ALL_DAYS.map((day) => {
          const isActive = selected.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              className={cn(
                "h-8 w-8 rounded-full text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-background-lighter text-foreground hover:bg-background-dark",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
