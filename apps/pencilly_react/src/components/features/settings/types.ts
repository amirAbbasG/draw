

export type SettingMenu = "account" | "subscription" | "referral" | "theme" | "about" | "subscription_history";

export interface SettingMenuItem {
  id: string;
  Icon: string;
  key: SettingMenu;
    needsAuth?: boolean;
}

export interface ChangePasswordData {
  new_password: string;
  old_password: string;
  confirm_password: string;
}
