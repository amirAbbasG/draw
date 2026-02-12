# Schedule Meeting Components

A comprehensive meeting scheduling system for the Meet feature with calendar integration, upcoming meetings notifications, and meeting management.

## Components

### 1. **ScheduleMeeting** (Main Component)
The main container component that orchestrates all scheduling features.

```tsx
import { ScheduleMeeting } from "@/components/features/meet/schedule";

<ScheduleMeeting 
  onClose={() => console.log("closed")}
  className="custom-class"
/>
```

**Props:**
- `onClose?`: () => void - Callback when user closes the component
- `className?`: string - Additional CSS classes

**Features:**
- Toggle between schedule view and form
- Calendar picker for date selection
- Upcoming meetings list
- Create new meeting form

### 2. **ScheduleCalendar**
Calendar component for date selection with meeting indicators.

```tsx
import { ScheduleCalendar } from "@/components/features/meet/schedule";

<ScheduleCalendar
  onDateSelect={(date) => console.log(date)}
  selectedDate={new Date()}
  meetings={meetingsList}
/>
```

**Props:**
- `onDateSelect`: (date: Date) => void - Called when user selects a date
- `selectedDate?`: Date - Currently selected date
- `meetings?`: ScheduledMeeting[] - Array of meetings to highlight
- `className?`: string - Additional CSS classes

### 3. **UpcomingMeetings**
Displays a list of upcoming meetings with filtering by date.

```tsx
import { UpcomingMeetings } from "@/components/features/meet/schedule";

<UpcomingMeetings
  meetings={meetingsList}
  selectedDate={selectedDate}
  onJoinMeeting={(meeting) => joinCall(meeting)}
  onEditMeeting={(meeting) => editMeeting(meeting)}
  onDeleteMeeting={(id) => deleteMeeting(id)}
  maxItems={5}
/>
```

**Props:**
- `meetings`: ScheduledMeeting[] - List of meetings
- `selectedDate?`: Date - Filter meetings by this date
- `onJoinMeeting?`: (meeting: ScheduledMeeting) => void
- `onEditMeeting?`: (meeting: ScheduledMeeting) => void
- `onDeleteMeeting?`: (meetingId: string) => void
- `maxItems?`: number - Maximum items to display (default: 3)
- `className?`: string - Additional CSS classes

### 4. **ScheduleForm**
Form component for creating/editing meetings.

```tsx
import { ScheduleForm } from "@/components/features/meet/schedule";

<ScheduleForm
  onSubmit={(data) => createMeeting(data)}
  onCancel={() => goBack()}
  initialData={{ date: new Date() }}
  isLoading={false}
/>
```

**Props:**
- `onSubmit`: (data: ScheduleMeetingFormData) => void - Form submission handler
- `onCancel?`: () => void - Cancel button handler
- `initialData?`: Partial<ScheduleMeetingFormData> - Pre-filled form data
- `isLoading?`: boolean - Loading state
- `className?`: string - Additional CSS classes

**Form Fields:**
- Meeting Title (required)
- Description (optional)
- Date (required)
- Event Type (Meeting or Event)
- Start Time & End Time
- Location (optional)

### 5. **MeetingCard**
Individual meeting display card with action buttons.

```tsx
import { MeetingCard } from "@/components/features/meet/schedule";

<MeetingCard
  meeting={meeting}
  onJoin={() => joinMeeting()}
  onEdit={() => editMeeting()}
  onDelete={() => deleteMeeting()}
/>
```

**Props:**
- `meeting`: ScheduledMeeting - Meeting data to display
- `onJoin?`: () => void - Join button callback
- `onEdit?`: () => void - Edit button callback
- `onDelete?`: () => void - Delete button callback
- `className?`: string - Additional CSS classes

### 6. **MeetingNotification**
Toast-like notification for upcoming meetings.

```tsx
import { MeetingNotification } from "@/components/features/meet/schedule";

<MeetingNotification
  meeting={meeting}
  onJoin={() => joinMeeting()}
  onDismiss={() => dismissNotification()}
  autoClose={5000}
/>
```

**Props:**
- `meeting`: ScheduledMeeting - Meeting to notify about
- `onJoin?`: () => void - Join button callback
- `onDismiss?`: () => void - Called when notification closes
- `autoClose?`: number - Auto-close timeout in ms (default: 5000, 0 to disable)
- `className?`: string - Additional CSS classes

## Custom Hook

### **useScheduleMeetings**
Hook for managing meeting state.

```tsx
import { useScheduleMeetings } from "@/components/features/meet/schedule";

const {
  meetings,
  isLoading,
  addMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingsForDate,
  getUpcomingMeetings,
} = useScheduleMeetings(initialMeetings);
```

**Methods:**
- `addMeeting(data)`: Promise<ScheduledMeeting> - Add new meeting
- `updateMeeting(id, data)`: Promise<void> - Update existing meeting
- `deleteMeeting(id)`: Promise<void> - Delete meeting
- `getMeetingsForDate(date)`: ScheduledMeeting[] - Get meetings for specific date
- `getUpcomingMeetings(limit)`: ScheduledMeeting[] - Get upcoming meetings

## Types

```typescript
interface ScheduledMeeting {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  participants: MeetingParticipant[];
  eventType: "meeting" | "event";
  location?: string;
  boardLink?: string;
  color?: string;
}

interface MeetingParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  status?: "accepted" | "pending" | "declined";
}

interface ScheduleMeetingFormData {
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  participants: string[];
  eventType: "meeting" | "event";
  location?: string;
}
```

## Usage in Meet Drawer

To integrate with the Meet drawer, add the schedule button in the drawer header:

```tsx
import { ScheduleMeeting } from "@/components/features/meet/schedule";

// In MeetDrawer component
const [showSchedule, setShowSchedule] = useState(false);

return (
  <AppDrawer open={isOpen} setOpen={setIsOpen} title="Meet">
    <div className="flex gap-2 px-3 py-2 border-y">
      <StatusBadge status={connectionState} />
      <DynamicButton
        icon="hugeicons:calendar-add-01"
        title="Schedule"
        onClick={() => setShowSchedule(true)}
      />
    </div>
    
    {showSchedule ? (
      <ScheduleMeeting onClose={() => setShowSchedule(false)} />
    ) : (
      // Other drawer content
    )}
  </AppDrawer>
);
```

## Translations

All text is translatable using the `useTranslations` hook with the "meet.schedule" namespace:

```tsx
const t = useTranslations("meet.schedule");
```

Available keys:
- `schedule_meeting`
- `calendar`
- `upcoming_meetings`
- `new_meeting`
- `create_new_meeting`
- `meeting_title`
- `description`
- `date`
- `event_type`
- `start_time`
- `end_time`
- `location`
- `join_meeting`
- And more...

## Styling

Components use Tailwind CSS with semantic design tokens from `globals.css`. Customize the color scheme by modifying the design tokens in your theme configuration.

## Integration Tips

1. **With Real Data**: Replace demo data with API calls to fetch meetings from your backend
2. **Notifications**: Use `MeetingNotification` to alert users about upcoming meetings
3. **Calendar Integration**: Connect with your calendar provider for sync
4. **Participants**: Implement participant management with email invitations
5. **Call Integration**: Connect `onJoinMeeting` to your call system
