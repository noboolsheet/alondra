import { forwardRef, ComponentPropsWithoutRef } from "react";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import { PageKey, pathFor } from "@/i18n/routes";

type Props = Omit<ComponentPropsWithoutRef<typeof Link>, "to"> & {
  /** Page to link to. The URL is resolved in the current language. */
  to: PageKey;
  /** Optional #anchor appended to the resolved path. */
  hash?: string;
};

/**
 * Internal link that keeps the visitor in their language.
 *
 * Paths are localized (/pricing, /es/precios, /fr/tarifs), so a hardcoded
 * `<Link to="/pricing">` would silently bounce a Spanish visitor into the English
 * site. Link by page key and let this resolve the URL.
 */
export const PageLink = forwardRef<HTMLAnchorElement, Props>(({ to, hash, ...rest }, ref) => {
  const { lang } = useLang();
  const path = pathFor(to, lang);
  return <Link ref={ref} to={hash ? `${path}#${hash}` : path} {...rest} />;
});

PageLink.displayName = "PageLink";
