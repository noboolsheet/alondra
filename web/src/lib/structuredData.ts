import { useEffect } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { pathFor, type PageKey } from "@/i18n/routes";
import type { Dict, Lang } from "@/i18n/translations";
import { SITE_ORIGIN } from "./siteOrigin";

/**
 * Datos estructurados (JSON-LD) por ruta.
 *
 * Complementa a `usePageMeta`: ese hook escribe el <head> que lee una persona en
 * el resultado de búsqueda; esto escribe el que lee la máquina. Importa aquí más
 * de lo normal porque Alondra es un negocio de **área de servicio** —se desplaza
 * al domicilio, no tiene local al que entrar— y sin `areaServed` declarado Google
 * no tiene forma de saberlo: lo trataría como un negocio sin dirección, que es la
 * peor de las dos lecturas posibles.
 *
 * Todo sale de `translations.ts`, así que el grafo viaja en el idioma de la
 * página y no puede contradecir a la copy. Un solo <script> por ruta, reescrito
 * en cada navegación y **retirado en el 404**, igual que el canonical: una URL
 * que no existe no debe declararse como una página real.
 *
 * ── Qué NO está aquí, a propósito ────────────────────────────────────────────
 * **`aggregateRating` con las 18 reseñas de Google.** Es la pieza que falta a
 * ojos de cualquier auditoría de SEO, y está fuera por decisión: las directrices
 * de Google para fragmentos de reseña excluyen las *self-serving reviews*, que es
 * exactamente esto — la valoración del propio negocio, marcada en su propio
 * sitio, sobre reseñas recogidas en otra plataforma. En el mejor caso se ignora;
 * en el peor es una acción manual sobre todo el marcado del dominio. La
 * valoración ya la muestra Google en el perfil de empresa, que es su sitio.
 * Si algún día se recogen reseñas en el propio sitio, entonces sí.
 */

type JsonLd = Record<string, unknown>;

const ORG_ID = `${SITE_ORIGIN}/#organization`;
const SITE_ID = `${SITE_ORIGIN}/#website`;

/** Quita los marcadores `**negrita**` de la copy: el JSON-LD va en texto plano. */
const plain = (text: string) => text.replace(/\*\*(.+?)\*\*/g, "$1");

/** "$50" → 50. Devuelve null si la cadena no lleva un número. */
const priceOf = (price: string): number | null => {
  const digits = price.replace(/[^\d.]/g, "");
  return digits ? Number(digits) : null;
};

/** La academia atiende dos condados y se desplaza al domicilio del alumno. */
const areaServed = (t: Dict) => [
  { "@type": "AdministrativeArea", name: "Miami-Dade County, FL" },
  { "@type": "AdministrativeArea", name: "Broward County, FL" },
  ...t.coverage.cities.map((city) => ({ "@type": "City", name: city })),
];

/**
 * La academia, sin dirección de calle.
 *
 * El tipo es un par, y conviene saber por qué. `MusicSchool` **no existe** en
 * schema.org —parece que sí, por analogía con MusicVenue o MusicStore, pero el
 * vocabulario no lo define— y un tipo inventado no es que se ignore: invalida
 * todas las propiedades que cuelgan de él y arrastra a las referencias que lo
 * apuntan (`publisher`, `about`). Lo detectó el validador de schema.org.
 *
 * `EducationalOrganization` aporta la semántica de centro educativo, y
 * `LocalBusiness` es lo que hace legales `priceRange`, `currenciesAccepted` y
 * `openingHoursSpecification`, que sólo existen ahí. Los dos tipos a la vez son
 * JSON-LD válido y la forma estándar de describir una escuela que además es un
 * negocio local.
 *
 * Omitir `streetAddress` es deliberado y no un descuido: no hay local al que
 * acuda nadie, y publicar la dirección de casa de Ilena como si fuera una sede
 * sería a la vez falso y un problema de privacidad. La localidad y el
 * `areaServed` son lo que describe el negocio de verdad.
 */
