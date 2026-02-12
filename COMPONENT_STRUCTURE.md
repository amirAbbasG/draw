# Schedule Meeting - Component Structure & Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────┐
│            ScheduleMeetingModal                  │
│         (Dialog Wrapper, Optional)               │
└────────────────┬────────────────────────────────┘
                 │
┌─────────────────v────────────────────────────────┐
│          ScheduleMeeting (Main)                  │
│      (Container, State Management)               │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────┐   ┌──────────────────┐   │
│  │  Calendar View   │   │   Form View      │   │
│  ├──────────────────┤   ├──────────────────┤   │
│  │                  │   │                  │   │
│  │ - ScheduleCalendar   │ - Title Input    │   │
│  │ - UpcomingMeetings   │ - Date Picker    │   │
│  │   └─ MeetingCard     │ - Time Inputs    │   │
│  │   └─ MeetingCard     │ - Type Selector  │   │
│  │   └─ MeetingCard     │ - Location Input │   │
│  │                  │   │ - Submit Button  │   │
│  │                  │   │ - Cancel Button  │   │
│  └──────────────────┘   └──────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Component Relationships

### ScheduleMeeting (Main Container)
```
ScheduleMeeting
├── State: meetings[], selectedDate, showForm
├── Handlers: handleFormSubmit, handleJoin, handleEdit, handleDelete
└── Layout: Toggle between calendar/form views
    ├── View 1: Calendar & Upcoming
    │   ├── ScheduleCalendar
    │   │   └── onDateSelect → updates selectedDate
    │   └── UpcomingMeetings
    │       ├── Filtered by selectedDate
    │       └── MeetingCard[] (array)
    │           ├── onJoin → handleJoinMeeting
    │           ├── onEdit → handleEditMeeting
    │           └── onDelete → handleDeleteMeeting
    │
    └── View 2: Form
        └── ScheduleForm
            ├── onSubmit → handleFormSubmit
            └── onCancel → toggles back to calendar view
```

### ScheduleCalendar Component
```
ScheduleCalendar
├── Props:
│   ├── onDateSelect: (date: Date) => void
│   ├── selectedDate?: Date
│   ├── meetings?: ScheduledMeeting[]
│   ├── onClose?: () => void
│   └── className?: string
│
├── State:
│   └── date: Date | undefined
│
└── Renders:
    ├── Header
    │   ├── Title: "Calendar"
    │   └── Close Button (AppIconButton)
    └── Calendar (Radix UI)
        ├── Single mode
        ├── Disabled past dates
        └── onSelect → handleDateSelect
```

### ScheduleForm Component
```
ScheduleForm
├── Props:
│   ├── onSubmit: (data: ScheduleMeetingFormData) => void
│   ├── onCancel?: () => void
│   ├── initialData?: Partial<ScheduleMeetingFormData>
│   ├── isLoading?: boolean
│   └── className?: string
│
├── State:
│   └── formData: Partial<ScheduleMeetingFormData>
│
└── Renders:
    ├── Title Input
    │   └── type="text"
    ├── Description Input
    │   └── type="text"
    ├── Date Grid (2 cols)
    │   ├── Date Picker
    │   │   └── type="date"
    │   └── Event Type Selector
    │       ├── Meeting
    │       └── Event
    ├── Time Grid (2 cols)
    │   ├── Start Time
    │   │   └── type="time"
    │   └── End Time
    │       └── type="time"
    ├── Location Input
    │   └── type="text"
    └── Button Grid (2 cols)
        ├── Submit Button
        └── Cancel Button
```

### UpcomingMeetings Component
```
UpcomingMeetings
├── Props:
│   ├── meetings: ScheduledMeeting[]
│   ├── selectedDate?: Date
│   ├── onJoinMeeting?: (meeting: ScheduledMeeting) => void
│   ├── onEditMeeting?: (meeting: ScheduledMeeting) => void
│   ├── onDeleteMeeting?: (meetingId: string) => void
│   ├── className?: string
│   └── maxItems?: number (default: 3)
│
├── Computed:
│   └── filteredMeetings: ScheduledMeeting[]
│       ├── If selectedDate: filter by date
│       └── Else: sort by date, limit to maxItems
│
└── Renders:
    ├── Header
    │   ├── Title: "Upcoming Meetings"
    │   └── Count Badge
    └── Content
        ├── If meetings.length > 0:
        │   └── Scrollable List
        │       └── MeetingCard[]
        └── Else:
            └── Empty State
                ├── "No scheduled meetings"
                └── Current date (if filtered)
```

### MeetingCard Component
```
MeetingCard
├── Props:
│   ├── meeting: ScheduledMeeting
│   ├── onJoin?: () => void
│   ├── onEdit?: () => void
│   ├── onDelete?: () => void
│   └── className?: string
│
├── Computed:
│   └── participantsList: string
│       └── First 2 names + "+N"
│
└── Renders:
    ├── Left Border (Color-coded)
    │   └── meeting.color
    ├── Content
    │   ├── Title
    │   │   └── meeting.title
    │   ├── Time
    │   │   └── "startTime - endTime"
    │   ├── Participants
    │   │   └── participantsList + count
    │   └── Attached Board (if exists)
    │       └── board indicator
    │
    └── Actions (Right side)
        ├── Join Button (if onJoin)
        ├── Edit Button (if onEdit)
        └── Delete Button (if onDelete)
```

