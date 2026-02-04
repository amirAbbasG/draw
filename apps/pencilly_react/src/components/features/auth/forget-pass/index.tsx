import React from "react";

import { Controller } from "react-hook-form";

import ConfirmEmailMessage from "@/components/features/auth/forget-pass/ConfirmEmailMessage";
import { useForgotPassForm } from "@/components/features/auth/forget-pass/useForgotPassForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/i18n";

/**
 * `ForgetPassPage` is a React component that handles the password reset process.
 * It uses the `react-hook-form` for form handling and validation, and `useState` for local state management.
 *
 * @returns The rendered password reset page.
 */
interface IProps {
  showEmailConfirmation: boolean;
  setShowEmailConfirmation: (val: boolean) => void;
}

export default function ForgetPass({
  setShowEmailConfirmation,
  showEmailConfirmation,
}: IProps) {
  const t = useTranslations("auth");
  const {
    handleSubmit,
    onSubmit,
    getValues,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForgotPassForm({
    setShowEmailConfirmation,
  });

  // Render the password reset page.

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" z-10  h-fit w-full col gap-6"
      >
        <div className="grid grid-cols-1 items-start gap-2">
          <Controller
            name="email"
            control={control}
            rules={{ required: t("form.email_error_message") }}
            render={({ field }) => (
              <Input
                autoFocus
                error={errors.email?.message}
                type="text"
                icon="circum:mail"
                placeholder={t("form.email_placeholder2")}
                {...field}
              />
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
          isPending={isSubmitting}
        >
          {t("forget_pass.send_me_link")}
        </Button>
      </form>
      <ConfirmEmailMessage
        email={getValues().email}
        resendEmail={() => onSubmit(getValues())}
        rootClassName={showEmailConfirmation ? "flex" : "!hidden"}
        isForgotPas
      />
    </>
  );
}
