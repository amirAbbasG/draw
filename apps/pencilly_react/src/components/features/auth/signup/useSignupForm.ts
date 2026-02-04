import { useForm } from "react-hook-form";
import { toast } from "sonner";

import authAPI from "@/components/features/auth/services";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useTranslations } from "@/i18n";

export interface SignupForm {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export function useSignupForm(
  setShowEmailConfirmation: (val: boolean) => void,
) {
  // Use the custom hook `useErrorToast` to get the `showFetchError` function.
  const { showCatchError } = useErrorToast();
  const t = useTranslations("auth.signup");

  // Use `useForm` from `react-hook-form` to manage the form state and validation.
  const form = useForm<SignupForm>({
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
    },
  });

  const handleSignup = async (values: SignupForm) => {
    const { email, ...rest } = values;
    try {
      await authAPI.register({
        username:
          (email.split("@")[0] || "").replace(/[^a-zA-Z0-9]/g, "") ||
          `user${Date.now()}`,
        email,
        ...rest,
        terms_accepted: true,
      });
      setShowEmailConfirmation(true);
    } catch (e) {
      console.log(e);
      showCatchError(e);
    }
  };

  const sendAgain = async (email: any) => {
    try {
      await authAPI.resendEmail(email);
      toast.success(t("resend_message"));
    } catch (e) {
      showCatchError(e);
    }
  };

  // Return the form methods, the signup handler function,
  // the function to set the email confirmation state, and the email confirmation state.
  return {
    form,
    handleSignup,
    sendAgain,
    handleSubmit: form.handleSubmit(handleSignup),
  };
}
