import { useCallback, useEffect, useMemo } from "react";

import { useLocation, useNavigate } from "react-router-dom";

interface UseParamsTabProps {
  key?: string;
  defaultValue?: string;
}

export function useParamsTab({
  key = "tab",
  defaultValue,
}: UseParamsTabProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const activeParamTab = searchParams.get(key);

  const setActiveParamTab = useCallback(
    (newValue: string) => {
      const params = new URLSearchParams(location.search);
      params.set(key, newValue);

      const search = params.toString();
      const to = `${location.pathname}${search ? `?${search}` : ""}`;

      navigate(to);
    },
    [key, location.pathname, location.search, navigate],
  );

  useEffect(() => {
    if (!activeParamTab && defaultValue) {
      setActiveParamTab(defaultValue);
    }
  }, [activeParamTab, defaultValue, setActiveParamTab]);

  return { activeParamTab, setActiveParamTab };
}
