import React, { type FC } from "react";

import RenderIf from "@/components/shared/RenderIf";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { sharedIcons } from "@/constants/icons";
import {cn} from "@/lib/utils";

interface IProps {
  title: string;
  icon: string;
  subtitle: string;
  onClose?: () => void;
  TopRightAction?: React.ReactNode;
  rootClassName?: string;
}

const PopupHeader: FC<IProps> = ({
  icon,
  onClose,
  subtitle,
  title,
  TopRightAction,
    rootClassName
}) => {
  return (
    <div className={cn("row gap-3 mb-1 relative", rootClassName)}>
      <AppIcon
        icon={icon}
        className="size-9 p-2 text-primary rounded bg-primary-lighter"
      />
      <div className="col">
        <AppTypo type="h2" className="font-medium">{title}</AppTypo>
        <AppTypo type="h3" variant="small" color="secondary">
          {subtitle}
        </AppTypo>
      </div>
      <div className="absolute top-0 right-0 row gap-1">
        {TopRightAction}
        <RenderIf isTrue={!!onClose}>
          <AppIconButton icon={sharedIcons.close} onClick={onClose} size="xs" />
        </RenderIf>
      </div>
    </div>
  );
};

export default PopupHeader;
