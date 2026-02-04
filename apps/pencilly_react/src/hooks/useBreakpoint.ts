import { useEffect, useState } from "react";

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export type AppBreakpoint = keyof typeof breakpoints;

/**
 * Get the current breakpoint based on the window width.
 *
 * @param {number} width - The current width of the window.
 * @returns {AppBreakpoint} - The current breakpoint.
 */
const getCurrentBreakpoint = (width: number): AppBreakpoint => {
  return Object.entries(breakpoints)
    .reverse()
    .find(([, minWidth]) => width >= minWidth)?.[0] as AppBreakpoint;
};

/**
 * Custom hook to get the current breakpoint and window width.
 *
 * This hook provides the current breakpoint, window width, and utility functions to compare breakpoints.
 *
 * @returns Object - An object containing the current breakpoint, window width, and comparison functions.
 * @returns AppBreakpoint breakpoint - The current breakpoint.
 * @returns function isGreaterThan - Function to check if the current breakpoint is greater than the given breakpoint.
 * @returns function isLessThan - Function to check if the current breakpoint is less than the given breakpoint.
 * @returns number windowWidth - The current width of the window.
 */
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<AppBreakpoint>("lg");
  const [windowWidth, setWindowWidth] = useState<number>(0);

  /**
   * Get the value of the given breakpoint.
   *
   * @param {AppBreakpoint} bp - The breakpoint to get the value for.
   * @returns number - The value of the breakpoint.
   */
  const getBreakpointValue = (bp: AppBreakpoint) => breakpoints[bp];

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      const currentBreakpoint = Object.entries(breakpoints)
        .reverse()
        .find(([, minWidth]) => width >= minWidth)?.[0] as AppBreakpoint;

      setBreakpoint(currentBreakpoint);
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  /**
   * Check if the current breakpoint is greater than the given breakpoint.
   *
   * @param {AppBreakpoint} bp - The breakpoint to compare with.
   * @returns boolean - True if the current breakpoint is greater, false otherwise.
   */
  const isGreaterThan = (bp: AppBreakpoint) =>
    getBreakpointValue(breakpoint) >= getBreakpointValue(bp);

  /**
   * Check if the current breakpoint is less than the given breakpoint.
   *
   * @param {AppBreakpoint} bp - The breakpoint to compare with.
   * @returns boolean - True if the current breakpoint is less, false otherwise.
   */
  const isLessThan = (bp: AppBreakpoint) =>
    getBreakpointValue(breakpoint) < getBreakpointValue(bp);

  return { breakpoint, isGreaterThan, isLessThan, windowWidth };
};
