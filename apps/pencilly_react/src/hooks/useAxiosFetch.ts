import { useEffect, useRef } from "react";

import { CanceledError } from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

import { useErrorToast } from "@/hooks/useErrorToast";
import { axiosClient } from "@/lib/axios-client";
import {USER_KEY} from "@/constants/keys";
import {useQueryClient} from "@tanstack/react-query";
import {queryKeys} from "@/services/query-keys";

/**
 * `configObjType` is an interface that defines the configuration object for the `axiosFetch` function.
 * It has the following properties:
 * - `url`: The URL for the request.
 * - `axiosInstance`: The `axios` instance to use for the request. If not provided, the default `axiosClient` is used.
 * - `method`: The HTTP method for the request. If not provided, the default method is `get`.
 * - `requestConfig`: The configuration for the `axios` request.
 * - `showError`: A boolean that indicates whether to show error toast if the request fails.
 */
export interface ConfigObjType {
  url: string;
  axiosInstance?: AxiosInstance;
  method?: "get" | "post" | "delete" | "head" | "options" | "put" | "patch";
  requestConfig?: AxiosRequestConfig;
  showError?: boolean;
  throwError?: boolean;
}

/**
 * `useAxiosFetcher` is a custom React hook that provides a function for making `axios` requests and a function for aborting the request.
 * It uses the `useRef` hook from React to create a reference to an `AbortController` instance,
 * the `useErrorToast` hook to get the `showFetchError` function,
 * and the `local storage` get the current user session and the `update` function.
 *
 * The hook returns an object with the following properties:
 * - `abortRequest`: A function that aborts the current request.
 * - `axiosFetch`: A function that makes an `axios` request with the provided configuration and data.
 *
 * @returns  An object with the `abortRequest` and `axiosFetch` functions.
 */
export function useAxiosFetcher(abortOnClose: boolean = false) {
  const controller = useRef<AbortController>(undefined);
  const { showCatchError } = useErrorToast();
  const queryClient = useQueryClient();


  // axiosClient.interceptors.response.use(res => res,
  //     (error) => {
  //       if (error?.response?.status === 401) {
  //         localStorage.removeItem(USER_KEY);
  //         queryClient.setQueryData(queryKeys.getMe, null);
  //       }
  //       return Promise.reject(error);
  //     })

  async function axiosFetch<T>(configObj: ConfigObjType, data?: any) {
    const {
      axiosInstance = axiosClient!,
      method = "get",
      url,
      requestConfig = {},
      showError = false,
        throwError
    } = configObj;

    // Abort the previous request.
    // abortRequest();


    // Create a new AbortController instance and get the signal.
    controller.current = new AbortController();
    const signal = controller.current.signal;

    try {
      // Make the axios request with the provided configuration and data.
      const res = await axiosInstance!<T>({
        ...requestConfig,
        method,
        url,
        signal,
        data,
        withCredentials: true,
      });
      const reData = res?.data || {};

      if (res)
        return {
          ...reData,
          status: res.status,
        } as T & {
          status: number;
        };
    } catch (err) {
      if (err instanceof CanceledError) return;
      // Show error toast if `showError` is `true`.
      if (showError) {
        showCatchError(err);
        if (!throwError) return undefined;
      }
      throw err;
    }
  }

  /**
   * `abortRequest` is a function that aborts the current request.
   * It uses the `abort` method from the `AbortController` instance.
   */
  const abortRequest = () => controller.current?.abort();

  // Abort the request when the component unmounts.
  useEffect(() => {
    return () => {
      if (abortOnClose) {
        abortRequest();
      }
    };
  }, []);

  return { abortRequest, axiosFetch };
}
