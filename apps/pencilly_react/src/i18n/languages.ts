import percentages from "@/i18n/locales/percentages.json";

export interface Language {
    code: string;
    label: string;
    rtl?: boolean;
    title: string
}

const COMPLETION_THRESHOLD = 85;


export const defaultLang = { code: "en", label: "English", title: "English" };

export const languages: Language[] = [
    defaultLang,
    ...[
        { code: "ar-SA", label: "العربية", rtl: true, title: "Arabic" },
        { code: "bg-BG", label: "Български", title: "Bulgarian" },
        { code: "ca-ES", label: "Català", title: "Catalan" },
        { code: "cs-CZ", label: "Česky", title: "Czech" },
        { code: "de-DE", label: "Deutsch", title: "German" },
        { code: "el-GR", label: "Ελληνικά", title: "Greek" },
        { code: "es-ES", label: "Español", title: "Spanish" },
        { code: "eu-ES", label: "Euskara", title:  "Basque" },
        { code: "fa-IR", label: "فارسی", rtl: true, title: "Persian" },
        { code: "fi-FI", label: "Suomi", title: "Finnish" },
        { code: "fr-FR", label: "Français", title: "French" },
        { code: "gl-ES", label: "Galego", title: "Galician" },
        { code: "he-IL", label: "עברית", rtl: true, title: "Hebrew" },
        { code: "hi-IN", label: "हिन्दी", title: "Hindi" },
        { code: "hu-HU", label: "Magyar", title: "Hungarian" },
        { code: "id-ID", label: "Bahasa Indonesia", title: "Indonesian" },
        { code: "it-IT", label: "Italiano", title: "Italian" },
        { code: "ja-JP", label: "日本語", title: "Japanese" },
        { code: "kab-KAB", label: "Taqbaylit", title: "Kabyle" },
        { code: "kk-KZ", label: "Қазақ тілі", title: "Kazakh" },
        { code: "ko-KR", label: "한국어", title: "Korean" },
        { code: "ku-TR", label: "Kurdî", rtl: true, title: "Kurdish" },
        { code: "lt-LT", label: "Lietuvių", title: "Lithuanian" },
        { code: "lv-LV", label: "Latviešu", title: "Latvian" },
        { code: "my-MM", label: "Burmese" , title: "Burmese"},
        { code: "nb-NO", label: "Norsk bokmål", title: "Norwegian Bokmål" },
        { code: "nl-NL", label: "Nederlands", title: "Dutch" },
        { code: "nn-NO", label: "Norsk nynorsk", title: "Norwegian Nynorsk" },
        { code: "oc-FR", label: "Occitan", title: "Occitan" },
        { code: "pa-IN", label: "ਪੰਜਾਬੀ" , title: "Punjabi"},
        { code: "pl-PL", label: "Polski", title: "Polish" },
        { code: "pt-BR", label: "Português Brasileiro" , title: "Brazilian Portuguese" },
        { code: "pt-PT", label: "Português", title: "Portuguese" },
        { code: "ro-RO", label: "Română" , title: "Romanian" },
        { code: "ru-RU", label: "Русский", title: "Russian" },
        { code: "sk-SK", label: "Slovenčina" , title: "Slovak" },
        { code: "sv-SE", label: "Svenska", title: "Swedish" },
        { code: "sl-SI", label: "Slovenščina", title: "Slovenian" },
        { code: "tr-TR", label: "Türkçe", title: "Turkish" },
        { code: "uk-UA", label: "Українська", title: "Ukrainian" },
        { code: "zh-CN", label: "简体中文", title: "Simplified Chinese" },
        { code: "zh-TW", label: "繁體中文", title: "Traditional Chinese" },
        { code: "vi-VN", label: "Tiếng Việt", title: "Vietnamese" },
        { code: "mr-IN", label: "मराठी", title: "Marathi" },
    ]
        .filter(
            lang =>
                (percentages as Record<string, number>)[lang.code] >=
                COMPLETION_THRESHOLD,
        )
        .sort((left, right) => (left.label > right.label ? 1 : -1)),
];
