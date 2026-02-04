import LanguageDetector from "i18next-browser-languagedetector";

import { defaultLang, languages } from "@/i18n/languages";

export const languageDetector = new LanguageDetector();

languageDetector.init({
  languageUtils: {},
});

export const getPreferredLanguage = () => {
  const detectedLanguages = languageDetector.detect();

  const detectedLanguage = Array.isArray(detectedLanguages)
    ? detectedLanguages[0]
    : detectedLanguages;

  return (
    (detectedLanguage
      ? // region code may not be defined if user uses generic preferred language
        // (e.g., chinese vs. instead of chinese-simplified)
        languages.find(lang => lang.code.startsWith(detectedLanguage))?.code
      : null) || defaultLang.code
  );
};
