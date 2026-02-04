import { useShallow } from "zustand/react/shallow";

import { setLangCode } from "@/stores/zustand/ui/actions";
import { useUiStore } from "@/stores/zustand/ui/ui-store";

import fallbackLangData from "./locales/en.json";
import {defaultLang, Language, languages} from "@/i18n/languages";
import {languageDetector} from "@/i18n/language-detector";


type NestedKeyOf<T, K = keyof T> = K extends keyof T & (string | number)
    ? `${K}` | (T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : never)
    : never;

type Prefixes<T extends string> =
    T extends `${infer A}.${infer B}`
        ? A | `${A}.${Prefixes<B>}` | T
        : T;

type StripPrefix<T, P extends string> = T extends `${P}.${infer R}` ? R : never;

type TopLevelOrNestedPrefix = Prefixes<TranslationKeys>;




export type TranslationKeys = NestedKeyOf<typeof fallbackLangData>;





const TEST_LANG_CODE = "__test__";
// if (isDevEnv()) {
//     languages.unshift(
//         { code: TEST_LANG_CODE, label: "test language" },
//         {
//             code: `${TEST_LANG_CODE}.rtl`,
//             label: "\u{202a}test language (rtl)\u{202c}",
//             rtl: true,
//         },
//     );
// }

let currentLang: Language = defaultLang;
let currentLangData = {};

export const setLocale = async (lang: Language) => {
  currentLang = lang;
  document.documentElement.dir = currentLang.rtl ? "rtl" : "ltr";
  document.documentElement.lang = currentLang.code;

  if (lang.code.startsWith(TEST_LANG_CODE)) {
    currentLangData = {};
  } else {
    try {
      currentLangData = await import(`./locales/${currentLang.code}.json`);
    } catch (error: any) {
      console.error(`Failed to load language ${lang.code}:`, error.message);
      currentLangData = fallbackLangData;
    }
  }

  setLangCode(lang.code);
  languageDetector.cacheUserLanguage(lang.code);
};

export const getLanguage = () => currentLang;

const findPartsForData = (data: any, parts: string[]) => {
  for (let index = 0; index < parts.length; ++index) {
    const part = parts[index];
    if (data[part] === undefined) {
      return undefined;
    }
    data = data[part];
  }
  if (typeof data !== "string") {
    return undefined;
  }
  return data;
};

export const t = (
  path: NestedKeyOf<typeof fallbackLangData>,
  replacement?: { [key: string]: string | number } | null,
  fallback?: string,
) => {
  if (currentLang.code.startsWith(TEST_LANG_CODE)) {
    const name = replacement
      ? `${path}(${JSON.stringify(replacement).slice(1, -1)})`
      : path;
    return `\u{202a}[[${name}]]\u{202c}`;
  }

  const parts = path.split(".");
  let translation =
    findPartsForData(currentLangData, parts) ||
    findPartsForData(fallbackLangData, parts) ||
    fallback;
  if (translation === undefined) {
    const errorMessage = `Can't find translation for ${path}`;
    // in production, don't blow up the app on a missing translation key
    if (import.meta.env.PROD) {
      console.warn(errorMessage);
      return "";
    }
    throw new Error(errorMessage);
  }

  if (replacement) {
    for (const key in replacement) {
      translation = translation.replace(`{{${key}}}`, String(replacement[key]));
    }
  }
  return translation;
};


export function useTranslations(): (
      path: TranslationKeys,
      replacement?: { [key: string]: string | number } | null,
      fallback?: string,
  ) => string;



export function useTranslations<P extends TopLevelOrNestedPrefix>(prefix: P):(
      path: StripPrefix<TranslationKeys, P>,
      replacement?: { [key: string]: string | number } | null,
      fallback?: string,
  ) => string;


export function useTranslations(prefix?: string) {
  const localT = ((path: string, replacement?: { [key: string]: string | number } | null, fallback?: string) => {
    const fullPath = prefix ? `${prefix}.${String(path)}` : String(path);
    return t(fullPath as TranslationKeys, replacement, fallback);
  }) as unknown;

  return localT as any
}

export function useLocale() {
  return useUiStore(useShallow(state => state.langCode));
}

export {defaultLang, type Language, languages}