const organization = (t: Dict, lang: Lang): JsonLd => ({
  "@type": ["LocalBusiness", "EducationalOrganization"],
  "@id": ORG_ID,
  name: "Alondra Music Academy",
  url: SITE_ORIGIN + pathFor("home", lang),
  description: plain(t.meta.home.description),
  logo: {
    "@type": "ImageObject",
    url: `${SITE_ORIGIN}/logo-minimal.png`,
  },
  image: `${SITE_ORIGIN}/images/og/og-${lang}.jpg`,
  telephone: t.contact.infoPhone,
  email: t.contact.infoEmail,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Miami",
    addressRegion: "FL",
    addressCountry: "US",
  },
  areaServed: areaServed(t),
  // Horario de atención al cliente: Lu–Sa 8:00–20:00, domingo cerrado. Son datos
  // estructurados, no copy: van en formato ISO y no se traducen.
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "20:00",
    },
  ],
  priceRange: "$35–$50",
  currenciesAccepted: "USD",
  knowsLanguage: ["en", "es", "fr"],
  founder: {
    "@type": "Person",
    name: t.teachers.director.name,
    jobTitle: t.teachers.director.role,
  },
  sameAs: [
    "https://www.instagram.com/alondra_music_academy/",
    "https://www.facebook.com/people/Alondra-Music-Academy/61590624003294/",
  ],
});

const website = (t: Dict, lang: Lang): JsonLd => ({
  "@type": "WebSite",
  "@id": SITE_ID,
  url: SITE_ORIGIN + pathFor("home", lang),
  name: "Alondra Music Academy",
  description: plain(t.meta.home.description),
  publisher: { "@id": ORG_ID },
  inLanguage: lang,
});

/** Migas: Inicio › Página. Sólo en páginas internas; en la portada no aporta. */
const breadcrumb = (t: Dict, lang: Lang, page: PageKey, url: string): JsonLd => ({
  "@type": "BreadcrumbList",
  "@id": `${url}#breadcrumb`,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: t.nav.home,
      item: SITE_ORIGIN + pathFor("home", lang),
    },
    { "@type": "ListItem", position: 2, name: plain(t.meta[page].title.split("|")[0].trim()) },
  ],
});

/** Las preguntas frecuentes viven en la portada (FAQ.tsx, montado en Index). */
const faqEntities = (t: Dict) =>
  t.faq.items.map((item) => ({
    "@type": "Question",
    name: plain(item.q),
    acceptedAnswer: { "@type": "Answer", text: plain(item.a) },
  }));

/**
 * Las disciplinas de /music-lessons como cursos.
 *
 * `teaches` lleva las cuatro dimensiones del método — técnica, ritmo, lectura e
 * interpretación — leídas de `pedagogy.pillars`, que es donde viven desde que la
 * sección «Método Alondra» sustituyó a los pilares antiguos.
 *
 * Esta propiedad estuvo deliberadamente ausente hasta hoy, y el motivo importa:
 * los pilares de entonces eran los beneficios cognitivos (memoria lógica,
 * psicomotricidad), y declararlos en `teaches` habría sido entregarle a Google
 * como dato estructurado justo lo que la disciplina de claims no permite
 * afirmar. Ahora los pilares describen lo que se trabaja en clase, así que la
 * propiedad dice la verdad y puede entrar.
 */
const courses = (t: Dict, lang: Lang, url: string): JsonLd[] =>
  t.programs.disciplines.map((d) => ({
    "@type": "Course",
    "@id": `${url}#course-${d.key}`,
    name: d.name,
    description: `${plain(d.tagline)} ${plain(d.focus)}`,
    provider: { "@id": ORG_ID },
    inLanguage: lang,
    courseMode: "onsite",
    teaches: t.pedagogy.pillars.map((pillar) => plain(pillar.title)),
    audience: { "@type": "EducationalAudience", educationalRole: "student" },
  }));

