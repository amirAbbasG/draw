import React, { type FC } from "react";

import { useTranslations } from "@/i18n";
import { Controller } from "react-hook-form";

import ChangeName from "@/components/features/settings/account-settings/ChangeName";
import ChangePasswordInput from "@/components/features/settings/account-settings/ChangePasswordInput";
import { SettingItem } from "@/components/features/settings/account-settings/SettingItem";
import { useChangePassword } from "@/components/features/settings/account-settings/useChangePassword";
import { useEditUserData } from "@/components/features/settings/account-settings/useEditUserData";
import { Button } from "@/components/ui/button";
import AppTypo from "@/components/ui/custom/app-typo";

interface IProps {
  firstName: string;
  lastName: string;
}

const UserEditForms: FC<IProps> = ({ firstName, lastName }) => {
  const t = useTranslations("settings");
  const { editUserData, isPendingEdit } = useEditUserData();

  const { passData, changePassword, control, formState } = useChangePassword();

  const names = {
    first_name: firstName,
    last_name: lastName,
  };

  return (
    <div className="col gap-5">
      <SettingItem title={t("user_info")}>
        <div className="w-full flex-col flex gap-4  lg:flex-row">
          {(["first_name", "last_name"] as const).map(item => (
            <div
              key={item}
              className="flex w-full flex-col text-text-foreground gap-label-space lg:w-1/2"
            >
              <AppTypo variant="small" className="ml-1 text-sm">
                {t(item)} :
              </AppTypo>
              <div>
                <ChangeName
                  value={names[item]}
                  isPending={isPendingEdit}
                  placeholder={
                    item === "first_name"
                      ? t("change_firstname_title")
                      : t("change_lastname_title")
                  }
                  handleSubmit={value =>
                    editUserData({
                      [item]: value,
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </SettingItem>
      <SettingItem title={t("account_privacy")}>
        <form onSubmit={changePassword} className="col gap-4">
          <Controller
            control={control}
            name="old_password"
            render={({ field }) => (
              <ChangePasswordInput
                {...field}
                label={t("old_password")}
                placeholder={t("change_password_placeholder")}
              />
            )}
          />
          <Controller
            control={control}
            name="new_password"
            render={({ field }) => (
              <ChangePasswordInput
                {...field}
                label={t("new_password")}
                placeholder={t("change_password_placeholder")}
              />
            )}
          />
          <Controller
            control={control}
            name="confirm_password"
            render={({ field }) => (
              <ChangePasswordInput
                {...field}
                label={t("confirm_password")}
                placeholder={t("change_password_placeholder")}
              />
            )}
          />
          <Button
            disabled={
              !passData.confirm_password ||
              !passData.new_password ||
              !passData.old_password ||
              formState.isSubmitting
            }
            isPending={formState.isSubmitting}
            type="submit"
            className="w-fit"
          >
            {t("change_password")}
          </Button>
        </form>
      </SettingItem>
    </div>
  );
};

export default UserEditForms;
