import React, { useState, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import PopupHeader from "@/components/shared/PopupHeader";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import {useSearchUser} from "@/components/features/meet/hooks/useSearchUser";
import {MeetUser} from "@/components/features/meet/types";
import RenderIf from "@/components/shared/RenderIf";
import AppLoading from "@/components/ui/custom/app-loading";
import {DotLoading} from "@/components/features/meet/chat/TypingIndicator";
import {useDebounceEffect} from "@/hooks/useDebounceEffect";

interface AddUserPopupProps {
  onInvite: (user: MeetUser) => void;
  className?: string;
  children?: React.ReactNode;
  triggerProps?: Omit<
    React.ComponentProps<typeof AppIconButton>,
    "icon" | "title" | "element"
  >;
}

const AddUserPopup: FC<AddUserPopupProps> = ({
  onInvite,
  className,
  children,
  triggerProps,
}) => {
  const t = useTranslations("meet.call");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("")
  const {
    data,
    isLoading,
      setQ
  } = useSearchUser()

  useDebounceEffect(() => {
    setQ(search)
  }, search, 300)



  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        {children ?? (
          <AppIconButton
            icon={sharedIcons.user_add}
            title={t("add_user")}
            element="div"
            className={cn("", triggerProps?.className)}
            {...(triggerProps ?? {})}
          />
        )}
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-72 p-3.5 col gap-2 z-100", className)}
        sideOffset={10}
      >
        {/* Header */}
        <PopupHeader
          title={t("add_user")}
          icon={sharedIcons.user_add}
          subtitle={t("add_user_desc")}
          onClose={() => setIsOpen(false)}
        />

        <AppTypo>{t("email_invite")}</AppTypo>
        <Input
          placeholder={t("email_invite_placeholder")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.stopPropagation()}
          onKeyUp={e => e.stopPropagation()}
          className="h-8 text-xs"
          type="email"
        />

        <RenderIf isTrue={isLoading}>
          <DotLoading className="mx-auto"/>
        </RenderIf>

        <div className="max-h-48 overflow-y-auto mb-1.5">
          {
            data?.map(user => (
              <button
                key={user.id}
                type="button"
                className="row border rounded gap-2 w-full p-2 hover:bg-muted transition-colors text-start"
                onClick={() => {
                  onInvite?.({
                    isCurrentUser: false,
                    id: String(user.id),
                    username: user.username,
                    convesation_id: null,
                    commen_convesations: [],
                    name: user.username,
                    avatarUrl: user.profile_image_url
                  });
                    setIsOpen(false)
                }}
              >
                <UserAvatar
                  imageSrc={user.profile_image_url}
                  name={user.username}
                  className="size-7 text-xs shrink-0"
                />
                <div className="col">
                <AppTypo variant="small" className="truncate flex-1">
                  {user.email}
                </AppTypo>
                  <AppTypo variant="small" color="secondary" className="truncate flex-1">
                  {user.username}
                </AppTypo>

                </div>
                {/*<AppIcon*/}
                {/*  icon={sharedIcons.plus}*/}
                {/*  className="size-4 text-primary shrink-0"*/}
                {/*/>*/}
              </button>
            ))
          }
        </div>

      </PopoverContent>
    </Popover>
  );
};

export default AddUserPopup;
