import React, { type FC } from "react";

import CopyButton from "@/components/shared/CopyButton";
import RenderIf from "@/components/shared/RenderIf";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/i18n";

interface IProps {
  value: string;
  title: string;
  description?: string;
}

const CopyValue: FC<IProps> = ({ description, title, value }) => {
  const t = useTranslations("share");

  return (
    <div className="col gap-2">
      <AppTypo type="label">{title}</AppTypo>
      <div className="flex gap-2">
        <Input
          id="room-id"
          type="text"
          value={value}
          readOnly
          className="!h-10 px-3 "
        />
        <CopyButton

          text={value}
          title={t("copy_label")}
          variant="button"
          className="!h-10 w-24"
        />
      </div>
      <RenderIf isTrue={!!description}>
        <AppTypo variant="small" color="secondary">{description}</AppTypo>
      </RenderIf>
    </div>
  );
};

export default CopyValue;
