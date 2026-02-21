import React from "react";
import {useUser} from "@/stores/context/user";
import {useTranslations} from "@/i18n";
import {UserAvatar} from "@/components/features/user/UserAvatar";
import AppTypo from "@/components/ui/custom/app-typo";

const ConnectPending = () => {
    const { user } = useUser();
    const t = useTranslations("meet.status");

    return (
        <div className="flex-1 px-4 py-2 col">
            <div className="flex-1 p-8 centered-col gap-4 bg-muted rounded-lg">
                <div className=" size-32 relative">
                    <div
                        className="absolute size-20 delay-0 center-position animate-ping border-2 border-primary rounded-full"/>
                    <div
                        className="absolute size-20 delay-100 center-position animate-ping border-2 border-primary rounded-full"/>
                    <UserAvatar
                        name={user?.username}
                        imageSrc={user?.profile_image_url ?? undefined}
                        className="size-full ring-primary ring-2 ring-offset-2"
                    />
                </div>
                <AppTypo variant="headingM">{t("connecting")}</AppTypo>
            </div>
        </div>
    );
};

export default ConnectPending;