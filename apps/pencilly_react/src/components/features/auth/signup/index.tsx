import React, { useState } from "react";

import { Controller } from "react-hook-form";

import ConfirmEmailMessage from "@/components/features/auth/forget-pass/ConfirmEmailMessage";
import { useSignupForm } from "@/components/features/auth/signup/useSignupForm";
import { Show } from "@/components/shared/Show";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import { Form as FormProvider } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {sharedIcons} from "@/constants/icons";
import {useTranslations} from "@/i18n";

interface IProps {
  onClose: () => void;
  showEmailConfirmation: boolean;
  setShowEmailConfirmation: (val: boolean) => void;
}

export default function Signup({
  setShowEmailConfirmation,
  showEmailConfirmation,
}: IProps) {
  const t = useTranslations("auth");
  const [showPass, setShowPass] = useState(false);

  const { form, sendAgain, handleSubmit } = useSignupForm(
    setShowEmailConfirmation,
  );

  const {
    getValues,
    formState: { isSubmitting, errors, isValid },
    control,
  } = form;



  return (
    <div className="flex h-fit w-full col">
      <Show>
        <Show.When isTrue={showEmailConfirmation}>
          <ConfirmEmailMessage
            email={getValues().email}
            resendEmail={() => sendAgain(getValues().email)}
            rootClassName={showEmailConfirmation ? "flex" : "!hidden"}
          />
        </Show.When>
        <Show.Else>
          <FormProvider {...form}>
            <form
              method="post"
              onSubmit={handleSubmit}
              className="w-full col gap-4"
            >
                <div className="flex flex-col sm:flex-row gap-4">
                  {
                    (["first_name", "last_name"] as const).map((fieldName) => (
                      <div key={fieldName} className="flex-1 grid grid-cols-1 items-start gap-2 text-large">
                        <Controller
                          name={fieldName}
                          control={control}
                          render={({ field }) => (
                            <Input
                                icon={sharedIcons.user}
                              type="text"
                              error={errors[fieldName as keyof typeof errors]?.message}
                              placeholder={t(`form.${fieldName}_placeholder`)}
                              {...field}
                            />
                          )}
                        />
                      </div>
                    ))
                  }
                </div>
              <div className="grid grid-cols-1 items-start gap-2 text-large">
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
                        icon={sharedIcons.mail}
                        type="text"
                      error={errors.email?.message}
                      placeholder={t("form.email_placeholder")}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="grid grid-cols-1 items-start gap-2 text-large relative">
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
                      placeholder={t("form.pass_placeholder")}
                      {...field}
                    />
                  )}
                />
                <AppIcon
                  icon={showPass ? "tabler:eye-closed" : "tabler:eye"}
                  onClick={() => setShowPass(!showPass)}
                  className="absolute top-0 translate-y-2.5 right-3 cursor-pointer !text-foreground"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                isPending={isSubmitting}
              >
                {isSubmitting ? "Please Wait..." : t("signup.signup")}
              </Button>
            </form>
          </FormProvider>
        </Show.Else>
      </Show>
    </div>
  );
}
