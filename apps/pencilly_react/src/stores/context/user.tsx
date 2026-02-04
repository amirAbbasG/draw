import React, { createContext, useContext, useMemo } from "react";

import { useGetMe, User } from "@/services/user";

interface UserContextType {
  user: User | undefined;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: undefined,
  isLoading: false,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading } = useGetMe();

  const value = useMemo(() => ({ user, isLoading }), [user, isLoading]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
