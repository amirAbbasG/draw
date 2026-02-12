# Schedule Meeting - Quick Start Guide

## 5-Minute Setup

### 1. Import the Component

```tsx
import { ScheduleMeeting } from "@/components/features/meet/schedule";
```

### 2. Use It Directly

```tsx
export function MyComponent() {
  return (
    <ScheduleMeeting 
      onClose={() => console.log("Closed")}
    />
  );
}
```

### 3. Or Use as Modal

```tsx
import { ScheduleMeetingModal } from "@/components/features/meet/schedule";
import { useState } from "react";

export function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Schedule Meeting</button>
      <ScheduleMeetingModal open={open} onOpenChange={setOpen} />
    </>
  );
}
```

---

## Integration with Meet Drawer

Add to your `apps/pencilly_react/src/components/features/meet/index.tsx`:

```tsx
import { ScheduleMeeting } from "@/components/features/meet/schedule";

const MeetDrawer: FC<MeetDrawerProps> = ({ ... }) => {
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <div>
      {showSchedule ? (
        <ScheduleMeeting onClose={() => setShowSchedule(false)} />
      ) : (
        <div>
          <button onClick={() => setShowSchedule(true)}>
            Schedule Meeting
          </button>
          {/* Other drawer content */}
        </div>
      )}
    </div>
  );
};
```

---

## Add to Header

```tsx
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { ScheduleMeetingModal } from "@/components/features/meet/schedule";
import { useState } from "react";

export function Header() {
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <>
      <AppIconButton
        icon="hugeicons:calendar-add-01"
        onClick={() => setScheduleOpen(true)}
        title="Schedule Meeting"
        variant="fill"
        color="primary"
      />
      <ScheduleMeetingModal 
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
      />
    </>
  );
}
```

---

## Available Components

### Main Components
- `ScheduleMeeting` - Full feature with calendar + form + list
- `ScheduleMeetingModal` - Modal dialog wrapper
- `ScheduleCalendar` - Just the calendar
- `ScheduleForm` - Just the form
- `UpcomingMeetings` - Just the meetings list
- `MeetingCard` - Single meeting display

### Example: Custom Layout

```tsx
import { 
  ScheduleCalendar, 
  ScheduleForm, 
  UpcomingMeetings 
} from "@/components/features/meet/schedule";
import { useState } from "react";

export function CustomSchedule() {
  const [selectedDate, setSelectedDate] = useState<Date>();

  return (
    <div className="grid grid-cols-2 gap-4">
      <ScheduleCalendar 
        onDateSelect={setSelectedDate}
        selectedDate={selectedDate}
      />
      <UpcomingMeetings 
        meetings={[]}
        selectedDate={selectedDate}
      />
    </div>
  );
}
```

---

## Translation Keys

All text is in `meet.schedule` namespace. Add custom translations:

```json
{
  "meet": {
    "schedule": {
      "schedule_meeting": "Schedule Meeting",
      "calendar": "Calendar",
      "upcoming_meetings": "Upcoming Meetings",
      "new_meeting": "New Meeting",
      "create_new_meeting": "Create New Meeting",
      "meeting_title": "Meeting Title",
      "meeting_title_placeholder": "Enter meeting title",
      "description": "Description",
      "description_placeholder": "Add meeting description",
      "date": "Date",
      "event_type": "Event Type",
      "meeting": "Meeting",
      "event": "Event",
      "start_time": "Start Time",
      "end_time": "End Time",
      "location": "Location",
      "location_placeholder": "Enter location or room",
      "join_meeting": "Join",
      "attached_board": "Attached Board",
      "cancel": "Cancel",
      "close": "Close"
    }
  }
}
```

---

## Types Reference

```typescript
import type { 
  ScheduledMeeting, 
  MeetingParticipant, 
  ScheduleMeetingFormData 
} from "@/components/features/meet/schedule";

// Create a meeting
const meeting: ScheduledMeeting = {
  id: "1",
  title: "Team Sync",
  date: new Date(),
  startTime: "10:00",
  endTime: "11:00",
  eventType: "meeting",
  participants: [
    { id: "u1", name: "John Doe" }
  ],
};

// Form submission
const formData: ScheduleMeetingFormData = {
  title: "Team Sync",
  date: new Date(),
  startTime: "10:00",
  endTime: "11:00",
  eventType: "meeting",
  participants: ["user1", "user2"],
};
```

---

## Demo Data

The component includes demo meetings for testing:

**Date**: September 19, 2025

1. **PRD Review – Checkout Flow V2**
   - Time: 10:00 - 11:30
   - Participants: Ali R., Sara M., Hossein D.
   - Board: Checkout – User Flow & PRD

2. **Product Discussion**
   - Time: 12:00 - 13:00
   - Participants: Mohammad, Fatima

---

## Features

✅ Calendar date picker  
✅ Create new meetings  
✅ View upcoming meetings  
✅ Join/Edit/Delete meetings  
✅ Filter by date  
✅ Responsive design  
✅ Full i18n support  
✅ TypeScript typed  
✅ Demo data included  
✅ Modal dialog mode  

---

## Styling

Components use Tailwind CSS and theme colors. Customize by:

1. **Colors**: Modify theme in `tailwind.config.ts`
2. **Spacing**: Use Tailwind classes (p-4, gap-2, etc.)
3. **Typography**: Use AppTypo variants

Example customization:

```tsx
<ScheduleMeeting 
  className="rounded-xl border border-purple-300 bg-purple-50"
/>
```

---

## Common Tasks

### Handle Form Submission
```tsx
const [meetings, setMeetings] = useState([]);

const handleFormSubmit = (data: ScheduleMeetingFormData) => {
  const newMeeting: ScheduledMeeting = {
    id: `meeting-${Date.now()}`,
    ...data,
    participants: [],
  };
  setMeetings([...meetings, newMeeting]);
};
```

### Join Meeting
```tsx
const handleJoinMeeting = (meeting: ScheduledMeeting) => {
  // Integrate with video call
  startVideoCall(meeting.id);
};
```

### Delete Meeting
```tsx
const handleDeleteMeeting = (meetingId: string) => {
  setMeetings(meetings.filter(m => m.id !== meetingId));
};
```

### Filter by Date
```tsx
const [selectedDate, setSelectedDate] = useState<Date>();

<UpcomingMeetings
  meetings={meetings}
  selectedDate={selectedDate}
/>
```

---

## Troubleshooting

### Translations not showing?
- Check `useTranslations("meet.schedule")` is called
- Verify en.json has all keys under `meet.schedule`

### Styles not applied?
- Ensure Tailwind CSS is imported in globals.css
- Check theme colors in tailwind.config.ts

### Calendar not working?
- Verify Date objects are passed correctly
- Check disabled date logic

---

## More Information

See **USAGE.md** for comprehensive documentation and advanced examples.
