import { useEffect } from "react";

import { setUIFocused } from "@/stores/zustand/three/actions";

export const FocusDetector = () => {
  useEffect(() => {
    const handleFocusChange = () => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA";
      setUIFocused(isInput);
    };

    document.addEventListener("focusin", handleFocusChange);
    document.addEventListener("focusout", handleFocusChange);

    handleFocusChange();

    return () => {
      document.removeEventListener("focusin", handleFocusChange);
      document.removeEventListener("focusout", handleFocusChange);
    };
  }, [setUIFocused]);

  return null;
};
