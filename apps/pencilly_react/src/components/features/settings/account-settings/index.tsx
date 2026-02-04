import React from "react";

import DeleteAccount from "@/components/features/settings/account-settings/DeleteAccount";
import { SettingItem } from "@/components/features/settings/account-settings/SettingItem";
import { useChangeProfileImage } from "@/components/features/settings/account-settings/useChangeProfileImage";
import UserEditForms from "@/components/features/settings/account-settings/UserEditForms";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { sharedIcons } from "@/constants/icons";
import RenderIf from "@/components/shared/RenderIf";
import AppLoading from "@/components/ui/custom/app-loading";
import {useUser} from "@/stores/context/user";

const AccountSettings = () => {
  const { user } = useUser();

  const { openUpload, uploadInputRef, handleFileChange, isPending } =
    useChangeProfileImage();


  return (
    <div className=" col gap-5 relative">
      {/*<div className="absolute -top-2 -end-2">*/}
      {/*  <LanguageSelect />*/}
      {/*</div>*/}
      <SettingItem>
        <div className="w-full row gap-3">
          <UserAvatar
            className=" relative size-12 sm:size-16  overflow-visible  border-primary border-2"
            imageSrc={user?.profile_image_url}
            name={user?.username}
          >
              <RenderIf isTrue={isPending}>
                  <AppLoading rootClass="center-position" svgClass="text-primary-lighter"/>
              </RenderIf>
            <AppIconButton
              size="xs"
              icon={sharedIcons.edit}
              disabled={isPending}
              className=" absolute bg-muted-dark border -bottom-1 -right-1 flex justify-center items-center px-2  h-6 w-6 "
              onClick={openUpload}
            />
            <input
              type="file"
              hidden
              ref={uploadInputRef}
              onChange={handleFileChange}
            />
          </UserAvatar>

          <div className="col gap-1 ">
            <AppTypo>@{user?.username}</AppTypo>
            <AppTypo variant="small" className="text-foreground-light">
              {user?.email}
            </AppTypo>
          </div>
        </div>
      </SettingItem>

      <UserEditForms
        firstName={user?.first_name || ""}
        lastName={user?.last_name || ""}
      />

      <div className="mt-auto">
        <DeleteAccount />
      </div>
    </div>
  );
};

export default AccountSettings;
