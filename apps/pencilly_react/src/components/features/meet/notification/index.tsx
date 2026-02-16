import { toast } from "sonner";

import MessageNotificationToast, {
  MessageNotificationData,
} from "@/components/features/meet/notification/MessageNotificationToast";

import CallNotificationToast, {
  CallNotificationData,
} from "./CallNotificationToast";

/** Trigger an incoming call notification */
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
          onCallAccepted?.();
        }}
        onDecline={() => {
          toast.dismiss(toastId);
          onCallDeclined?.();
        }}
      />
    ),
    {
      duration: 30000,
      unstyled: true,
      position: "top-right",
      onAutoClose: () => {
        onCallDeclined?.();
      },
    },
  );
}

/** Trigger a new message notification (only when user is NOT in that conversation) */
export function showMessageNotification(
  messageData: MessageNotificationData,
  onOpenConversation?: (conversationId: string) => void,
) {
  toast.custom(
    toastId => (
      <MessageNotificationToast
        data={messageData}
        onClose={() => {
          toast.dismiss(toastId);
        }}
        onClick={() => {
          toast.dismiss(toastId);
          if (messageData.conversationId && onOpenConversation) {
            onOpenConversation(messageData.conversationId);
          }
        }}
      />
    ),
    {
      duration: 10000,
      unstyled: true,
      position: "top-right",
    },
  );
}
