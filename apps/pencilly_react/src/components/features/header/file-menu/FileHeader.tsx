import React, { useRef, useState } from "react";

import { useTranslations } from "@/i18n";

import { useShallow } from "zustand/react/shallow";

import AppIconButton from "@/components/ui/custom/app-icon-button";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/zustand/ui/ui-store";
import { sharedIcons } from "@/constants/icons";

const FileHeader = () => {
  const t = useTranslations("header");
  const currentTitle = useUiStore(useShallow(state => state.title));
  const [title, setTitle] = useState(currentTitle || "");
  const [isEditTitle, setIsEditTitle] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const onBlurTitle = () => {
    setTitle(title);
    setIsEditTitle(false);
  };

  return (
    <div className="col gap-1 px-1.5 pb-1 pt-1.5 w-full">
      <div className="row gap-2 h-6">
        <input
          ref={ref}
          className={cn(
            "bg-transparent outline-none focus-within:outline-none ring-0 text-sm flex-1 py-0.5",
            isEditTitle
              ? "border rounded-md border-primary px-1 "
              : "select-none",
          )}
          placeholder={t("untitled")}
          value={!isEditTitle && !title ? t("untitled") : title}
          onChange={e => setTitle(e.target.value)}
          readOnly={!isEditTitle}
          onBlur={onBlurTitle}
          onKeyDown={e => e.stopPropagation()}
          onKeyUp={e => e.stopPropagation()}
        />
        <AppIconButton
          icon={isEditTitle ? sharedIcons.check_square : sharedIcons.edit}
          size="xs"
          onClick={() => {
            if (isEditTitle) {
              onBlurTitle();
            } else {
              setIsEditTitle(true);
              ref.current?.focus();
            }
          }}
        />
      </div>
    </div>
  );
};

export default FileHeader;
