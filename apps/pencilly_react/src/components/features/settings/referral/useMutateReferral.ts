import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "@/i18n";
import { toast } from "sonner";

import { useErrorToast } from "@/hooks/useErrorToast";
import { axiosClient } from "@/lib/axios-client";

export const useMutateReferral = () => {
  const t = useTranslations("settings");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const { showCatchError } = useErrorToast();
  const referralRequest = async (url: string, data: Record<string, string>) => {
    try {
      await axiosClient.post(`/subscriptions/referral/${url}/`, data);
    } catch (e) {
      showCatchError(e);
    }
  };

  const {
    mutateAsync: mutateEmailReferral,
    isPending: isPendingEmailReferral,
  } = useMutation({
    mutationFn: (data: { email: string }) => referralRequest("invite", data),
  });

  const submitEmailReferral = async () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email && !emailPattern.test(email)) throw Error(t("email_validation"));
    await mutateEmailReferral({ email });
    setEmail("");
    toast.success(t("invite_member_success"));
  };

  const {
    mutateAsync: mutateApplyReferral,
    isPending: isPendingApplyReferral,
  } = useMutation({
    mutationFn: (data: { token: string }) => referralRequest("apply", data),
    onSuccess: () => {
      toast.success(t("apply_referral_success"));
    },
  });

  const applyCode = () => {
    if (!code) return;
    void mutateApplyReferral({ token: code });
  };

  return {
    setEmail,
    email,
    isPendingEmailReferral,
    submitEmailReferral,
    mutateApplyReferral,
    isPendingApplyReferral,
    setCode,
    code,
    applyCode,
  };
};
