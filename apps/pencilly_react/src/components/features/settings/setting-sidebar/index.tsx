
import React, {type FC, useEffect} from "react";



import { useTranslations } from "@/i18n";
import { useMediaQuery } from "usehooks-ts";



import { settingsMenuItems } from "@/components/features/settings/constants";
import SidebarMenuItem from "@/components/features/settings/setting-sidebar/SidebarMenuItem";
import { SettingMenu } from "@/components/features/settings/types";
import Confirm from "@/components/shared/ConfirmAlert";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import { useCheckIsAuth } from "@/hooks/useCheckIsAuth";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";





interface IProps {
  currentMenu: SettingMenu;
  changeMenu: (menu: SettingMenu) => void;
  isOpen: boolean;
}

const SettingSidebar: FC<IProps> = ({ changeMenu, currentMenu, isOpen }) => {
  const t = useTranslations("settings");
  const isSm = useMediaQuery("(max-width: 640px)");
  const { isAuth } = useCheckIsAuth();

  const filteredMenuItems = settingsMenuItems.filter(
    item => !item.needsAuth || isAuth
  );

  useEffect(() => {
    if (!filteredMenuItems.find(item => item.key === currentMenu)) {
      changeMenu(filteredMenuItems[0].key);
    }
  }, [filteredMenuItems]);

  return (
    <aside
      className={cn(
        "h-full col gap-2 w-full sm:w-fit",
        isOpen && "max-sm:hidden",
      )}
    >
      {filteredMenuItems.map(item => (
        <SidebarMenuItem
          key={item.id}
          item={item}
          changeMenu={changeMenu}
          isActive={currentMenu === item.key && (!isSm || isOpen)}
        />
      ))}
      <div className="sticky bottom-0 mt-auto pt-4 border-t">
        <Confirm
          title={t("logout")}
          btnTitle={t("logout")}
          message={t("logout_Message")}
          onAccept={() => {}}
        >
          <Button
            variant="text"
            color="danger"
            className=" w-full !bg-danger-lighter"
          >
            <div className="row gap-2 w-full">
              <AppIcon icon={sharedIcons.logout} width={14} height={14} />
              {t("logout")}
            </div>
          </Button>
        </Confirm>
      </div>
    </aside>
  );
};

export default SettingSidebar;
