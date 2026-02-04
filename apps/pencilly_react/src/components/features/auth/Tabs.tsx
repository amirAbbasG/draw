import React from "react";

import AppTabs from "@/components/ui/custom/app-tabs";
import { useTranslations } from "@/i18n";

const authTabs = [
  {
    tabKey: "signin",
    icon: "material-symbols:login",
  },
  {
    tabKey: "signup",
    icon: "ic:outline-person-add",
  },
] as const;

export type AuthPages = "signin" | "signup" | "forgot_pass";

interface IProps {
  setCurrentTab: (val: AuthPages) => void;
  currentTab: AuthPages;
}

function AuthTabs({ currentTab, setCurrentTab }: IProps) {
  const t = useTranslations("auth.tabs");

  return (
    <AppTabs
      // className="-mt-4"
      tabs={authTabs.map(item => ({
        ...item,
        title: t(item.tabKey),
      }))}
      activeTab={currentTab}
      onTabChange={val => setCurrentTab(val as AuthPages)}
    />
  );
}

export default AuthTabs;
