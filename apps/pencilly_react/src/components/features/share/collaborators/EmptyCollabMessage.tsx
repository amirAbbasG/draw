import React from "react";
import AppIcon from "@/components/ui/custom/app-icon";
import {sharedIcons} from "@/constants/icons";
import AppTypo from "@/components/ui/custom/app-typo";
import {useTranslations} from "@/i18n";

const EmptyCollabMessage= () => {
    const t = useTranslations("share.collaborators_popup");

    return (
        <div className="centered-col py-8 text-center">
            <AppIcon
                icon={sharedIcons.user_group}
                className="h-12 w-12 text-muted-foreground/50 mb-3"
            />
            <AppTypo color="secondary" className="font-medium">
                {t("empty_state_title")}
            </AppTypo>
            <AppTypo color="secondary" variant="small">
                {t("empty_state_description")}
            </AppTypo>
        </div>
    );
};

export default EmptyCollabMessage;