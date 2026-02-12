import { toast } from "sonner";

import MessageNotificationToast, {
  MessageNotificationData,
} from "@/components/features/meet/notification/MessageNotificationToast";

import CallNotificationToast, {
  CallNotificationData,
} from "./CallNotificationToast";

// Trigger an incoming call notification
export function showIncomingCall(
  callData: CallNotificationData,
  onCallAccepted?: () => void,
  onCallDeclined?: () => void,
) {
  toast.custom(
    toastId => (
      <CallNotificationToast
        data={callData}
        onAccept={() => {
          toast.dismiss(toastId);
          // Navigate to call screen, join call, etc.
          console.log("Call accepted!");
          onCallAccepted?.();
        }}
        onDecline={() => {
          toast.dismiss(toastId);
          // Notify backend the call was declined
          console.log("Call declined!");
          onCallDeclined?.();
        }}
      />
    ),
    {
      duration: 30000,
      unstyled: true, // we use our own styling
      position: "top-right",
      onAutoClose: () => {
        onCallDeclined?.();
      },
    },
  );
}

export function showMessageNotification(messageData: MessageNotificationData) {
  toast.custom(
    toastId => (
      <MessageNotificationToast
        data={messageData}
        onClose={() => {
          toast.dismiss(toastId);
        }}
        onClick={() => {
          toast.dismiss(toastId);
          // Navigate to the conversation
          console.log("Opening conversation:", messageData.conversationId);
        }}
      />
    ),
    {
      duration: 10000, // component handles its own 10s timeout
      unstyled: true,
      position: "top-right",
    },
  );
}
