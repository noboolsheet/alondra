import { createContext, useContext, useEffect, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lang, translations } from "./translations";
import { langFromPath, PageKey, parsePath, pathFor } from "./routes";

interface Ctx {
  lang: Lang;
  /** Page currently rendered, or null on a 404. */
  page: PageKey | null;
  /** Switches language by navigating to the same page's URL in that language. */
  setLang: (l: Lang) => void;
  t: (typeof translations)["en"];
}

const LanguageContext = createContext<Ctx | null>(null);

const SUPPORTED: Lang[] = ["en", "es", "fr"];

/**
 * The URL is the single source of truth for language: /es/... is Spanish, /fr/...
 * is French, everything else is English. That is what makes each version its own
 * indexable page, so we deliberately do NOT auto-redirect a visitor to their
 * browser language — the URL they (or Google) requested is the one they get.
 *
 * The saved preference only decides where the language switcher takes a visitor
 * back to on their next visit; it never overrides the current URL.
 */
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Language comes from the URL prefix alone, so a broken link under /es/ still
  // renders its 404 in Spanish. The page may be null; the language never is.
  const lang = langFromPath(pathname);
  const page = parsePath(pathname)?.key ?? null;

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem("alondra-lang", lang);
    } catch {
      // Safari private mode and similar: remembering the choice is optional.
    }
  }, [lang]);

  const setLang = (next: Lang) => {
    if (!SUPPORTED.includes(next) || next === lang) return;
    // Stay on the same page, in the new language. On a 404 there is no equivalent
    // page to map to, so fall back to that language's home.
    navigate(pathFor(page ?? "home", next));
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, page, setLang, t }}>{children}</LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
};