/** Los dos formatos de /pricing como oferta de servicio con su precio real. */
const lessonService = (t: Dict, lang: Lang, url: string): JsonLd => ({
  "@type": "Service",
  "@id": `${url}#service`,
  name: t.registration.hero.title,
  serviceType: plain(t.meta.programs.title.split("|")[0].split(":")[0].trim()),
  provider: { "@id": ORG_ID },
  areaServed: areaServed(t),
  availableLanguage: ["en", "es", "fr"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: t.registration.pricingTitle,
    itemListElement: t.registration.formats.flatMap((f) => {
      const price = priceOf(f.price);
      if (price === null) return [];
      return [
        {
          "@type": "Offer",
          name: f.name,
          description: plain(f.description),
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price,
            priceCurrency: "USD",
            unitText: t.registration.priceLabel.replace(/^[\s/]+/, ""),
          },
          availableAtOrFrom: { "@id": ORG_ID },
        },
      ];
    }),
  },
  inLanguage: lang,
});

/** El equipo de /about. Nombre, rol y foto: nada que no esté ya en la página. */
const people = (t: Dict): JsonLd[] =>
  [t.teachers.director, ...t.teachers.team].map((m) => ({
    "@type": "Person",
    "@id": `${SITE_ORIGIN}/#person-${m.slug}`,
    name: m.name,
    jobTitle: m.role,
    image: SITE_ORIGIN + m.photo,
    worksFor: { "@id": ORG_ID },
  }));

/** El grafo completo de una ruta. */
export const graphFor = (t: Dict, lang: Lang, page: PageKey): JsonLd => {
  const url = SITE_ORIGIN + pathFor(page, lang);
  const { title, description } = t.meta[page];

  // La portada es además la FAQPage: las preguntas están en ESTA página, y
  // declararlas en otra sería marcado sobre contenido que el visitante no ve.
  const isHome = page === "home";
  const pageTypes = isHome ? ["WebPage", "FAQPage"] : page === "contact" ? ["ContactPage"] : ["WebPage"];

  const webPage: JsonLd = {
    "@type": pageTypes.length === 1 ? pageTypes[0] : pageTypes,
    "@id": `${url}#webpage`,
    url,
    name: plain(title),
    description: plain(description),
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    inLanguage: lang,
    // Un string suelto aquí se interpreta como el NOMBRE de la imagen, no como
    // su URL: `primaryImageOfPage` espera un ImageObject.
    primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_ORIGIN}/images/og/og-${lang}.jpg` },
  };

  if (isHome) webPage.mainEntity = faqEntities(t);
  if (!isHome) webPage.breadcrumb = { "@id": `${url}#breadcrumb` };

  const graph: JsonLd[] = [organization(t, lang), website(t, lang), webPage];
  if (!isHome) graph.push(breadcrumb(t, lang, page, url));
  if (page === "programs") graph.push(...courses(t, lang, url));
  if (page === "registration") graph.push(lessonService(t, lang, url));
  if (page === "teachers") graph.push(...people(t));

  return { "@context": "https://schema.org", "@graph": graph };
};

const SCRIPT_SELECTOR = 'script[type="application/ld+json"][data-alondra]';

/**
 * Inyecta el grafo de la ruta actual y lo retira en el 404.
 *
 * Se llama desde `RouteEffects` en App.tsx, junto a `usePageMeta`.
 */
export const useStructuredData = () => {
  const { lang, page, t } = useLang();

  useEffect(() => {
    const existing = document.head.querySelector<HTMLScriptElement>(SCRIPT_SELECTOR);

    // URL desconocida: no hay entidad que describir. Dejar el grafo de la página
    // anterior le diría a Google que esta URL es esa otra página, justo lo que el
    // 404 del servidor acaba de negar.
    if (!page) {
      existing?.remove();
      return;
    }

    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.type = "application/ld+json";
      script.dataset.alondra = "";
      document.head.appendChild(script);
    }

    // Escapar "<" evita que una copy con `</script>` rompa el documento si este
    // JSON acaba alguna vez serializado dentro del HTML en lugar de por el DOM.
    script.textContent = JSON.stringify(graphFor(t, lang, page)).replace(/</g, "\\u003c");
  }, [lang, page, t]);
};
