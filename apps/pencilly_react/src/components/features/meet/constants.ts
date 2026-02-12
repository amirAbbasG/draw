import {ChatGroupSettings} from "@/components/features/meet/types";

export const DEFAULT_GROUP_SETTINGS: ChatGroupSettings = {
    message: {
        allowMembersToSend: true,
        availability: "always",
        schedule: { start: "08:00", end: "08:00", repeat: ["Su", "Mo"] },
        allowedTypes: {
            all: false,
            textMessages: true,
            images: true,
            videos: true,
            fileUploads: true,
            links: false,
        },
        allowDeletion: true,
    },
    meeting: {
        allowCreation: false,
        chatDuringMeetingOnly: true,
        allowRecording: true,
    },
};