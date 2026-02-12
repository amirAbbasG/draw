# Schedule Meeting Integration Guide

This guide shows how to integrate the Schedule Meeting feature into the Meet drawer.

## Quick Start

### 1. Import the Component
```tsx
import { ScheduleMeeting } from "@/components/features/meet/schedule";
```

### 2. Add State to Your Meet Drawer
```tsx
const [showSchedule, setShowSchedule] = useState(false);
```

### 3. Add a Button to Open Schedule
In your drawer header or action bar:
```tsx
<Button
  icon="hugeicons:calendar-add-01"
  title="Schedule Meeting"
  onClick={() => setShowSchedule(true)}
/>
```

### 4. Conditionally Render
```tsx
{showSchedule ? (
  <ScheduleMeeting onClose={() => setShowSchedule(false)} />
) : (
  // Other meet content (chat, conversations, etc.)
)}
```

## Full Example Integration

```tsx
import React, { useState } from "react";
import { ScheduleMeeting } from "@/components/features/meet/schedule";
import { AppDrawer } from "@/components/shared/AppDrawer";
import { DynamicButton } from "@/components/shared/DynamicButton";
import { Button } from "@/components/ui/button";
import { Show } from "@/components/shared/Show";
import AppIcon from "@/components/ui/custom/app-icon";

export const MeetDrawerWithSchedule = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"messages" | "schedule">("messages");

  return (
    <AppDrawer
      open={isOpen}
      setOpen={setIsOpen}
      title="Meet"
      Trigger={
        <DynamicButton
          icon="hugeicons:call"
          title="Meet"
          variant="outline"
        />
      }
    >
      {/* Tab Navigation */}
      <div className="flex gap-2 px-3 py-2 border-b">
        <Button
          variant={activeTab === "messages" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("messages")}
          className="gap-1"
        >
          <AppIcon icon="hugeicons:chat-01" className="w-4 h-4" />
          Messages
        </Button>
        <Button
          variant={activeTab === "schedule" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("schedule")}
          className="gap-1"
        >
          <AppIcon icon="hugeicons:calendar-add-01" className="w-4 h-4" />
          Schedule
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <Show>
          <Show.When isTrue={activeTab === "messages"}>
            {/* Existing chat/messages content */}
            <div className="p-4">Messages content here</div>
          </Show.When>

          <Show.When isTrue={activeTab === "schedule"}>
            <ScheduleMeeting onClose={() => setActiveTab("messages")} />
          </Show.When>
        </Show>
      </div>
    </AppDrawer>
  );
};
```

## Alternative: Using Show Component

If you prefer a modal-like approach:

```tsx
import React, { useState } from "react";
import { ScheduleMeeting } from "@/components/features/meet/schedule";
import { Show } from "@/components/shared/Show";

export const MeetDrawerWithModal = () => {
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <Show>
      <Show.When isTrue={showSchedule}>
        <ScheduleMeeting onClose={() => setShowSchedule(false)} />
      </Show.When>

      <Show.Else>
        <div className="p-4 space-y-4">
          {/* Existing content */}
          <Button onClick={() => setShowSchedule(true)}>
            Schedule New Meeting
          </Button>
        </div>
      </Show.Else>
    </Show>
  );
};
```

## Integration with Existing MeetDrawer

Here's how to modify the existing `MeetDrawer` component:

```tsx
// In apps/pencilly_react/src/components/features/meet/index.tsx

import React, { useState, type FC } from "react";
import { ScheduleMeeting } from "@/components/features/meet/schedule";

const MeetDrawer: FC<MeetDrawerProps> = ({
  Trigger,
  open: controlledOpen,
  onOpenChange,
}) => {
  const t = useTranslations("meet");
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "schedule">("chat");
  // ... existing state ...

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  return (
    <>
      <AppDrawer
        open={isOpen}
        setOpen={setIsOpen}
        title="Meet"
        Trigger={Trigger ?? defaultTrigger}
        contentClassName="overflow-x-hidden flex flex-col"
        modal={false}
      >
        {/* Tab Navigation */}
        <div className="flex gap-2 px-3 py-2 border-y">
          <StatusBadge status={connectionState} />
          <Button
            variant={activeTab === "chat" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("chat")}
            className="gap-1"
          >
            <AppIcon icon="hugeicons:chat-01" className="w-4 h-4" />
            Chats
          </Button>
          <Button
            variant={activeTab === "schedule" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("schedule")}
            className="gap-1"
          >
            <AppIcon icon="hugeicons:calendar-add-01" className="w-4 h-4" />
            Schedule
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Show>
            <Show.When isTrue={activeTab === "chat"}>
              {/* Existing chat content */}
              {/* ... ConversationPage, Chat, etc. ... */}
            </Show.When>

            <Show.When isTrue={activeTab === "schedule"}>
              <ScheduleMeeting 
                onClose={() => setActiveTab("chat")}
              />
            </Show.When>
          </Show>
        </div>
      </AppDrawer>
    </>
  );
};
```

