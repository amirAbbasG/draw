import React, { useRef, type FC } from "react";

import OptionDescription from "@/components/forms/OptionDescription";
import CopyButton from "@/components/shared/CopyButton";
import RenderIf from "@/components/shared/RenderIf";
import SpeechToText from "@/components/shared/SpeechToText";
import TextToSpeech from "@/components/shared/TextToSpeech";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { promptVariant } from "@/components/ui/variants";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  value: string;
  setValue: (val: string) => void;
  placeholder?: string;
  Footer?: React.ReactNode;
  title?: string;
  description?: string;
  rows?: number;
  rootClassName?: string;
  textAreaClassName?: string;
}

const PromptTextarea: FC<IProps> = ({
  setValue,
  value,
  placeholder,
  Footer,
  title,
  description,
  rows = 7,
  rootClassName,
  textAreaClassName,
}) => {
  const t = useTranslations("prompt_textarea");

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className={cn("col", rootClassName)}>
      <AppTypo type="label" className="mb-label-space row gap-1">
        {title || t("title")}
        <RenderIf isTrue={!!description}>
          <OptionDescription text={description} />
        </RenderIf>
      </AppTypo>

      <div className="relative w-full h-fit group ">
        <SpeechToText
          className="absolute start-1.5 top-2"
          size="xs"
          transcript={value}
          setTranscript={val => setValue(value ? value + " " + val : value)}
        />

        <textarea
          placeholder={placeholder || t("placeholder")}
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={rows}
          ref={textAreaRef}
          className={cn(
            "w-full !pb-8 !pe-2.5 !pt-2  !ps-8 !rounded-[8px]  focus-visible:ring-0 focus-visible:outline-none",
            promptVariant({ variant: "prompt", color: "input" }),
            textAreaClassName,
          )}
        />

        <div className="absolute bottom-2 justify-end bg-background-light group-focus-within:bg-background-lighter  pb-0.5 inset-x-2.5 flex   gap-0.5 ">
          <RenderIf isTrue={!!value.trim().length}>
            <AppIconButton
              icon={sharedIcons.delete}
              size="xs"
              title={t("clear_text")}
              onClick={() => setValue("")}
            />
            <TextToSpeech text={value} size="xs" />
            <CopyButton text={value} size="xs" />
          </RenderIf>
        </div>
      </div>

      <div className="spacing-row -mt-1">
        <AppTypo
          variant="small"
          color={(value.length || 0) > 4000 ? "danger" : "secondary"}
        >
          {value.length || 0}/4000
        </AppTypo>
        {Footer}
      </div>
    </div>
  );
};

export default PromptTextarea;
