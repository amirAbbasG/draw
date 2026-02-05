import About from "@/components/features/settings/about";
import AccountSettings from "@/components/features/settings/account-settings";
import Preferences from "@/components/features/settings/preferences";
import Referral from "@/components/features/settings/referral";
import Subscriptions from "@/components/features/settings/subscriptions";
import SubscriptionHistory from "@/components/features/settings/subscriptions/SubscriptionHistory";
import Theme from "@/components/features/settings/theme";
import {
  SettingMenu,
  SettingMenuItem,
} from "@/components/features/settings/types";
import { sharedIcons } from "@/constants/icons";

// import About from "@/components/features/settings/about";

export const settingsMenuItems: SettingMenuItem[] = [
  {
    id: "setting-item-1",
    Icon: sharedIcons.settings,
    key: "account",
    needsAuth: true,
  },
  {
    id: "setting-item-4",
    Icon: "hugeicons:credit-card",
    key: "subscription",
    needsAuth: true,
  },
  // {
  //   id: "setting-item-5",
  //   Icon: "hugeicons:gift",
  //   key: "referral",
  // },
  {
    id: "setting-item-6",
    Icon: sharedIcons.light,
    key: "theme",
  },
  {
    id: "setting-item-8",
    Icon: "hugeicons:toggle-on",
    key: "preferences",
  },
  {
    id: "setting-item-7",
    Icon: "hugeicons:information-circle",
    key: "about",
  },
] as const;

export const menuComponents = {
  account: AccountSettings,
  subscription: Subscriptions,
  referral: Referral,
  theme: Theme,
  preferences: Preferences,
  about: About,
  subscription_history: SubscriptionHistory,
};

export const itemParent: Record<string, SettingMenu> = {
  subscription_history: "subscription",
};
