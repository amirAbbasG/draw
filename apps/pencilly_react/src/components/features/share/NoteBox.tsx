import React, {type FC} from "react";
import {useTranslations} from "@/i18n";
import AppTypo from "@/components/ui/custom/app-typo";

interface IProps {
title?: string;
note: string
}

const NoteBox: FC<IProps> = ({note, title}) => {
    const t = useTranslations("share");

    return (
        <div className="rounded-lg bg-background-light p-4 border ">
            <AppTypo color="secondary" variant="small" className=" leading-relaxed">
                <span className="text-foreground me-0.5 !text-base font-semibold">{title || t("note")}</span> {note}
            </AppTypo>
        </div>
    );
};

export default NoteBox;