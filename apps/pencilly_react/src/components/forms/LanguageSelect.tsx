import React, { useState } from "react";

import RenderIf from "@/components/shared/RenderIf";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { appLanguages } from "@/constants/languages";
import {useTranslations} from "@/i18n";

export interface Language {
  key: string;
  title: string;
  titleTranslate: string;
}

interface IPops {
  value: string;
  onChange: (value: string) => void;
  languages?: Language[];
  isPending?: boolean;
  container?: Element;
  portal?: boolean;
  label?: boolean;
}

const LanguageSelect = ({
  onChange,
  value,
  languages = appLanguages,
  isPending,
  container,
  portal,
  label = true,
}: IPops) => {
  const t = useTranslations("language");
  const [search, setSearch] = useState("");

  const showSearch = languages?.length > 10;

  return (
    <div className="col gap-label-space w-full">
      <RenderIf isTrue={label}>
        <AppTypo type="label">{t("language")}</AppTypo>
      </RenderIf>
      <Select
        value={value}
        onValueChange={onChange}
        onOpenChange={() => setSearch("")}
        disabled={isPending}
      >
        <SelectTrigger>
          {languages.find(item => item.key === value)?.titleTranslate ||
            t("select_language")}
        </SelectTrigger>
        <SelectContent
          viewportClassName="!pt-0"
          hideScrollButtons
          container={container}
          portal={portal}
          onKeyDown={e => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <SelectGroup>
            <RenderIf isTrue={showSearch}>
              <div className="z-10 sticky top-0  bg-popover p-1">
                <Input
                  className="w-full pe-8 bg-background"
                  onKeyDown={e => {
                    e.stopPropagation();
                  }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`${t("search")}...`}
                  icon={sharedIcons.search}
                />
              </div>
            </RenderIf>
            {languages.map(({ key, title, titleTranslate }) => (
              <SelectItem
                value={key}
                key={`language-${key}`}
                className={cn(
                  "text-sm",
                  title.toLowerCase().includes(search.toLowerCase())
                    ? "flex"
                    : "hidden",
                )}
              >
                <div className="col gap-1 px-2">
                  <span>{title}</span>
                  <span className="text-muted-foreground">
                    {titleTranslate}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelect;
