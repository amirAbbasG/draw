import React, {useEffect, useRef, type FC, useState} from "react";

import ActionMenu from "@/components/features/draw/pagination/ActionMenu";
import PaginationPopup from "@/components/features/draw/pagination/PaginationPopup";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  paginationAPI?: PaginationAPI;
}

const DesktopPagination: FC<IProps> = ({ paginationAPI }) => {
  const t = useTranslations("pagination");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpenPopup, setIsOpenPopup] = useState(false)

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
    if (!!editingPage && !isOpenPopup) {
      setTimeout(() => {
        inputRef.current.focus()
      }, 50)
    }
  }, [editingPage, isOpenPopup]);

  return (
    <div className="h-8 4xl:h-9 w-full rounded  row gap-2 max-w-full overflow-x-auto hidden-scrollbar">
      <PaginationPopup
        paginationAPI={paginationAPI}
        triggerClassName="bg-muted"
        open={isOpenPopup}
        setOpen={setIsOpenPopup}
      />
      {pages.map(page => (
        <div
          key={page.id}
          className={cn(
            "row  border bg-muted rounded-md relative h-full p-1 transition-colors cursor-pointer row gap-2 ",
            activePage === page.id
              ? "bg-primary-lighter border-primary"
              : "hover:!bg-background border-transparent",
          )}
          onClick={() => setActivePage(page.id)}
        >
          {(editingPage === page.id && !isOpenPopup) ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={() => handleSaveRename(page.id)}
              onKeyDown={e => e.key === "Enter" && handleSaveRename(page.id)}
              className="flex-1 !bg-transparent h-full text-sm
               outline-none  ring-0  rounded-sm !px-1 max-h-full max-w-28"
              style={{ width: `${editValue.length + 1}ch` }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="truncate text-sm text-foreground px-1 border border-transparent">
              {page.name}
            </span>
          )}

          <ActionMenu actionHandlers={actionHandlers} pageId={page.id} />
        </div>
      ))}
      <AppIconButton
        icon={sharedIcons.plus}
        title={t("add_page")}
        onClick={handleAddPage}
        size="sm"
      />
    </div>
  );
};

export default DesktopPagination;
