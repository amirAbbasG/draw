import React, { useState } from "react";

import { Controller } from "react-hook-form";

import { useSigninForm } from "@/components/features/auth/signin/useSigninForm";
import { AuthPages } from "@/components/features/auth/Tabs";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import { Input } from "@/components/ui/input";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";


interface IProps {
  onClose: () => void;
  setPage: (val: AuthPages) => void;
}

export default function Signin({ onClose, setPage }: IProps) {
  const t = useTranslations("auth");
  const [showPass, setShowPass] = useState(false);

  const {
    formState: { errors, isValid, isSubmitting },
    control,
    handleSubmit,
  } = useSigninForm({ onClose });


  // Render the login page.
  return (
    <form onSubmit={handleSubmit} className="flex h-fit w-full   col gap-4 ">
      <div className="col w-full items-start gap-2">
        <Controller
          name="email"
          control={control}
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[^@]+@[^@]+\.[^@]+$/,
              message: "Invalid email format",
            },
          }}
          render={({ field }) => (
            <Input
              autoFocus
              type="text"
              error={errors.email?.message}
              placeholder={t("login.email_placeholder")}
              icon={sharedIcons.mail}
              {...field}
            />
          )}
        />
      </div>

      <div className="flex flex-col items-start gap-2 relative">
        <Controller
          name="password"
          control={control}
          rules={{
            required: t("form.pass_error1"),
            minLength: {
              value: 8,
              message: t("form.pass_error2"),
            },
          }}
          render={({ field }) => (
            <Input
              icon={sharedIcons.password}
              type={showPass ? "text" : "password"}
              error={errors.password?.message}
              placeholder={t("login.pass_placeholder")}
              {...field}
            />
          )}
        />
        <AppIcon
          icon={showPass ? "tabler:eye-closed" : "tabler:eye"}
          onClick={() => setShowPass(!showPass)}
          className="absolute top-0 translate-y-2.5 right-3 cursor-pointer text-foreground"
        />
      </div>
        <Button
            onClick={() => setPage("forgot_pass")}
            variant="link"
            color="default"
            className=" -mt-4 self-end w-fit p-0 pb-1 h-fit"
        >
            {t("login.forget_pass")}
        </Button>

      <Button
        type="submit"
        disabled={isSubmitting || !isValid}
        isPending={ isSubmitting}
      >
        {isSubmitting ? t("login.please_wait") : t("login.login")}
      </Button>


    </form>
  );
}
