import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


/**
 * This function merges a list of class names into a single string.
 * It uses the clsx library to combine the class names, and then uses the tailwind-merge library to merge the resulting class names.
 * The function takes a rest parameter, allowing for any number of arguments to be passed.
 *
 * @param {...ClassValue[]} inputs - The class names to be merged.
 * @returns string The merged class names as a single string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * for get first letter of name and lastname
 * @param word - word to get first letter
 * @return char first char of word passed to uppercase
 */
export const getFirstLetter = (word: string) => {
  return word ? word[0].toUpperCase() : "A";
};

/**
 * pass variable and get hsl
 * @param variable color variable from global css
 * @returns hsl color
 */
export const getHslColorByVar = (variable: string) => {
  return `hsl(var(${variable}))`;
};

/**
 * This function separates a number by commas for every three digits from the right.
 * It takes a string as an input, removes any existing commas, and splits the string at the decimal point.
 * The integer part of the number is then separated by commas for every three digits from the right.
 * The function then returns the formatted number as a string.
 * If the input is null, the function returns 0.
 *
 * @param {string} number - The number to be formatted, represented as a string.
 * @returns string The formatted number as a string, or 0 if the input is null.
 */
export function separateNumber(number: string) {
  if (number != null) {
    number += "";
    number = number.replace(",", "");
    const x = number.split(".");
    let y = x[0];
    const z = x.length > 1 ? "." + x[1] : "";
    const rgx = /(\d+)(\d{3})/;
    while (rgx.test(y)) y = y.replace(rgx, "$1" + "," + "$2");
    return y + z;
  } else {
    return "0";
  }
}

/**
 * Checks if the current device is a mobile device.
 *
 * This function checks the user agent string to determine if the current device is a mobile device.
 *
 * @returns boolean - True if the current device is a mobile device, false otherwise.
 */
export const checkIsMobile = () => {
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android|iphone|ipad|ipod|blackberry|windows phone|opera mini|iemobile/i.test(
    userAgent,
  );
};


/**
 * This function checks if the provided iterable is empty.
 * It supports arrays and objects. For arrays, it checks if the length is 0.
 * For objects, it checks if the number of keys is 0.
 * For all other types, it returns true, indicating that they are "empty".
 *
 * @param {any} iterable - The iterable to be checked for emptiness.
 * @returns boolean True if the iterable is empty, false otherwise.
 */
export const isEmpty = (iterable: any) => {
  // Check if the iterable is an array and if so, return true if its length is 0.
  if (Array.isArray(iterable)) {
    return iterable.length === 0;
  }
  // Check if the iterable is an object and if so, return true if it has no keys.
  if (typeof iterable === "object") {
    return Object.keys(iterable).length === 0;
  }

  // For all other types, return true indicating that they are "empty".
  return true;
};

/**
 * Formats a number into a compact, human-readable string.
 *
 * This function uses the `Intl.NumberFormat` API with the "compact" notation
 * to format a number into a shorter representation (e.g., 1,000 becomes "1K").
 *
 * @param {number} number - The number to be formatted.
 * @returns string The formatted number in compact notation.
 */
export function formatCompactNumber(number: number) {
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  return formatter.format(number);
}

export interface ThrottleSettings {
  /**
   * If true (default), invoke the function on the leading edge of the timeout.
   */
  leading?: boolean;
  /**
   * If true (default), invoke the function on the trailing edge of the timeout.
   */
  trailing?: boolean;
}

/**
 * Creates a throttled function that only invokes `func` at most once
 * per every `wait` milliseconds.
 *
 * @param func The function to throttle.
 * @param wait The number of milliseconds to throttle invocations to.
 * @param options The options object.
 * @returns Returns the new throttled function with a `.cancel()` method.
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number = 0,
    options: ThrottleSettings = {},
): T & { cancel(): void; flush(): void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;
  let trailingArgs: Parameters<T> | null = null;
  let result: ReturnType<T>;

  const { leading = true, trailing = true } = options;

  const later = () => {
    previous = leading === false ? 0 : Date.now();
    timeout = null;
    if (trailingArgs !== null) {
      result = func(...trailingArgs);
      trailingArgs = null;
    }
  };

  const throttled = function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (!previous && leading === false) previous = now;

    const remaining = wait - (now - previous);

    // @ts-ignore – this is safe because we're preserving the original `this`
    const context = this;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) trailingArgs = null;
    } else if (!timeout && trailing !== false) {
      trailingArgs = args;
      timeout = setTimeout(later, remaining);
    }

    return result;
  } as T & { cancel(): void; flush(): void };

  throttled.cancel = function () {
    if (timeout) clearTimeout(timeout);
    timeout = null;
    previous = 0;
    trailingArgs = null;
  };

  throttled.flush = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      if (trailingArgs !== null) {
        result = func(...trailingArgs) as ReturnType<T>;
        trailingArgs = null;
        previous = Date.now();
      }
    }
  };

  return throttled;
}

export function isEqual(a: any, b: any): boolean {
  // === handles null, undefined, NaN, 0, -0, etc.
  if (Object.is(a, b)) return true;

  // Different types → not equal
  if (typeof a !== typeof b) return false;

  // Handle null/undefined (already covered above, but safe)
  if (a == null || b == null) return false;

  // Handle Dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (a instanceof Date || b instanceof Date) return false;

  // Handle RegExps
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }
  if (a instanceof RegExp || b instanceof RegExp) return false;

  // Handle Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (Array.isArray(a) || Array.isArray(b)) return false;

  // Handle Maps
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, value] of a) {
      if (!b.has(key) || !isEqual(value, b.get(key))) return false;
    }
    return true;
  }
  if (a instanceof Map || b instanceof Map) return false;

  // Handle Sets
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    const aArr = Array.from(a);
    const bArr = Array.from(b);
    aArr.sort();
    bArr.sort();
    return isEqual(aArr, bArr);
  }
  if (a instanceof Set || b instanceof Set) return false;

  // Handle plain objects (including object literals)
  if (a.constructor === Object && b.constructor === Object) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    // Fast path: compare keys first
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    }

    for (const key of keysA) {
      if (!isEqual(a[key], b[key])) return false;
    }

    return true;
  }

  // Handle other typed objects (e.g. custom classes) – shallow comparison
  // Lodash treats them as equal only if strictly equal or shallow props match
  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (a[key] !== b[key]) return false;
    }
    return true;
  }

  return false;
}
