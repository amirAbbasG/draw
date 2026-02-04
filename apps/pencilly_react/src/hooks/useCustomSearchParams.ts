import {  useEffect } from "react";

import {  useSearchParams } from "react-router";

/**
 * Custom hook to manage URL search parameters (react-router-dom).
 *
 * Returns [URLSearchParams, setSearchParams]
 */
export function useCustomSearchParams(
  initialKey?: string,
  initialValue?: string,
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentValue = initialKey ? searchParams.get(initialKey) : null;

  useEffect(() => {
    if (initialKey && initialValue && !currentValue) {
      searchParams.set(initialKey, initialValue);
      setSearchParams(searchParams);
    }
  }, [initialKey, initialValue, currentValue]);

  const removeParam = (key: string) => {
    if (searchParams.has(key)) {
      searchParams.delete(key);
      setSearchParams(searchParams);
    }
  };

  return {
    searchParams,
    setSearchParams,
     removeParam,
    currentValue,
  };
}
