import {useTheme} from "@/stores/context/theme";

/**
 * Custom hook to determine if the current theme is dark mode.
 *
 * This hook uses the `useTheme` hook from `next-themes` to get the current theme.
 * It returns `true` if the theme is "dark" or if the theme is "system" and the
 * user's system prefers dark mode.
 *
 * @returns boolean - `true` if dark mode is enabled, otherwise `false`.
 */
export const useIsDarkMode = () => {
  const { theme } = useTheme();

  return (
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
};
