import React from "react";

import AppIcon from "@/components/ui/custom/app-icon";
import { AppTooltip } from "@/components/ui/custom/app-tooltip";
import { cn } from "@/lib/utils";

import { UserAvatar } from "./UserAvatar";

interface IProps {
  planTitle?: string;
  profile_image: string;
  username: string;
  total_credit?: number;
}

export default function UserHoverDetail({
  profile_image,
  username,
  total_credit,
  planTitle,
}: IProps) {
  const useInfoTextClass =
    "capitalize text-small font-normal overflow-hidden text-ellipsis whitespace-nowrap ";
  return (
    <div className="spacing-row border-b p-2 mb-2">
      <div className="centered-row gap-2  ">
        <div>
          <UserAvatar imageSrc={profile_image} name={username} />
        </div>

        <div className="gap-1 col">
          <AppTooltip title={username ?? ""}>
            <p className={`${useInfoTextClass} whitespace-pre-wrap text-base`}>
              {username.substring(0, 8)}...
            </p>
          </AppTooltip>

          {total_credit && planTitle && (
            <div className="row gap-4">
              <div
                className={cn(
                  useInfoTextClass,
                  "text-foreground-light w-auto row gap-1",
                  total_credit.toString().length > 4 && "pr-1",
                )}
              >
                <AppIcon icon="tabler:coins" width={14} />
                {total_credit}
              </div>

              <div className="row gap-1 h-fit py-0.5 px-2 text-sm  bg-success-lighter text-success  rounded-md ">
                {planTitle}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
