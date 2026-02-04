import {sharedIcons} from "@/constants/icons";

export const actions = [
    {
        id: "rename",
        icon: sharedIcons.edit,
        divider: false,
    },
    {
        id: "duplicate",
        icon: sharedIcons.duplicate,
        divider: false,
    },
    {
        id: "move_up",
        icon: sharedIcons.page_up,
        divider: false,
    },
    {
        id: "move_down",
        icon: sharedIcons.page_down,
        divider: false,
    },
    {
        id: "delete",
        icon: sharedIcons.delete,
        divider: true,
    },
] as const;
