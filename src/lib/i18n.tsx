import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LANG_MAP, LANGUAGES, type LangCode, type LangInfo } from "./languages";
import { TRANSLATIONS } from "./translations";

// Load all JSON translation files from src/locales/ synchronously via Vite eager glob
const localeFiles = import.meta.glob<{ default: Record<string, string | Record<string, string>> }>(
  "../locales/*.json",
  {
    eager: true,
  },
);

const LOCALES: Record<string, Record<string, unknown>> = {};
for (const path in localeFiles) {
  const match = path.match(/\/locales\/([a-z]+)\.json$/);
  if (match) {
    const langCode = match[1];
    LOCALES[langCode] = (localeFiles[path].default || localeFiles[path]) as Record<string, unknown>;
  }
}

function getValueByPath(
  obj: Record<string, unknown> | undefined,
  path: string,
): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  if (typeof obj[path] === "string") return obj[path] as string;

  const parts = path.split(".");
  let curr: unknown = obj;
  for (const part of parts) {
    if (curr && typeof curr === "object" && part in (curr as Record<string, unknown>)) {
      curr = (curr as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof curr === "string" ? curr : undefined;
}

interface I18nCtx {
  lang: LangCode;
  info: LangInfo;
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

function detect(): LangCode {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("rtpp.lang") as LangCode | null;
  if (saved && LANG_MAP[saved]) return saved;
  const nav = navigator.language.toLowerCase();
  const codes: LangCode[] = [
    "en",
    "my",
    "zh",
    "ja",
    "ko",
    "es",
    "vi",
    "ru",
    "tr",
    "ar",
    "id",
    "hi",
  ];
  for (const c of codes) {
    if (nav.startsWith(c)) return c;
  }
  if (nav.startsWith("in")) return "id";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    setLangState(detect());
  }, []);

  useEffect(() => {
    const info = LANG_MAP[lang] ?? LANG_MAP.en;
    document.documentElement.lang = lang;
    document.documentElement.dir = info.dir ?? "ltr";
    localStorage.setItem("rtpp.lang", lang);
  }, [lang]);

  const value = useMemo<I18nCtx>(
    () => ({
      lang,
      info: LANG_MAP[lang] ?? LANG_MAP.en,
      setLang: setLangState,
      t: (k: string) => {
        const currentLocale = LOCALES[lang];
        const enLocale = LOCALES.en;

        const val = getValueByPath(currentLocale, k);
        if (val !== undefined) return val;

        const enVal = getValueByPath(enLocale, k);
        if (enVal !== undefined) return enVal;

        const langDict = TRANSLATIONS[lang] as Record<string, string> | undefined;
        const enDict = TRANSLATIONS.en as Record<string, string> | undefined;
        const legacyVal = langDict?.[k] ?? enDict?.[k];
        if (legacyVal !== undefined) return legacyVal;

        return k;
      },
    }),
    [lang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be inside I18nProvider");
  return c;
}

export { LANGUAGES };
