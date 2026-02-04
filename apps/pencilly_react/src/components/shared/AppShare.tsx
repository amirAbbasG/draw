import React, { type ReactNode } from "react";

import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  PinterestIcon,
  PinterestShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  ThreadsIcon,
  ThreadsShareButton,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  XIcon,
} from "react-share";

import AppIconButton from "@/components/ui/custom/app-icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {useTranslations} from "@/i18n";

interface IProps {
  url: string;
  Trigger?: ReactNode;
  triggerProps?: Partial<React.ComponentProps<typeof AppIconButton>>;
  side?: "top" | "right" | "bottom" | "left";
  align?: "center" | "end" | "start";
  media?: string;
  contentOnly?: boolean;
  container?: Element;
}

const social = [
  {
    id: "whatsapp",
    Tag: WhatsappShareButton,
    Icon: WhatsappIcon,
  },
  {
    id: "telegram",
    Tag: TelegramShareButton,
    Icon: TelegramIcon,
  },
  {
    id: "linkedin",
    Tag: LinkedinShareButton,
    Icon: LinkedinIcon,
  },
  {
    id: "facebook",
    Tag: FacebookShareButton,
    Icon: FacebookIcon,
  },
  {
    id: "threads",
    Tag: ThreadsShareButton,
    Icon: ThreadsIcon,
  },
  {
    id: "pinterest",
    Tag: PinterestShareButton,
    Icon: PinterestIcon,
  },
  {
    id: "reddit",
    Tag: RedditShareButton,
    Icon: RedditIcon,
  },
  {
    id: "x",
    Tag: TwitterShareButton,
    Icon: XIcon,
  },
] as const;

const medias = ["pinterest"];

export default function AppShare({
  Trigger,
  url,
  triggerProps,
  align = "center",
  side = "top",
  media,
  contentOnly,
  container,
}: IProps) {
  const t = useTranslations("shared");

  const content = (
    <div className="flex flex-row items-center flex-wrap  gap-3">
      {social
        .filter(i => !medias.includes(i.id) || !!media)
        .map(({ id, Icon, Tag }) => (
          <Tag key={id} url={url} media={media || ""}>
            <Icon
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "4px",
              }}
            />
          </Tag>
        ))}
    </div>
  );

  if (contentOnly) return content;

  return (
    <Popover>
      {/*delete popover button to open popover*/}
      <PopoverTrigger>
        {Trigger ? (
          Trigger
        ) : (
          <AppIconButton
            icon="ic:outline-share"
            element="div"
            title={t("share")}
            {...triggerProps}
          />
        )}
      </PopoverTrigger>

      <PopoverContent
        container={container}
        side={side}
        className="select-none p-2 !px-3"
        align={align}
        sideOffset={5}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
