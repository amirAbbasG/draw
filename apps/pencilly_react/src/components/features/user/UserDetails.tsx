import React, { type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";
import { User, useUserBalance } from "@/services/user";
import AppIcon from "@/components/ui/custom/app-icon";
import {sharedIcons} from "@/constants/icons";

interface IProps extends React.ComponentProps<"div"> {
  user: User;
}

const UserDetails: FC<IProps> = ({ user, className, ...otherProps }) => {
  const { data } = useUserBalance();
  const t = useTranslations("user");

  return (
    <>
      <div
        className={cn("row gap-3   p-2 pb-3 border-b", className)}
        {...otherProps}
      >
        <UserAvatar
          className="size-12 border"
          imageSrc={user.profile_image_url}
          name={user.username}
        />
        <div className="col flex-1 gap-1 max-w-full overflow-hidden">
          <AppTypo className="truncate max-w-full">
            {user.first_name
              ? `${user.first_name} ${user.last_name || ""}`
              : user.username}
          </AppTypo>

          <AppTypo variant="small" color="secondary">
            {user.email}
          </AppTypo>
        </div>
      </div>
      <div className="row gap-2 mb-1  p-2 border-b">
          <AppIcon icon={sharedIcons.credit}   className="size-4"/>
        <AppTypo>{t("credit_balance")}</AppTypo>
        <AppTypo color="secondary" className="ms-auto">
          {data?.credit_amount || user?.balance?.amount || 0}$
        </AppTypo>
      </div>
    </>
  );
};

export default UserDetails;