### ScheduleMeetingModal Component
```
ScheduleMeetingModal
├── Props:
│   ├── open?: boolean
│   └── onOpenChange?: (open: boolean) => void
│
└── Renders:
    ├── Dialog (Radix UI)
    │   ├── Overlay
    │   │   └── Semi-transparent backdrop
    │   ├── Content
    │   │   ├── Header
    │   │   │   ├── Title: "Schedule Meeting"
    │   │   │   └── Close Button (AppIconButton)
    │   │   └── Body
    │   │       └── ScheduleMeeting (component)
    │   └── onOpenChange → trigger close
```

## Data Flow

### Creating a Meeting

```
User Input
    ↓
ScheduleForm (component)
    ↓
handleFormSubmit (ScheduleMeeting)
    ↓
setMeetings([...meetings, newMeeting])
    ↓
UpcomingMeetings (re-renders)
    ↓
MeetingCard[] (updated list)
```

### Selecting a Date

```
ScheduleCalendar (onClick)
    ↓
handleDateSelect
    ↓
setSelectedDate (ScheduleMeeting)
    ↓
UpcomingMeetings (re-renders)
    ↓
MeetingCard[] (filtered by date)
```

### Joining a Meeting

```
MeetingCard (onJoin button)
    ↓
handleJoinMeeting (ScheduleMeeting)
    ↓
[Your custom logic]
    ↓
(e.g., startVideoCall, playNotification)
```

## State Management

### ScheduleMeeting State
```typescript
{
  meetings: ScheduledMeeting[];          // All meetings
  selectedDate: Date | undefined;        // Currently selected date
  showForm: boolean;                     // Toggle calendar/form view
}
```

### ScheduleForm State
```typescript
{
  formData: {
    title: string;
    description?: string;
    date: Date;
    startTime: string;
    endTime: string;
    eventType: 'meeting' | 'event';
    participants: string[];
    location?: string;
  }
}
```

### ScheduleCalendar State
```typescript
{
  date: Date | undefined;                // Selected date
}
```

## Props Flow (Top-Down)

```
ScheduleMeeting
├── ScheduleCalendar
│   ├── meetings (prop)
│   ├── selectedDate (prop)
│   └── onDateSelect (callback)
│
└── UpcomingMeetings
    ├── meetings (prop)
    ├── selectedDate (prop)
    ├── onJoinMeeting (callback)
    ├── onEditMeeting (callback)
    ├── onDeleteMeeting (callback)
    │
    └── MeetingCard (inside loop)
        ├── meeting (prop)
        ├── onJoin (callback wrapper)
        ├── onEdit (callback wrapper)
        └── onDelete (callback wrapper)
```

## Event Handlers

### In ScheduleMeeting
```
handleFormSubmit: (data) => {
  // 1. Create new ScheduledMeeting object
  // 2. Add to meetings array
  // 3. Hide form
  // 4. Clear selected date (optional)
}

handleJoinMeeting: (meeting) => {
  // 1. Trigger call/meeting join logic
  // 2. Optional: show notification
  // 3. Optional: update meeting status
}

handleEditMeeting: (meeting) => {
  // 1. Pre-fill form with meeting data
  // 2. Show form
  // 3. Update existing meeting on submit
}

handleDeleteMeeting: (meetingId) => {
  // 1. Filter meeting from array
  // 2. Update state
}
```

## Conditional Rendering

### ScheduleMeeting
```
showForm === true
  → Render form view
    - ScheduleForm component
    - Back button

showForm === false
  → Render calendar view
    - ScheduleCalendar component
    - UpcomingMeetings component
    - New Meeting button
```

### UpcomingMeetings
```
filteredMeetings.length > 0
  → Render scrollable list of MeetingCard

filteredMeetings.length === 0
  → Render empty state message
  → Show filtered date if selectedDate exists
```

## Styling Architecture

### CSS Classes Used
```
Layout Classes:
- flex, flex-col, flex-row
- gap-*, p-*, m-*
- justify-*, items-*
- overflow-y-auto, overflow-hidden

Component Classes:
- rounded-lg, rounded-md
- border, border-l-4
- bg-background, bg-card
- text-foreground, text-muted-foreground

Interactive Classes:
- hover:*, active:*
- disabled:*
- transition-*
- cursor-pointer

Responsive Classes:
- md:*, lg:*
- grid, grid-cols-2
```

## Component Export Structure

```
/schedule/
├── ScheduleMeeting.tsx (default export + named)
├── ScheduleMeetingModal.tsx (named export)
├── ScheduleCalendar.tsx (named export)
├── ScheduleForm.tsx (named export)
├── UpcomingMeetings.tsx (named export)
├── MeetingCard.tsx (named export)
├── types.ts (type exports)
├── useScheduleMeetings.ts (hook export)
├── MeetingNotification.tsx (named export)
└── index.ts (central barrel export)

Usage:
import { ScheduleMeeting, ScheduleMeetingModal, ScheduleCalendar } from "@/components/features/meet/schedule";
```

## Integration Points

### With React Ecosystem
- useState (state management)
- useCallback (memoization, optional)
- useTranslations (i18n)

### With Pencilly
- AppIcon (icon component)
- AppIconButton (button with icon)
- AppTypo (typography)
- Dialog (modal container)
- Calendar (date picker)
- Button (action buttons)
- Input (form inputs)
- Select (dropdown selector)

### With Theme System
- Tailwind CSS variables
- Design tokens (colors, spacing)
- Font families

---

## Performance Considerations

### Optimization Opportunities
1. **Memoization**: MeetingCard could use React.memo
2. **Lazy Loading**: Calendar could lazy load large lists
3. **Pagination**: Meetings list could paginate
4. **Debouncing**: Form inputs could debounce

### Current Implementation
- Direct state updates (acceptable for small datasets)
- No unnecessary re-renders (controlled components)
- Event handlers properly scoped

---

This document serves as a visual reference for understanding how all components fit together and how data flows through the system.
