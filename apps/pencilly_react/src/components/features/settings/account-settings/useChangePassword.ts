import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "@/i18n";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ChangePasswordData } from "@/components/features/settings/types";
import { useAxiosFetcher } from "@/hooks/useAxiosFetch";

export interface ChangePassInput {
  password: string;
  new_password: string;
}

export const useChangePassword = () => {
  const { axiosFetch } = useAxiosFetcher();
  const t = useTranslations("settings");

  const { reset, handleSubmit, control, watch, formState } =
    useForm<ChangePasswordData>({
      defaultValues: {
        new_password: "",
        old_password: "",
        confirm_password: "",
      },
    });

  const { mutate } = useMutation({
    mutationFn: (data: ChangePassInput) =>
      axiosFetch(
        {
          url: "/auth/set-new-password/",
          method: "post",
          showError: true,
        },
        data,
      ),
    onSuccess: () => {
      toast.success(t("change_password_success"));
      reset();
    },
  });

  const onSubmit = ({ new_password, old_password }: ChangePasswordData) => {
    mutate({
      password: old_password,
      new_password: new_password as string, // to avoid undefined error
    });
  };

  const passData = watch();

  return {
    formState,
    changePassword: handleSubmit(onSubmit),
    control,
    reset,
    passData,
  };
};
