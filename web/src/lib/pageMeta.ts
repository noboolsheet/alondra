import { useEffect } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { alternatesFor, DEFAULT_LANG, pathFor } from "@/i18n/routes";

export { SITE_ORIGIN } from "./siteOrigin";
import { SITE_ORIGIN } from "./siteOrigin";

const upsertMeta = (selector: string, attrs: Record<string, string>) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
};

const upsertLink = (rel: string, href: string, hreflang?: string) => {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
};

const removeAll = (selector: string) =>
  document.head.querySelectorAll(selector).forEach((el) => el.remove());

/**
 * Gives the current page its own <head>.
 *
 * This is a client-rendered SPA, so index.html ships one static title and
 * description for all nine routes. Without this hook Google sees nine copies of
 * the same document and none of them can rank for anything specific — and GA4's
 * default "Pages and screens" report, which keys on page title, collapses the
 * whole site into a single row.
 *
 * It also emits the canonical URL and the hreflang set, which is what stops the
 * three language versions of a page from competing with each other.
 */
export const usePageMeta = () => {
  const { lang, page, t } = useLang();

  useEffect(() => {
    // Unknown URL: say so everywhere, not just in the page body. Leaving the
    // previous page's head in place makes a broken link look like a real page —
    // the tab would still read "Pricing" while the body says 404 — and the stale
    // canonical would tell Google this URL *is* the pricing page, undoing the 404
    // the server just returned.
    if (!page) {
      document.title = `${t.notFound.title} · Alondra Music Academy`;
      upsertMeta('meta[name="description"]', { name: "description", content: t.notFound.body });
      upsertMeta('meta[name="robots"]', { name: "robots", content: "noindex, follow" });
      upsertMeta('meta[property="og:title"]', { property: "og:title", content: t.notFound.title });
      upsertMeta('meta[property="og:description"]', { property: "og:description", content: t.notFound.body });
      upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: t.notFound.title });
      upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: t.notFound.body });
      // A page that does not exist must not claim to be another one.
      removeAll('link[rel="canonical"], link[rel="alternate"], meta[property="og:url"]');
      return;
    }

    // Coming back from a 404: this is a real, indexable page again.
    removeAll('meta[name="robots"]');

    const { title, description } = t.meta[page];
    const url = SITE_ORIGIN + pathFor(page, lang);

    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: description });

    // Open Graph / Twitter, so a shared link previews in the right language.
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: lang });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });

    // Preview image, per language. Acquisition runs on links pasted into
    // Nextdoor, WhatsApp and Facebook; without this they preview as bare text.
    const ogImage = `${SITE_ORIGIN}/images/og/og-${lang}.jpg`;
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: ogImage });
    upsertMeta('meta[property="og:image:width"]', { property: "og:image:width", content: "1200" });
    upsertMeta('meta[property="og:image:height"]', { property: "og:image:height", content: "630" });
    upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: title });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: ogImage });

    upsertLink("canonical", url);
    for (const alt of alternatesFor(page)) {
      upsertLink("alternate", SITE_ORIGIN + alt.path, alt.lang);
    }
    // x-default points at the version to serve when no language matches.
    upsertLink("alternate", SITE_ORIGIN + pathFor(page, DEFAULT_LANG), "x-default");
  }, [lang, page, t]);
};
