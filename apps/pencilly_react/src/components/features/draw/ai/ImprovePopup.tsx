import React, { type FC } from "react";

import {
  improveConfig,
  useImproveDraw,
} from "@/components/features/draw/ai/useImproveDraw";
import DynamicButton from "@/components/shared/DynamicButton";
import PromptTextarea from "@/components/shared/PromptTextarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";
import PopupHeader from "@/components/shared/PopupHeader";
import {CreditConfirmationPopover} from "@/components/layout/CreditConfirm";

interface IProps {
  renderTrigger?: (isPending: boolean) => React.ReactNode;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  useSelection?: boolean;
  drawAPI: DrawAPI;
}

const quickPrompts = ["cleaner", "detail", "proportions", "modern"] as const;

const ImprovePopup: FC<IProps> = ({
  drawAPI,
  align,
  side,
  renderTrigger,
  triggerClassName,
  useSelection,
}) => {
  const t = useTranslations("draw_tools");
  const [prompt, setPrompt] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const onClose = () => {
    setOpen(false);
    setPrompt("");
  };

  const { improve, isImproving } = useImproveDraw(
    drawAPI,
    onClose,
    useSelection,
  );

  const defaultTrigger = (
    <DynamicButton
      variant="ghost"
      icon={improveConfig.icon}
      title={t(improveConfig.key)}
      isPending={isImproving}
      className={cn("draw-btn", triggerClassName)}
      element="div"
    />
  );

  const handleQuickPrompt = (qp: string) => {
    setPrompt(qp);
    improve(qp);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        {renderTrigger ? renderTrigger(isImproving) : defaultTrigger}
      </PopoverTrigger>
      <PopoverContent
        className="w-80 col p-3.5 gap-3.5 !shadow-lg"
        align={align}
        side={side}
        sideOffset={8}
      >
          {/* Header */}
          <PopupHeader
            icon={sharedIcons.sparkles}
            title={t("improve_popup.title")}
            subtitle={
              !useSelection
                ? t("improve_popup.description_all")
                : t("improve_popup.description_selected")
            }
            onClose={onClose}
          />

          {/* Quick Prompts */}
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map(qp => (
              <Button
                key={qp}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt(t(`improve_popup.quick_prompts.${qp}`))}
                disabled={isImproving}
                className="capitalize"
              >
                {t(`improve_popup.quick_prompts.${qp}`)}
              </Button>
            ))}
          </div>

          <PromptTextarea
            value={prompt}
            setValue={setPrompt}
            rows={4}
            placeholder={t("improve_popup.placeholder")}
          />
          <CreditConfirmationPopover
            onConfirm={() => improve(prompt)}
            featureName={t(improveConfig.key)}
            storageKey="IMPROVE"
          >
          <Button
            disabled={!prompt.trim() || isImproving}
            isPending={isImproving}
            className="w-full "
            icon={improveConfig.icon}
          >
            {useSelection
              ? t("improve_popup.submit_selected")
              : t("improve_popup.submit_all")}
          </Button>
          </CreditConfirmationPopover>
      </PopoverContent>
    </Popover>
  );
};

export default ImprovePopup;
