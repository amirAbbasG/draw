import { useState } from "react";

import { ControllerRenderProps } from "react-hook-form";

import { ChangePasswordData } from "@/components/features/settings/types";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";

interface IProps extends ControllerRenderProps<ChangePasswordData> {
  label: string;
  placeholder: string;
}

export default function ChangePasswordInput({
  label,
  placeholder,
  ...otherProps
}: IProps) {
  const [show, setShow] = useState(true);

  return (
    <div className="flex w-full  flex-col gap-label-space">
      <AppTypo variant="small">{label} :</AppTypo>
      <div className="flex justify-between items-center">
        <div className="w-full lg:w-[340px] relative">
          <Input
            placeholder={placeholder}
            type={show ? "password" : "text"}
            {...otherProps}
          />
          <AppIconButton
            icon={show ? "tabler:eye-closed" : "tabler:eye"}
            onClick={() => setShow(!show)}
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
            size="xs"
          />
        </div>
      </div>
    </div>
  );
}
