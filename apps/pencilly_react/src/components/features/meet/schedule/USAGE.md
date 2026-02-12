# Schedule Meeting Component - Usage Guide

## Overview

The Schedule Meeting feature provides a complete calendar and meeting management system for the Meet feature in Pencilly. It includes components for viewing a calendar, creating meetings, and displaying upcoming meetings.

## Components

### 1. ScheduleMeeting (Main Container)
The primary component that manages the entire schedule meeting feature.

```tsx
import { ScheduleMeeting } from "@/components/features/meet/schedule";

export function MyComponent() {
  return (
    <ScheduleMeeting 
      onClose={() => console.log("Closed")}
      className="custom-class"
    />
  );
}
```

**Props:**
- `onClose?: () => void` - Callback when user wants to close
- `className?: string` - Additional CSS classes

### 2. ScheduleMeetingModal (Dialog Wrapper)
Opens the Schedule Meeting in a modal dialog.

```tsx
import { ScheduleMeetingModal } from "@/components/features/meet/schedule";
import { useState } from "react";

export function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Open Schedule
      </button>
      <ScheduleMeetingModal 
        open={open} 
        onOpenChange={setOpen} 
      />
    </>
  );
}
```

**Props:**
- `open?: boolean` - Controls modal visibility
- `onOpenChange?: (open: boolean) => void` - Called when modal state changes

### 3. ScheduleCalendar
A calendar picker for selecting dates.

```tsx
import { ScheduleCalendar } from "@/components/features/meet/schedule";

export function MyComponent() {
  return (
    <ScheduleCalendar
      onDateSelect={(date) => console.log(date)}
      selectedDate={new Date()}
      meetings={[]}
      onClose={() => {}}
    />
  );
}
```

**Props:**
- `onDateSelect: (date: Date) => void` - Called when date is selected
- `selectedDate?: Date` - Currently selected date
- `meetings?: ScheduledMeeting[]` - List of meetings to highlight
- `onClose?: () => void` - Close button callback
- `className?: string` - Additional CSS classes

### 4. ScheduleForm
Form for creating/editing meetings.

```tsx
import { ScheduleForm } from "@/components/features/meet/schedule";
import type { ScheduleMeetingFormData } from "@/components/features/meet/schedule";

export function MyComponent() {
  const handleSubmit = (data: ScheduleMeetingFormData) => {
    console.log("Meeting created:", data);
  };

  return (
    <ScheduleForm
      onSubmit={handleSubmit}
      onCancel={() => {}}
      initialData={{ title: "My Meeting" }}
      isLoading={false}
    />
  );
}
```

**Props:**
- `onSubmit: (data: ScheduleMeetingFormData) => void` - Form submission handler
- `onCancel?: () => void` - Cancel callback
- `initialData?: Partial<ScheduleMeetingFormData>` - Pre-fill form fields
- `isLoading?: boolean` - Shows loading state
- `className?: string` - Additional CSS classes

### 5. UpcomingMeetings
Displays a list of scheduled meetings.

```tsx
import { UpcomingMeetings } from "@/components/features/meet/schedule";

export function MyComponent() {
  return (
    <UpcomingMeetings
      meetings={meetingsArray}
      selectedDate={new Date()}
      onJoinMeeting={(meeting) => {}}
      onEditMeeting={(meeting) => {}}
      onDeleteMeeting={(meetingId) => {}}
      maxItems={5}
    />
  );
}
```

**Props:**
- `meetings: ScheduledMeeting[]` - Array of meetings to display
- `selectedDate?: Date` - Filter meetings by date
- `onJoinMeeting?: (meeting: ScheduledMeeting) => void` - Join button callback
- `onEditMeeting?: (meeting: ScheduledMeeting) => void` - Edit button callback
- `onDeleteMeeting?: (meetingId: string) => void` - Delete button callback
- `className?: string` - Additional CSS classes
- `maxItems?: number` - Maximum items to show (default: 3)

### 6. MeetingCard
Individual meeting display card.

```tsx
import { MeetingCard } from "@/components/features/meet/schedule";

export function MyComponent() {
  return (
    <MeetingCard
      meeting={meetingObject}
      onJoin={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  );
}
```

**Props:**
- `meeting: ScheduledMeeting` - Meeting data to display
- `onJoin?: () => void` - Join button callback
- `onEdit?: () => void` - Edit button callback
- `onDelete?: () => void` - Delete button callback
- `className?: string` - Additional CSS classes

