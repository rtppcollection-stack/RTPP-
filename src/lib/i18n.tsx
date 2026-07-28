import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LANG_MAP, LANGUAGES, type LangCode, type LangInfo } from "./languages";
import { TRANSLATIONS, type TKey } from "./translations";

interface I18nCtx {
  lang: LangCode;
  info: LangInfo;
  setLang: (l: LangCode) => void;
  t: (key: TKey) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

function detect(): LangCode {
  if (typeof window === "undefined") return "my";
  const saved = localStorage.getItem("rtpp.lang") as LangCode | null;
  if (saved && LANG_MAP[saved]) return saved;
  const nav = navigator.language.toLowerCase();
  const codes: LangCode[] = ["my", "zh", "vi", "ru", "es", "tr", "ar", "id", "hi", "en"];
  for (const c of codes) if (nav.startsWith(c)) return c;
  if (nav.startsWith("in")) return "id";
  return "my";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("my");

  useEffect(() => {
    setLangState(detect());
  }, []);

  useEffect(() => {
    const info = LANG_MAP[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = info.dir ?? "ltr";
    localStorage.setItem("rtpp.lang", lang);
  }, [lang]);

  const value = useMemo<I18nCtx>(
    () => ({
      lang,
      info: LANG_MAP[lang],
      setLang: setLangState,
      t: (k) => TRANSLATIONS[lang][k] ?? TRANSLATIONS.en[k] ?? k,
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
