import { type AxiosRequestConfig } from "axios";

import { axiosClient } from "@/lib/axios-client";
import {LoginParams, OAuthResponse, Provider, RegisterParams} from "@/components/features/auth/types";

const authAPI = {
  basePath: "/auth",

  login: (data: LoginParams, requestConfig?: AxiosRequestConfig) =>
    axiosClient.post(`${authAPI.basePath}/login/`, data, requestConfig),

  logout: () => axiosClient.post(`${authAPI.basePath}/logout/`),
  oAuth: (provider: Provider, requestConfig?: AxiosRequestConfig) =>
    axiosClient.post<OAuthResponse>(`/social/web/${provider}/initiate/`, {}, requestConfig),
  resendEmail: (email: string) =>
    axiosClient.post(`${authAPI.basePath}/requestConfirmationEmail/`, {
      email,
    }),
  register: (data: RegisterParams, requestConfig?: AxiosRequestConfig) =>
    axiosClient.post(`${authAPI.basePath}/register/`, data, requestConfig),
  forgetPassword: (email: string, requestConfig?: AxiosRequestConfig) =>
    axiosClient.post<{ message: string }>(
      `${authAPI.basePath}/forget-password/`,
      { email },
      requestConfig,
    ),
};

export default authAPI;
