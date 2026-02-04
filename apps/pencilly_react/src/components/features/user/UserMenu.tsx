import React from "react";

import { Link } from "react-router";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import UserDetails from "@/components/features/user/UserDetails";
import { UserMenuItem } from "@/components/features/user/UserMenuItem";
import ConfirmAlert from "@/components/shared/ConfirmAlert";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useUser } from "@/stores/context/user";
import { setIsAuthPopupOpen } from "@/stores/zustand/ui/actions";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";
import { useLogout } from "@/services/user";
import {Skeleton} from "@/components/ui/skeleton";

const routes = ["pricing", "settings"] as const;

function UserMenu() {
  const { user, isLoading } = useUser();
  const { mutateAsync: logout, isPending } = useLogout();
  const t = useTranslations("user");

  if (isLoading && !user) {
    return  (
        <Skeleton className="w-8 h-8 rounded-full"/>
    )
  }

  if (!user) {
    return (
      <Button variant="gradiant" onClick={() => setIsAuthPopupOpen(true)}>
        {t("login")}
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger>
        <UserAvatar
          imageSrc={user?.profile_image_url}
          name={
            user.first_name
              ? `${user.first_name} ${user.last_name}`
              : user?.username
          }
          className="w-8 h-8 rounded-full cursor-pointer"
        />
      </PopoverTrigger>
      <PopoverContent
        className={cn("col w-64 p-1 mr-1  text-start ")}
        align="start"
        side="bottom"
      >
        <UserDetails user={user} />

        {routes.map(item => (
          <Link to={`/${item}`} key={item}>
            <UserMenuItem title={t(item)} icon={sharedIcons[item]} />
          </Link>
        ))}

        <a
          target="_blank"
          href="https://discord.gg/KrFTV64NvS"
          rel="noreferrer"
        >
          <UserMenuItem title={t("community")} icon="ph:discord-logo" />
        </a>

        <ConfirmAlert
          title={t("logout")}
          message={t("logout_message")}
          loading={isPending}
          onAccept={logout}
          btnTitle={t("logout")}
        >
          <UserMenuItem
            closeOnClick={false}
            title={t("logout")}
            icon="tabler:logout-2"
          />
        </ConfirmAlert>
      </PopoverContent>
    </Popover>
  );
}

export default UserMenu;
