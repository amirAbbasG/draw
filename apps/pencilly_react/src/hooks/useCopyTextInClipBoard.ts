import { useState } from "react";

import { copyTextToClipboard } from "@/lib/clipboard";

/**
 * Custom hook to copy text to the clipboard.
 *
 * This hook provides a function to copy text to the clipboard and manages the state indicating whether the text has been copied.
 *
 * @param {number} [time=1500] - The duration (in milliseconds) for which the copied state remains true.
 * @returns [function, boolean, string] - An array containing the handleCopy function, the isCopied state, and the copiedVal state.
 *
 * @example
 * const [handleCopy, isCopied, copiedVal] = useCopyTextInClipBoard(2000);
 * handleCopy("Sample text");
 * console.log(isCopied); // Output: true or false
 * console.log(copiedVal); // Output: "Sample text"
 */
export function useCopyTextInClipBoard(time: number = 1500) {
  const [isCopied, setIsCopied] = useState(false);
  const [copiedVal, setCopiedVal] = useState("");

  /**
   * Function to copy text to the clipboard.
   *
   * @param {string} text - The text to be copied to the clipboard.
   *
   */
  const handleCopy = (text: string) => {
    // Asynchronously call copyTextToClipboard
    copyTextToClipboard(text)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, time);
      })
      .catch(err => {
        console.log(err);
      });
    setCopiedVal(text);
  };

  return [handleCopy, isCopied, copiedVal] as const;
}
