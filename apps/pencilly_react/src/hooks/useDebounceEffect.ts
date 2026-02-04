import { useEffect } from "react";

export const useDebounceEffect = (
  callback: () => void,
  value: any,
  ms: number = 500,
) => {
  useEffect(() => {
    const timer = setTimeout(() => callback(), ms);
    return () => clearTimeout(timer);
  }, [value]);
};
