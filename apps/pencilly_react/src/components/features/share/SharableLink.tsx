import React, { type FC } from "react";

import ActionBox from "@/components/features/share/ActionBox";
import CopyValue from "@/components/features/share/CopyValue";
import NoteBox from "@/components/features/share/NoteBox";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  link: string;
  onClose: () => void;
}

const SharableLink: FC<IProps> = ({ link, onClose }) => {
  const t = useTranslations("share");

  return (
    <>
      <DialogHeader className="px-6 py-4 border-b ">
        <div className="flex items-center gap-3">
          <AppIconButton icon={sharedIcons.arrow_left} onClick={onClose} />
          <DialogTitle className="text-2xl font-semibold">
            {t("share_link")}
          </DialogTitle>
        </div>
      </DialogHeader>

      <div className="px-6 py-8 space-y-6">
        <ActionBox
          icon={sharedIcons.link}
          title={t("your_link")}
          subtitle={t("link_subtitle")}
          iconClassName="bg-secondary/10  text-secondary"
          rootClassName="hover:border-secondary"
        >
          <CopyValue
            value={link}
            title={t("link")}
            description={t("link_description")}
          />
        </ActionBox>
        <NoteBox note={t("link_note")} />
      </div>
    </>
  );
};

export default SharableLink;