## Using the Hook for External State Management

If you want to manage meetings state outside the component:

```tsx
import { useScheduleMeetings } from "@/components/features/meet/schedule";

export const MyMeetComponent = () => {
  const {
    meetings,
    isLoading,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    getMeetingsForDate,
    getUpcomingMeetings,
  } = useScheduleMeetings();

  const handleSchedule = async (formData) => {
    await addMeeting(formData);
    console.log("Meeting scheduled!");
  };

  return (
    <div>
      <ScheduleMeeting />
      <p>Total meetings: {meetings.length}</p>
    </div>
  );
};
```

## Opening from Different Locations

### From Header
```tsx
// In your header component
<Button
  onClick={() => setShowScheduleModal(true)}
  icon="hugeicons:calendar-add-01"
>
  Schedule Meeting
</Button>

{showScheduleModal && (
  <ScheduleMeeting onClose={() => setShowScheduleModal(false)} />
)}
```

### As a Separate Page/Route
```tsx
// apps/pencilly_react/src/pages/schedule.tsx
import { ScheduleMeeting } from "@/components/features/meet/schedule";

export default function SchedulePage() {
  return (
    <main className="container mx-auto p-4">
      <ScheduleMeeting />
    </main>
  );
}
```

### As a Modal Dialog
```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ScheduleDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Schedule Meeting</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
          </DialogHeader>
          <ScheduleMeeting onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
```

## Connecting to Backend

When you're ready to connect to your backend:

```tsx
const { addMeeting } = useScheduleMeetings();

const handleFormSubmit = async (formData) => {
  try {
    const response = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const newMeeting = await response.json();
    addMeeting(newMeeting);
  } catch (error) {
    console.error("Failed to schedule meeting:", error);
  }
};
```

## Styling Customization

### Override Tailwind Classes
```tsx
<ScheduleMeeting
  className="bg-custom-bg text-custom-text"
/>
```

### Modify Theme Tokens
Update `globals.css` and `tailwind.config.ts`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3%;
  --primary: 262 80% 50%;
  --primary-foreground: 210 40% 98%;
  /* ... more tokens ... */
}
```

## Common Patterns

### Pattern 1: Floating Button
```tsx
<button
  onClick={() => setShowSchedule(true)}
  className="fixed bottom-4 right-4 rounded-full bg-primary p-4 shadow-lg"
>
  <AppIcon icon="hugeicons:calendar-add-01" />
</button>

{showSchedule && <ScheduleMeeting onClose={() => setShowSchedule(false)} />}
```

### Pattern 2: Sidebar Integration
```tsx
<div className="sidebar">
  <nav>
    <NavItem
      icon="chat"
      label="Messages"
      active={activeTab === "chat"}
      onClick={() => setActiveTab("chat")}
    />
    <NavItem
      icon="calendar"
      label="Schedule"
      active={activeTab === "schedule"}
      onClick={() => setActiveTab("schedule")}
    />
  </nav>
  <div className="content">
    {activeTab === "schedule" && <ScheduleMeeting />}
  </div>
</div>
```

### Pattern 3: Dropdown Menu
```tsx
<DropdownMenu>
  <DropdownTrigger asChild>
    <Button>Options</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem onClick={() => setShowSchedule(true)}>
      Schedule Meeting
    </DropdownItem>
  </DropdownContent>
</DropdownMenu>
```

## API Integration Checklist

- [ ] Create backend endpoint POST `/api/meetings`
- [ ] Create backend endpoint GET `/api/meetings?date=YYYY-MM-DD`
- [ ] Create backend endpoint PUT `/api/meetings/:id`
- [ ] Create backend endpoint DELETE `/api/meetings/:id`
- [ ] Add authentication/authorization
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Implement real-time updates (optional)
- [ ] Add meeting notifications
- [ ] Add email invitations

## Performance Tips

1. **Memoize Components**: Use `React.memo()` for MeetingCard if rendering many items
2. **Virtual Scrolling**: For 100+ meetings, implement react-window
3. **Pagination**: Load meetings in batches from backend
4. **Debounce**: Debounce date selection if triggering searches
5. **Code Splitting**: Lazy load the schedule component route

---

**Need Help?**
- See README.md for component API details
- Check types.ts for TypeScript interfaces
- Review demo data in ScheduleMeeting.tsx for examples
