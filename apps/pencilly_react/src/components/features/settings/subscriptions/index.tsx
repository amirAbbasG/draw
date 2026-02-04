import React from "react";

import { useTranslations } from "@/i18n";

import PlanProgresses from "@/components/features/settings/subscriptions/PlanProgresses";
import UpgradeBanner from "@/components/features/settings/subscriptions/UpgradeBanner";
import { SettingMenu } from "@/components/features/settings/types";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import { sharedIcons } from "@/constants/icons";
import {useUser} from "@/stores/context/user";
import AppTypo from "@/components/ui/custom/app-typo";

interface IProps {
  changeMenu: (menu: SettingMenu) => void;
}

const Subscriptions = ({ changeMenu }: IProps) => {
  const { user, isLoading } = useUser();
  const t = useTranslations("settings");

  return (
    <div className="w-full col gap-4">
      <UpgradeBanner />

      <div className="flex flex-col  w-full sm:flex-row sm:w-auto sm:items-center gap-2 pb-4  flex-wrap border-b">
        <div className="row gap-2  mb-4 md:mb-0 me-auto py-2">
          <UserAvatar
            className="h-12 w-12"
            imageSrc={user?.profile_image_url || ""}
            name={user ? user?.username : ""}
          />

          <div className="flex flex-col gap-y-1">
            <AppTypo className=" whitespace-nowrap">{user?.email}</AppTypo>
            <div className="w-fit capitalize gap-x-1 py-0.5 px-2 text-sm bg-success-lighter text-success  rounded-md ">
              {user?.plan?.name || "Free"}
            </div>
          </div>
        </div>

        <div className="flex h-12 w-full text-foreground sm:w-auto items-center justify-between rounded border border-muted-dark px-3 text-small">
          <span>{t("personal_credit")}</span>
          <strong className="text-2xl text-primary pl-2">
            {user?.balance?.amount || 0}
          </strong>
        </div>

        <Button
          variant="outline"
          className="!h-11 aspect-square"
          spacing="none"
          onClick={() => changeMenu?.("subscription_history")}
          id="history-icon"
        >
          <AppIcon icon={sharedIcons.history} width={24} />
        </Button>
      </div>

      <PlanProgresses subscription={user?.subscription} isPending={isLoading} />

      {/*<div className="col gap-4 rounded border p-4">*/}
      {/*  <AppTypo>{t("invite_desc")}</AppTypo>*/}
      {/*  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-1">*/}
      {/*    <AppTypo>*/}
      {/*      {t("invited_friends")}:{" "}*/}
      {/*      {user?.subscription?.referral_bonus &&*/}
      {/*      user?.subscription?.referral_bonus > 20*/}
      {/*        ? Math.min(Math.round(user.subscription.referral_bonus / 20))*/}
      {/*        : 0}*/}
      {/*    </AppTypo>*/}
      {/*    <AppTypo>*/}
      {/*      {t("referral_credit")}: {user?.subscription?.referral_bonus || 0}*/}
      {/*    </AppTypo>*/}
      {/*    <Button*/}
      {/*      onClick={() => changeMenu("referral")}*/}
      {/*      variant="outline"*/}
      {/*      className="row gap-1"*/}
      {/*      icon={sharedIcons.invite}*/}
      {/*    >*/}
      {/*      {t("invite_btn")}*/}
      {/*    </Button>*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
};

export default Subscriptions;
