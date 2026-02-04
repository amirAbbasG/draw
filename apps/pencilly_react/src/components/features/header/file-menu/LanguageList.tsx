import React, { useState, useTransition } from "react";

import RenderIf from "@/components/shared/RenderIf";
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import {
  languages,
  setLocale,
  useLocale,
  useTranslations,
  type Language,
} from "@/i18n";

const LanguageList = () => {
  const locale = useLocale();
  const t = useTranslations("header");

  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const onChange = (language: Language) => {
    startTransition(async () => {
      await setLocale(language);
    });
  };

  const showSearch = languages?.length > 10;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        icon={sharedIcons.language}
        className={isPending ? "opacity-50 pointer-events-none" : ""}
      >
        {t("language")}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent
        sideOffset={7}
        className="w-48 col gap-1 pt-0 max-h-[50dvh] overflow-y-auto"
      >
        <RenderIf isTrue={showSearch}>
          <div className="z-10 sticky top-0  bg-popover pt-1 ">
            <Input
              className="w-full pe-8 bg-background"
              onKeyDown={e => {
                e.stopPropagation();
              }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("search_language")}
              icon={sharedIcons.search}
            />
          </div>
        </RenderIf>
        {languages.map(lang => (
          <DropdownMenuItem
            onClick={() => onChange(lang)}
            selected={locale === lang.code}
            key={`language-${lang.code}`}
            className={cn(
              "text-sm",
              lang.label.toLowerCase().includes(search.toLowerCase())
                ? "flex"
                : "hidden",
            )}
          >
            <div className="col gap-1 ">
              <span>{lang.title}</span>
              <span className="text-muted-foreground">{lang.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};

export default LanguageList;
