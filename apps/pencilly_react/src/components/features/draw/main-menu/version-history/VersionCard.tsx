import React, { type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppTypo from "@/components/ui/custom/app-typo";
import { timePassedSince } from "@/lib/date-transform";
import { cn } from "@/lib/utils";
import { User } from "@/services/user";

interface IProps {
  user: User;
  createdAt: string;
  onClick: () => void;
  isActive: boolean;
}

const VersionCard: FC<IProps> = ({ createdAt, isActive, onClick, user }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "border rounded p-2 row gap-2 cursor-pointer hover:bg-background-light  transition-all duration-200",
        isActive && "border-primary bg-primary-lighter",
      )}
    >
      <UserAvatar
        imageSrc={user?.profile_image_url}
        name={user?.username}
        className="size-9"
      />
      <div className="col gap-0.5">
        <AppTypo variant="small">
          {user?.first_name
            ? `${user?.first_name} ${user?.last_name}`
            : user?.username}
        </AppTypo>
        <AppTypo variant="small" color="secondary">
          {timePassedSince(createdAt)}
        </AppTypo>
      </div>
    </div>
  );
};

export default VersionCard;
