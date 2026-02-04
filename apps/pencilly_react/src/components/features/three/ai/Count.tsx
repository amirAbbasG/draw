import React from "react";

import { useTranslations } from "@/i18n";

import { Button } from "@/components/ui/button";
import AppTypo from "@/components/ui/custom/app-typo";

interface DynamicInputOption {
  value: number;
  onChangeValue: (val: number) => void;
  options: number[];
}

function Count({ value = 1, options, onChangeValue }: DynamicInputOption) {
  const t = useTranslations("three.ai");

  return (
    <div className="col gap-label-space ">
      <AppTypo type="label">{t("count")}</AppTypo>

      <div className="row gap-2 flex-wrap">
        {options!.map(item => (
          <Button
            size="sm"
            key={"count-" + item}
            selected={value === item}
            onClick={() => onChangeValue(item)}
            variant="secondary"
            className="px-4"
          >
            {item}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default Count;
