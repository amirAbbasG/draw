

export type SettingMenu = "account" | "subscription" | "referral" | "about" | "subscription_history" | "preferences";

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
