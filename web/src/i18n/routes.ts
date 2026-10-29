import type { Lang } from "./translations";

/**
 * Single source of truth for the site's URLs.
 *
 * Every page has one slug per language, and the language lives in the path:
 * English at the root (canonical default), Spanish under /es, French under /fr.
 * Slugs are localized so each version can rank for what people actually type in
 * that language — that is the whole point of the prefix, so don't "simplify" this
 * into one shared English slug.
 *
 * Add a page by adding a key here and a route in App.tsx; nothing else hardcodes
 * a path. Changing an existing slug means adding the old one to LEGACY_REDIRECTS
 * below, or you drop whatever ranking and inbound links it had.
 */

export type PageKey =
  | "home"
  | "programs"
  | "teachers"
  | "about"
  | "registration"
  | "enroll"
  | "careers"
  | "contact"
  | "privacy"
  | "cookies"
  | "legal";

/** Slug per page and language, WITHOUT the language prefix. "" is the home page. */
const SLUGS: Record<PageKey, Record<Lang, string>> = {
  home:         { en: "",                   es: "",                          fr: "" },
  programs:     { en: "music-lessons",      es: "clases-de-musica",          fr: "cours-de-musique" },
  teachers:     { en: "music-teachers",     es: "profesores",                fr: "professeurs" },
  about:        { en: "about",              es: "academia",                  fr: "academie" },
  registration: { en: "pricing",            es: "precios",                   fr: "tarifs" },
  enroll:       { en: "enrollment",         es: "inscripcion",               fr: "inscription" },
  careers:      { en: "music-teacher-jobs", es: "empleo-profesores-musica",  fr: "emplois-professeurs-musique" },
  contact:      { en: "contact",            es: "contacto",                  fr: "contact" },
  privacy:      { en: "privacy",            es: "privacidad",                fr: "confidentialite" },
  cookies:      { en: "cookies",            es: "cookies",                   fr: "cookies" },
  legal:        { en: "legal",              es: "aviso-legal",               fr: "mentions-legales" },
};

export const PAGE_KEYS = Object.keys(SLUGS) as PageKey[];

/** English is the canonical default and carries no prefix. */
export const DEFAULT_LANG: Lang = "en";
const PREFIX: Record<Lang, string> = { en: "", es: "/es", fr: "/fr" };

/** Absolute path for a page in a language, e.g. pathFor("programs", "es") → "/es/clases-de-musica". */
export const pathFor = (key: PageKey, lang: Lang): string => {
  const slug = SLUGS[key][lang];
  const prefix = PREFIX[lang];
  if (!slug) return prefix || "/";
  return `${prefix}/${slug}`;
};

/** Every language variant of a page — used for hreflang. */
export const alternatesFor = (key: PageKey): { lang: Lang; path: string }[] =>
  (Object.keys(PREFIX) as Lang[]).map((lang) => ({ lang, path: pathFor(key, lang) }));

/** Every URL on the site, for the sitemap. */
export const allPaths = (): { key: PageKey; lang: Lang; path: string }[] =>
  PAGE_KEYS.flatMap((key) =>
    (Object.keys(PREFIX) as Lang[]).map((lang) => ({ key, lang, path: pathFor(key, lang) })),
  );

const splitPath = (pathname: string) => {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const segments = clean.split("/").filter(Boolean);
  const lang: Lang = segments[0] === "es" || segments[0] === "fr" ? (segments.shift() as Lang) : DEFAULT_LANG;
  return { lang, slug: segments.join("/") };
};

/**
 * Language a pathname is in, from its prefix alone.
 *
 * Deliberately separate from parsePath: a broken link under /es/ is still a
 * Spanish URL, and its 404 must be in Spanish. Resolving the language only for
 * paths that match a known page would hand those visitors an English error page.
 */
export const langFromPath = (pathname: string): Lang => splitPath(pathname).lang;

/**
 * Resolve a pathname to its page. Returns null for unknown paths so the caller
 * can render the 404 (we never guess a page from a partial match).
 */
export const parsePath = (pathname: string): { lang: Lang; key: PageKey } | null => {
  const { lang, slug } = splitPath(pathname);
  const key = PAGE_KEYS.find((k) => SLUGS[k][lang] === slug);
  return key ? { lang, key } : null;
};

/**
 * Old paths kept alive as 301s. The site shipped with these, so they may sit in
 * Google's index, in Nextdoor posts and in WhatsApp threads. Never delete a row.
 */
export const LEGACY_REDIRECTS: Record<string, PageKey> = {
  "/programs": "programs",
  "/registration": "registration",
  "/careers": "careers",
};
