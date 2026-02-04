import { useUser } from "@/stores/context/user";
import {setIsAuthPopupOpen, setIsUpgradePopupOpen} from "@/stores/zustand/ui/actions";

export const useCheckIsAuth = () => {
  const { user } = useUser();
  const isAuth = !!user;

  const isProUser = !!user && user.plan && !user.plan.is_free

  const goAuth = () => {
    setIsAuthPopupOpen(true);
  };


  const fnWithAuth = <T = undefined>(fn: (arg?: T) => void, pro: boolean = false) => {
    if (!isAuth ) return goAuth;
    // if(pro && !isProUser && !user?.plan.credits_amount){
    //   return () => setIsUpgradePopupOpen(true)
    // }
    return fn;
  };

  return {
    isAuth,
    fnWithAuth,
    goAuth,
    isProUser,
  };
};
