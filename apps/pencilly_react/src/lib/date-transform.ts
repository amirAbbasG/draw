/**
 * A dictionary of time intervals in seconds.
 * Used to calculate the difference between two dates in various units of time.
 */
const intervals = {
  year: 31536000,
  month: 2592000,
  day: 86400,
  hour: 3600,
  minute: 60,
  second: 1,
};
/**
 * Type definition for the keys used in the localization dictionary.
 */
type LocalDictionary =
  | "ago"
  | "justNow"
  | "year"
  | "years"
  | "month"
  | "months"
  | "day"
  | "days"
  | "hour"
  | "hours"
  | "minute"
  | "minutes"
  | "second"
  | "seconds";

/**
 * Default localization dictionary for time-related strings.
 * Provides default English translations for various time units and phrases.
 */
const defaultDictionary: Record<LocalDictionary, string> = {
  year: "year",
  years: "years",
  month: "month",
  months: "months",
  day: "day",
  days: "days",
  hour: "hour",
  hours: "hours",
  minute: "minute",
  minutes: "minutes",
  second: "second",
  seconds: "seconds",
  ago: "ago",
  justNow: "just now",
};

/**
 * Calculates the time passed since a given date and returns a human-readable string.
 *
 * @param {string | Date} dateString - The date to calculate the time passed since.
 * @param {boolean} [addSuffix=true] - Whether to add a suffix (e.g., "ago") to the result.
 * @param {(key: LocalDictionary) => string} [localHandler] - Optional function to handle localization of strings.
 * @returns string A human-readable string representing the time passed since the given date.
 */
export function timePassedSince(
  dateString: string | Date,
  addSuffix: boolean = true,
  localHandler?: (key: LocalDictionary) => string,
) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const getMessage = (key: LocalDictionary) => {
    return localHandler ? localHandler(key) : defaultDictionary[key];
  };

  let counter;
  for (const [key, value] of Object.entries(intervals)) {
    counter = Math.floor(diffInSeconds / value);
    if (counter > 0) {
      return addSuffix
        ? `${counter} ${getMessage((key + (counter > 1 ? "s" : "")) as LocalDictionary)} ${getMessage("ago")}`
        : `${counter} ${getMessage((key + (counter > 1 ? "s" : "")) as LocalDictionary)}`;
    }
  }

  return addSuffix ? getMessage("justNow") : `0 ${getMessage("second")}`;
}

/**
 * Converts a time duration specified in hours, minutes, and seconds into milliseconds.
 *
 * @param {Object} params - The time duration to convert.
 * @param {number} [params.hours=0] - The number of hours.
 * @param {number} [params.minutes=0] - The number of minutes.
 * @param {number} [params.seconds=0] - The number of seconds.
 * @returns number The total time duration in milliseconds.
 */
export const toMilliseconds = ({
  hours = 0,
  minutes = 0,
  seconds = 0,
}: {
  hours?: number;
  minutes?: number;
  seconds?: number;
}) => {
  return hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
};
