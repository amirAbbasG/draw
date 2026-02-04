import React from "react";

import { useTranslations } from "@/i18n";

import { SettingItem } from "@/components/features/settings/account-settings/SettingItem";
import DeleteAlertDialog from "@/components/shared/DeleteAlertDialog";
import AppTypo from "@/components/ui/custom/app-typo";
import { useDeleteAccount } from "@/services/user";

const DeleteAccount = () => {
  const t = useTranslations("settings");
  const { deleteAccount } = useDeleteAccount();

  return (
    <SettingItem title={t("danger")}>
      <div className="spacing-row gap-4">
        <AppTypo variant="small">{t("delete_account_message")}</AppTypo>
        <DeleteAlertDialog
          title={t("delete_account_alert_title")}
          description={t("delete_account_alert_message")}
          handleSubmit={() => deleteAccount()}
        />
      </div>
    </SettingItem>
  );
};

export default DeleteAccount;
