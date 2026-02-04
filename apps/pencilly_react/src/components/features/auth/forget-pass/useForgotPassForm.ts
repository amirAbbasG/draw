import { useForm } from "react-hook-form";
import { toast } from "sonner";

import authAPI from "@/components/features/auth/services";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useTranslations } from "@/i18n";

interface ForgotPassForm {
  email: string;
}

interface UseForgotPassFormParams {
  setShowEmailConfirmation: (page: boolean) => void;
}

export const useForgotPassForm = ({
  setShowEmailConfirmation,
}: UseForgotPassFormParams) => {
  const { showCatchError } = useErrorToast();
  const t = useTranslations("auth.forget_pass");
  // Use `useForm` from `react-hook-form` to manage the form state and validation.
  const form = useForm<ForgotPassForm>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async ({ email }: ForgotPassForm) => {
    try {
      authAPI.forgetPassword(email).then(() => {
        setShowEmailConfirmation(true);
        toast.success(t("forgot_passes_success_message"));
      });
    } catch (e) {
      showCatchError(e);
    }
  };

  return {
    ...form,
    onSubmit,
  };
};
