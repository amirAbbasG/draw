import React, { useRef } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAxiosFetcher } from "@/hooks/useAxiosFetch";
import { queryKeys } from "@/services/query-keys";
import { UserDetails } from "@/services/user";

export interface UploadRes {
  detail: string;
  image_key: string;
  image_url: string;
  task_id: string;
}

export const useChangeProfileImage = () => {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { axiosFetch } = useAxiosFetcher();
  const queryClient = useQueryClient();

  const queryKey = queryKeys.getMe;

  const { mutate, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return await axiosFetch<UploadRes>(
        {
          url: "users/change/profile_image/",
          method: "post",
          showError: true,
          requestConfig: {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        },
        formData,
      );
    },
    onMutate: async data => {
      await queryClient.cancelQueries({ queryKey });
      // Optionally show a loading indicator

      const previousData = queryClient.getQueryData(queryKey) as UserDetails;

      queryClient.setQueryData<UserDetails>(queryKey, oldData => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          profile_image_url: data
            ? URL.createObjectURL(data)
            : oldData.profile_image_url,
        };
      });

      return { previousData };
    },
    onError: (_err, _data, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
    },
  });

  //handle upload image
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      mutate(file!);
    }
  };

  const openUpload = () => {
    uploadInputRef.current?.click();
  };

  return {
    isPending,
    uploadInputRef,
    openUpload,
    handleFileChange,
  };
};
