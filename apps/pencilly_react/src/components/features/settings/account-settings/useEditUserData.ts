import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAxiosFetcher } from "@/hooks/useAxiosFetch";
import { queryKeys } from "@/services/query-keys";
import { UserDetails } from "@/services/user";

export interface EditData {
  username: string;
  // email: string;
  first_name: string;
  last_name: string;
}

export const useEditUserData = () => {
  const { axiosFetch } = useAxiosFetcher();
  const queryClient = useQueryClient();

  const queryKey = queryKeys.getMe;

  const { mutate: editUserData, isPending } = useMutation({
    mutationFn: async (data: Partial<EditData>) => {
      return await axiosFetch<EditData>(
        {
          url: "/users/me/",
          method: "patch",
          showError: true,
        },
        data,
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
          ...data,
        };
      });

      return { previousData };
    },
    onError: (_err, _data, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
    },
  });

  return {
    isPendingEdit: isPending,
    editUserData,
  };
};

// export const axiosClient = axios.create({
//   baseURL: "https://dev-api.pencilly.us/api/v1",
//   withCredentials: true,
// });
//
// const fetch = async () => {
//   await axiosClient({
//     method: "patch",
//     url: "/users/me/",
//     data: {
//       "first_name": "amirrrrrr22"
//     },
//     withCredentials: true,
//   });
// }