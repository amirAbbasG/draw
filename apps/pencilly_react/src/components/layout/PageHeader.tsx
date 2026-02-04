import React, { type FC } from "react";


import ThemeSelect from "@/components/features/header/ThemeSelect";
import UserMenu from "@/components/features/user/UserMenu";
import DynamicButton from "@/components/shared/DynamicButton";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import {useTranslations} from "@/i18n";
import {useNavigate} from "react-router";

interface IProps {
  title: string;
  className?: string;
}

const PageHeader: FC<IProps> = ({ title, className }) => {
  const t = useTranslations("shared");
  const navigate = useNavigate();
  return (
    <header
      className={cn(
        "w-full sticky top-0  z-10  h-14 border-b py-2 px-2.5 sm:px-4 row gap-2 md:gap-4 ",
        className,
      )}
    >
      <DynamicButton
        icon={sharedIcons.arrow_left}
        title={t("back")}
        hideLabel
        onClick={() => navigate("/")}
      />
      <AppTypo
        variantMobileSize="headingM"
        variant="headingL"
        type="h1"
        className="me-auto"
      >
        {title}
      </AppTypo>
      <ThemeSelect />
      <UserMenu />
    </header>
  );
};

export default PageHeader;
