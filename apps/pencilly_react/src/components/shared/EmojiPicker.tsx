import { ComponentProps, FC, useState } from "react";

import EmojiPickerReact, { EmojiClickData } from "emoji-picker-react";
import { useTranslations } from "@/i18n";


import AppIconButton from "@/components/ui/custom/app-icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface IProps extends ComponentProps<typeof EmojiPickerReact> {
  onChange: (emoji: string) => void;
  Trigger?: React.ReactNode;
}

const EmojiPicker: FC<IProps> = ({
  onChange,
  reactionsDefaultOpen,
    Trigger,
  ...otherProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("comment");

  const onClick = (data: EmojiClickData) => {
    onChange(data.emoji);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
          {Trigger ? (
            Trigger
          ) : (
        <AppIconButton
          variant={reactionsDefaultOpen ? "outline" : "default"}
          size={reactionsDefaultOpen ? "xs" : "default"}
          title={t("add_emoji")}
          element="div"
          icon="hugeicons:smile"
        />
            )}
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-full max-w-md p-1  z-100",
          reactionsDefaultOpen && "rounded-full",
        )}
      >
        <div className="w-full bg-popover">
          <EmojiPickerReact
            style={{
              backgroundColor: "transparent",
              border: "none",
            }}
            reactionsDefaultOpen={reactionsDefaultOpen}
            onEmojiClick={onClick}
            {...otherProps}
            // skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
