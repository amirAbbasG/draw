/**
 * Copies the provided text to the system clipboard.
 *
 * This function attempts to use the Clipboard API to write the text to the clipboard.
 * If the Clipboard API is not available, it falls back to using `document.execCommand`.
 *
 * @param {string} [text=""] - The text to be copied to the clipboard.
 * @returns Promise<void> - A promise that resolves when the text has been copied.
 */
export async function copyTextToClipboard(text: string = "") {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand("copy", true, text);
  }
}
