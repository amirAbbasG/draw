import React, { type FC } from "react";

import DynamicButton from "@/components/shared/DynamicButton";
import RenderIf from "@/components/shared/RenderIf";
import { Badge } from "@/components/ui/badge";
import AppIcon from "@/components/ui/custom/app-icon";
import { AppTooltip } from "@/components/ui/custom/app-tooltip";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  onClick?: () => void;
  isCollaborating: boolean;
  collabErrorMessage: string;
  isExporting: boolean;
  collaborators: CollabAPI["collaborators"];
}

const ShareTrigger: FC<IProps> = ({
  isCollaborating,
  onClick,
  collabErrorMessage,
  isExporting,
    collaborators
}) => {
  const t = useTranslations("share");

  const otherCollaboratorsCount = Array.from(collaborators.values()).filter(user => !user.isCurrentUser).length;

  return (
    <DynamicButton
      icon={sharedIcons.share}
      title={t("title")}
      className=" relative draw-btn"
      onClick={onClick}
      variant="ghost"
      isPending={isExporting}
      selected={isCollaborating && !collabErrorMessage}
    >
      <RenderIf isTrue={isCollaborating && !collabErrorMessage}>
        <Badge className="absolute bottom-0 end-0 translate-x-1/4 translate-y-1/4  p-[1px] aspect-square text-center centered-col">
          <span className="size-3 text-[8px] text-center">
          {otherCollaboratorsCount}
          </span>
        </Badge>
      </RenderIf>

      <RenderIf isTrue={!!collabErrorMessage}>
        <AppTooltip title={collabErrorMessage} asChild>
          <Badge className="absolute bottom-0 end-0 translate-x-1/4 translate-y-1/4  p-[1px] aspect-square text-center bg-danger-lighter hover:bg-danger-lighter">
            <AppIcon
              icon={sharedIcons.error}
              className="size-3 text-danger "
            />
          </Badge>
        </AppTooltip>
      </RenderIf>
    </DynamicButton>
  );
};

export default ShareTrigger;
