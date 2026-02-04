
import { useEffect, useState } from "react";

/**
 * A hook to determine if the current device is a touch device.
 *
 * @returns boolean - Whether the current device is a touch device.
 *
 * @example
 * const isTouchDevice = useIsTouchDevice()
 */
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    function onResize() {
      // Check if the device is a touch device
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          navigator.maxTouchPoints > 0,
      );
    }

    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return isTouchDevice;
}
