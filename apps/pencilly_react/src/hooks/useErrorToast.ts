import { isAxiosError } from "axios";
import { toast } from "sonner";

import { isEmpty } from "@/lib/utils";
import {useTranslations} from "@/i18n";

/**
 * Custom hook to handle and display error toasts.
 *
 * This hook provides a function to show error messages using the `sonner` toast library.
 * It also provides a function to handle and display errors from Axios requests.
 *
 * @returns Object An object containing the `showCatchError` function.
 */
export const useErrorToast = () => {
const t = useTranslations("error")
  /**
   * Displays an error toast with the given message.
   *
   * @param {string} error - The error message to display.
   */
  const showError = (error: string) => {
    toast.error(error);
  };
  /**
   * Handles and displays errors from Axios requests.
   *
   * @param {any} error - The error object to handle.
   */
  const showCatchError = (error: any) => {
    // Check if the error is an Axios error
    if (isAxiosError(error)) {
      // Check if the error is a network error
      if (error.message === "Network Error") {
        return showError(t("network_error"));
      }
      //If is 404 error show not found error
      if (error.status == 404) {
        return showError(t("api_notfound"));
      }
      //If 500 error show server error
      if (error.status === 500) {
        return showError(t("server_error"));
      }
      //if response error data is an array show first one
      if (
        !!error?.response?.data?.detail &&
        !isEmpty(error.response.data.detail)
      ) {
        return showError(
          error.response.data.detail?.[0]?.msg || t("failed_error"),
        );
      }
      //Else passed above steps show error message
      return showError(
          error.response.data.error ||
        error.response?.data?.message ||
          error?.response?.data.detail ||
          error.message ||
          t("failed_error"),
      );
      //if error is not an axios error
    } else {
      showError(t("common_error_message"));
    }
  };

  return { showCatchError };
};