## Types

### ScheduledMeeting
```typescript
interface ScheduledMeeting {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  eventType: 'meeting' | 'event';
  location?: string;
  participants: MeetingParticipant[];
  attachedBoard?: {
    id: string;
    name: string;
  };
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  color?: string;
  boardLink?: string;
}
```

### MeetingParticipant
```typescript
interface MeetingParticipant {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  status?: 'accepted' | 'pending' | 'declined';
}
```

### ScheduleMeetingFormData
```typescript
interface ScheduleMeetingFormData {
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  eventType: 'meeting' | 'event';
  location?: string;
  participants: string[];
}
```

## Integration Examples

### 1. In Meet Drawer
```tsx
import { useState } from "react";
import { ScheduleMeeting } from "@/components/features/meet/schedule";

export const MeetDrawerContent = () => {
  const [showSchedule, setShowSchedule] = useState(false);

  return showSchedule ? (
    <ScheduleMeeting onClose={() => setShowSchedule(false)} />
  ) : (
    <div>
      <button onClick={() => setShowSchedule(true)}>
        Schedule a Meeting
      </button>
      {/* Other drawer content */}
    </div>
  );
};
```

### 2. As a Modal
```tsx
import { ScheduleMeetingModal } from "@/components/features/meet/schedule";
import { useState } from "react";
import AppIconButton from "@/components/ui/custom/app-icon-button";

export const HeaderWithScheduling = () => {
  const [schedulingOpen, setSchedulingOpen] = useState(false);

  return (
    <>
      <AppIconButton
        icon="hugeicons:calendar-add-01"
        onClick={() => setSchedulingOpen(true)}
        title="Schedule Meeting"
        variant="fill"
        color="primary"
      />
      <ScheduleMeetingModal 
        open={schedulingOpen}
        onOpenChange={setSchedulingOpen}
      />
    </>
  );
};
```

### 3. With State Management
```tsx
import { useScheduleMeetings } from "@/components/features/meet/schedule";
import { ScheduleMeeting } from "@/components/features/meet/schedule";

export const ScheduleWithState = () => {
  const { 
    meetings, 
    addMeeting, 
    deleteMeeting, 
    updateMeeting 
  } = useScheduleMeetings();

  return (
    <ScheduleMeeting
      onClose={() => {}}
      // Pass your custom state management
    />
  );
};
```

## Internationalization

All text strings are managed through i18n. The translations are located in:
- `apps/pencilly_react/src/i18n/locales/en.json`

Under the `meet.schedule` namespace:

```json
{
  "meet": {
    "schedule": {
      "schedule_meeting": "Schedule Meeting",
      "calendar": "Calendar",
      "upcoming_meetings": "Upcoming Meetings",
      "meeting_title": "Meeting Title",
      // ... more keys
    }
  }
}
```

## Styling

The components use Tailwind CSS and follow the existing design system patterns:

- **Colors**: Uses theme colors defined in tailwind.config.ts
- **Typography**: Uses AppTypo component with variants (headingM, headingS, etc.)
- **Spacing**: Uses Tailwind spacing scale (p-4, gap-2, etc.)
- **Icons**: Uses AppIcon component with Hugeicons icon set

## Demo Data

The main ScheduleMeeting component includes demo data for testing:

```tsx
const [meetings, setMeetings] = useState<ScheduledMeeting[]>([
  {
    id: "1",
    title: "PRD Review – Checkout Flow V2",
    date: new Date(2025, 8, 19),
    startTime: "10:00",
    endTime: "11:30",
    eventType: "meeting",
    participants: [
      { id: "u1", name: "Ali R." },
      { id: "u2", name: "Sara M." },
    ],
    color: "blue",
    boardLink: "Checkout – User Flow & PRD",
  },
  // ... more meetings
]);
```

## Best Practices

1. **Accessibility**: All components include proper ARIA labels and keyboard navigation
2. **Performance**: Uses React memo for list items to prevent unnecessary re-renders
3. **Responsiveness**: Works on mobile and desktop with proper spacing
4. **Error Handling**: Form validation on submission
5. **Translations**: All user-facing text uses useTranslations hook

## Future Enhancements

- Integration with calendar APIs (Google Calendar, Outlook)
- Meeting reminders and notifications
- Participant management and RSVP tracking
- Meeting recording and transcription
- Video conferencing integration
- Recurring meetings
