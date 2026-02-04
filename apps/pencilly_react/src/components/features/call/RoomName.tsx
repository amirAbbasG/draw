import React, {type FC} from "react";
import AppTypo from "@/components/ui/custom/app-typo";
import CopyButton from "@/components/shared/CopyButton";
import {useTranslations} from "@/i18n";
import {StreamSession} from "@/components/features/call/types";

interface IProps {
session:  StreamSession
}

const RoomName: FC<IProps> = ({session}) => {
    const t = useTranslations("call");

    if (!session) return null;

    return (
        <div className="flex flex-col gap-1 border-b px-3 py-2">
            <div className="flex items-center gap-2">
                <AppTypo variant="xs" color="secondary">
                    {t("room_name")}:
                </AppTypo>
                <code className="rounded bg-muted px-2 py-1 text-xs">
                    {session.room_name}
                </code>
                <CopyButton
                    text={session.room_name}
                    className="ml-auto"
                    size="xs"
                />
            </div>
        </div>
    );
};

export default RoomName;