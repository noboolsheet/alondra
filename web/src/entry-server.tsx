import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { AppProviders } from "./App";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { loadPage } from "./pages/registry";
import { alternatesFor, parsePath, pathFor, type PageKey } from "@/i18n/routes";
import { SITE_ORIGIN } from "@/lib/siteOrigin";
import { graphFor } from "@/lib/structuredData";
import { translations, type Lang } from "@/i18n/translations";

/**
 * Entrada de prerenderizado.
 *
 * El sitio es una SPA: el servidor manda un `index.html` vacío y el contenido lo
 * pone el navegador. Google lo ejecuta, con retraso; los rastreadores que
 * alimentan las respuestas generativas **no**, y para ellos alondrama.com es una
 * página en blanco. Esto renderiza en el build el HTML de las rutas que importan.
 *
 * No monta `<Routes>`: resuelve la página y la renderiza directamente, porque
 * `renderToString` no espera a un `lazy` y pintaría el esqueleto de carga. El
 * resto del árbol (proveedores, idioma) es exactamente el mismo que en el
 * navegador, así que lo prerenderizado y lo que ve un visitante no divergen.
 */
export async function render(path: string): Promise<string> {
  const match = parsePath(path);
  if (!match) throw new Error(`ruta desconocida: ${path}`);
  const Page = await loadPage(match.key);

  return renderToString(
    <AppProviders>
      <StaticRouter location={path}>
        <LanguageProvider>
          <Page />
        </LanguageProvider>
      </StaticRouter>
    </AppProviders>,
  );
}

/**
 * Qué se prerenderiza.
 *
 * Las cinco páginas donde se decide, no las once. Prerenderizar es el cambio con
 * más superficie de riesgo del proyecto, y el beneficio está concentrado: la
 * portada recibe el tráfico, y formatos, profesores, precios y contacto son el
 * recorrido completo de un padre que evalúa. El resto sigue sirviéndose como
 * hasta ahora. Para añadir una, basta con meter su clave aquí.
 */
export const PRERENDER: PageKey[] = ["home", "programs", "teachers", "registration", "contact"];

const LANGS: Lang[] = ["en", "es", "fr"];

export const prerenderPaths = (): string[] =>
  PRERENDER.flatMap((key) => LANGS.map((lang) => pathFor(key, lang)));

export interface Head {
  lang: Lang;
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  alternates: { lang: Lang; href: string }[];
  jsonLd: string;
}

/**
 * Los metadatos de la ruta, para escribirlos en el HTML del build.
 *
 * `usePageMeta` y `useStructuredData` los ponen desde un efecto, y los efectos no
 * corren al renderizar en el servidor: sin esto, el HTML prerenderizado llevaría
 * el título genérico de `index.html` en las quince rutas. Sale del mismo
 * diccionario que usa la aplicación, así que no puede contradecirla.
 */
export function headFor(path: string): Head {
  const match = parsePath(path);
  if (!match) throw new Error(`ruta desconocida: ${path}`);
  const { lang, key } = match;
  const t = translations[lang];
  const { title, description } = t.meta[key];

  return {
    lang,
    title,
    description,
    canonical: SITE_ORIGIN + pathFor(key, lang),
    ogImage: `${SITE_ORIGIN}/images/og/og-${lang}.jpg`,
    alternates: alternatesFor(key).map((a) => ({ lang: a.lang, href: SITE_ORIGIN + a.path })),
    jsonLd: JSON.stringify(graphFor(t, lang, key)).replace(/</g, "\\u003c"),
  };
}
