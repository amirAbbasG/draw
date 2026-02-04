import React, {type FC, useEffect, useRef} from "react";

import ActionMenu from "@/components/features/draw/pagination/ActionMenu";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  paginationAPI: PaginationAPI
  triggerVariant?: "default" | "ghost" | "outline"
  triggerClassName?: string;
  open?:boolean
  setOpen?: (val: boolean) => void
}

const PaginationPopup: FC<IProps> = ({ paginationAPI, triggerClassName, open, setOpen, triggerVariant }) => {
  const t = useTranslations("pagination");
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    actionHandlers,
    handleAddPage,
    handleSaveRename,
    pages,
    activePage,
    editingPage,
    setActivePage,
    editValue,
    setEditValue,
  } = paginationAPI;

  useEffect(() => {
    if (!!editingPage) {
      setTimeout(() => {
        inputRef.current.focus()
      }, 50)
    }
  }, [editingPage]);


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger onClick={e => e.stopPropagation()}>
        <AppIconButton
          icon="hugeicons:left-to-right-list-bullet"
          element="div"
          title={t("pages")}
          variant={triggerVariant}
          className={cn("", triggerClassName)}
        />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 top-z" align="start">
        {/* Header */}
        <div className="spacing-row border-b px-3 py-2.5">
          <div className="row gap-1 text-sm font-medium">
            <AppIcon icon={sharedIcons.chevron_right} className="size-4" />
            <AppTypo className="pb-0.5">{t("pages")}</AppTypo>
          </div>
          <div className="flex items-center gap-1">
            <AppIconButton
              icon={sharedIcons.plus}
              title={t("add_page")}
              onClick={handleAddPage}
              size="xs"
            />
          </div>
        </div>

        {/* Pages List */}
        <div className="max-h-64 col gap-1 overflow-y-auto p-1">
          {pages.map(page => (
            <div
              key={page.id}
              className={cn(
                "group spacing-row border rounded-md px-2 py-0.5 h-8 transition-colors cursor-pointer font-sans text-base font-normal",
                activePage === page.id
                  ? "bg-primary-lighter border-primary"
                  : "hover:!bg-background border-transparent",
              )}
              onClick={() => setActivePage(page.id)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 h-full">
                <span
                  className={cn(
                    "w-4 h-4 flex items-center justify-center",
                    activePage !== page.id && "invisible",
                  )}
                >
                  <AppIcon icon={sharedIcons.check} className="h-3.5 w-3.5" />
                </span>
                {editingPage === page.id ? (
                  <input
                    ref={inputRef}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={() => handleSaveRename(page.id)}
                    onKeyDown={e =>
                      e.key === "Enter" && handleSaveRename(page.id)
                    }
                    className="flex-1 bg-transparent text-sm rounded-md outline-none ring-0 !border h-full ring-ring  px-1"
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate text-sm text-foreground">
                    {page.name}
                  </span>
                )}
              </div>
              <ActionMenu actionHandlers={actionHandlers} pageId={page.id} />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PaginationPopup;
