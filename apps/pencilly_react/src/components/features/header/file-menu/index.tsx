import React, { type FC } from "react";

import FileHeader from "@/components/features/header/file-menu/FileHeader";
import LanguageList from "@/components/features/header/file-menu/LanguageList";
import { MenuItem } from "@/components/features/header/file-menu/MenuItem";
import {
  actions,
  useFileActions,
} from "@/components/features/header/file-menu/useFileActions";
import ThemeSelect from "@/components/features/header/ThemeSelect";
import ConfirmAlert from "@/components/shared/ConfirmAlert";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCheckIsAuth } from "@/hooks/useCheckIsAuth";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  drawAPI: DrawAPI;
}

const FileMenu: FC<IProps> = ({ drawAPI }) => {
  const t = useTranslations("header");
  const { isAuth, goAuth } = useCheckIsAuth();

  const { handlers, selected, isOpenRestAlert, setIsOpenRestAlert, restDraw } =
    useFileActions(drawAPI);

  return (
    <>
      <div className="row gap-2 me-auto ">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Menu"
              variant="outline"
              className=" !px-2 gap-0 data-[state=open]:!bg-primary-lighter    focus-visible:!outline-none font-medium  !h-8 select-none"
            >
              <span className="max-sm:hidden">{t("file")}</span>
              <AppIcon
                icon={sharedIcons.menu}
                width={16}
                height={16}
                className="sm:hidden"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-52 top-z col gap-0.5 "
            align="start"
          >
            <FileHeader />
            <DropdownMenuSeparator />
            {actions.map(item => (
              <MenuItem
                key={item.id}
                onClick={isAuth || !item.needAuth ? handlers[item.id] : goAuth}
                icon={item.icon}
                title={t(item.id)}
                divider={item.divider}
                selected={
                  (!item.needAuth || isAuth) &&
                  item.id in selected &&
                  !!selected[item.id as keyof typeof selected]
                }
              />
            ))}

            <ThemeSelect isSub />
            <LanguageList />
          </DropdownMenuContent>
        </DropdownMenu>
        {/*<ShareTrigger*/}
        {/*  isCollaborating={collabAPI.isCollaborating}*/}
        {/*  onClick={handlers.share}*/}
        {/*  collabErrorMessage={collabAPI.collabErrorMessage}*/}
        {/*  isExporting={isExporting}*/}
        {/*  collaborators={collabAPI.collaborators}*/}
        {/*/>*/}
      </div>
      <ConfirmAlert
        title={t("new_draw")}
        btnTitle={t("save")}
        message={t("new_draw_alert")}
        setOpen={setIsOpenRestAlert}
        open={isOpenRestAlert}
        onAccept={() => restDraw(true)}
        Action={
          <Button color="danger" onClick={() => restDraw(false)}>
            {t("dont_save")}
          </Button>
        }
      />
    </>
  );
};

export default FileMenu;
