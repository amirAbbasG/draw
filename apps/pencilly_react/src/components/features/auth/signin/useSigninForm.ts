import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import authAPI from "@/components/features/auth/services";
import { useErrorToast } from "@/hooks/useErrorToast";
import { queryKeys } from "@/services/query-keys";

interface SignInForm {
  email: string;
  password: string;
  remember_me: boolean;
}

export const useSigninForm = ({ onClose }: { onClose: () => void }) => {
  const { showCatchError } = useErrorToast();
  const queryClient = useQueryClient();

  // Use `useForm` from `react-hook-form` to manage the form state and validation.
  const form = useForm<SignInForm>({
    defaultValues: {
      email: "",
      password: "",
      remember_me: true,
    },
  });

  const onSubmit = async (values: SignInForm) => {
    try {
      await authAPI.login(values);
      void queryClient.refetchQueries({
        queryKey: queryKeys.getMe,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.history,
      });

      onClose();
    } catch (e) {
      showCatchError(e);
    }
  };

  return {
    ...form,
    handleSubmit: form.handleSubmit(onSubmit),
  };
};
