import React from "react";
import {useTranslations} from "@/i18n";


const OrDivider = () => {
  const t = useTranslations("auth");
  return (
    <div className="row gap-3 w-full px-1 my-1">
      <span className="hr w-full" />
      <span className="text-foreground">{t("or")}</span>
      <span className="hr w-full" />
    </div>
  );
};

export default OrDivider;
