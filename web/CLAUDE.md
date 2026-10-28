# CLAUDE.md

Guía para Claude Code (claude.ai/code) al trabajar en este repositorio.

## El proyecto

Sitio de marketing de **Alondra Music Academy**, una academia de música de
Miami-Dade y Broward que da **clases a domicilio**. Multipágina con forma de SPA:
Vite + React + TypeScript + shadcn-ui + Tailwind. En producción en
**alondrama.com** (vibox + Cloudflare Tunnel); el detalle de despliegue está en
`README.md`.

El sitio nació generado con **Lovable**, de donde viene parte de la estructura.
Hoy se trabaja en local contra este repo: `.lovable/` está gitignored y el brief
original no viaja aquí dentro.

La copy está gobernada por una estrategia de marketing con **límites explícitos
sobre lo que la academia puede afirmar** (ver **Disciplina de claims**). Trátalos
como requisitos de producto, no como preferencias de estilo. El material de la
estrategia (dossier, briefs, hojas de cálculo) vive fuera del repo, en
`../../../_assets/alondra/docs/`.

## Comandos

```sh
npm run dev          # Vite en http://localhost:8080 (host "::")
npm run dev:all      # Vite + el server Express a la vez (formularios funcionando)
npm run build        # build de producción a dist/
npm run build:dev    # build en modo development
npm run lint         # eslint sobre el repo
npm run test         # vitest, una pasada
npm run test:watch   # vitest en watch
npx vitest run src/test/routes.test.ts   # un solo fichero de test
npm run images       # optimiza originales → public/images/ (.webp), incremental
npm run images:watch # lo mismo, vigilando la carpeta de originales
npm run og           # regenera las imágenes Open Graph (1200x630)
```

El gestor de paquetes es **npm** (`package-lock.json` versionado).

**Pipeline de imágenes.** `scripts/optimize-images.mjs` (sharp) convierte los
originales a `.webp` en `public/images/`, conservando subcarpetas, y se refiere en
los componentes como `/images/<nombre>.webp`. Es incremental (salta lo que ya está
al día) y corre solo antes de `npm run build` por el script `prebuild`. Los
originales **no están en el repo** (pesaban 55 MB): viven en
`../../../_assets/alondra/imagenes/` y se pasan con
`IMAGES_SRC_DIR=../../../_assets/alondra/imagenes npm run images`. Sin esa
variable el script busca en `imagen-sources/`, que está vacía y gitignored.

Las Open Graph (`public/images/og/`) **sí se versionan** a propósito: las dibuja
una serif del sistema y un build en Linux usaría otra tipografía.

## Arquitectura

**Las rutas se generan de un único mapa, y el idioma va en la URL.**
`src/i18n/routes.ts` es la fuente de verdad: cada página tiene un `PageKey` y un
slug por idioma. El inglés vive en la raíz, el español bajo `/es`, el francés bajo
`/fr`, y los slugs están **localizados** para que cada versión pueda posicionar
por lo que la gente escribe en ese idioma (`/pricing`, `/es/precios`,
`/fr/tarifs`).

`src/App.tsx` envuelve todo en `MotionConfig` → `QueryClientProvider` →
`ThemeProvider` → `TooltipProvider` → `BrowserRouter` → `LanguageProvider`, monta
los dos toasters (`Toaster` de shadcn + `Sonner`), `ScrollToTop` y `RouteEffects`.
Los `<Route>` se generan iterando el mapa de rutas: no se escriben a mano.

- **Para añadir una página:** añade un `PageKey` con sus tres slugs en
  `routes.ts` y asocia la clave a un componente en el record `PAGES` de
  `App.tsx`. No hay que tocar nada más.
- **Para renombrar un slug:** añade la ruta vieja a `LEGACY_REDIRECTS` en
  `routes.ts` **y** a la tabla equivalente de `server/index.mjs`, o pierdes el
  posicionamiento y los enlaces entrantes de la URL antigua.
- **Nunca escribas una ruta a mano.** Usa `<PageLink to="pricing">`
  (`src/components/PageLink.tsx`), que resuelve la URL en el idioma actual del
  visitante. Un `<Link to="/pricing">` literal manda en silencio a un visitante
  español al sitio en inglés.

**Las páginas componen secciones.** `src/pages/*` son finas: cada una envuelve
`<Layout>` (Header + `<main>` animado + Footer) alrededor de componentes de
sección de `src/components/`. `Index.tsx` cose la portada (Hero, Stats,
GoogleReviews, Pedagogy, InstrumentsGrid, Formats, TeachersGrid, CoverageMap, FAQ,
CTABanner). Para cambiar el contenido de una página, edita el componente de
sección, no la página.

**La internacionalización es la preocupación transversal central.** El sitio es
trilingüe (en/es/fr). Toda la copy vive en `src/i18n/translations.ts` como un
`Dict` fuertemente tipado (el inglés es el tipo fuente; `es` y `fr` deben cuadrar
con su forma). Los componentes leen la copy con `const { t } = useLang()` (de
`src/i18n/LanguageContext.tsx`) e indexan en `t.*`. **Al añadir texto visible,
añade la clave al tipo `Dict` y rellena los tres idiomas — no escribas cadenas
sueltas en los componentes.**

El idioma sale del **prefijo de la URL**, no de un estado: `langFromPath()` lo
lee, `useLang()` expone `lang` y la `page` actual, y `setLang()` navega a la URL
de la misma página en el otro idioma. `localStorage` (`alondra-lang`) sólo
recuerda la preferencia; nunca manda sobre la URL, y `/` sirve siempre inglés para
que la URL canónica y su contenido no puedan contradecirse. Un enlace roto bajo
`/es/` sigue resolviendo como español, así que su 404 se renderiza en español.

**Los metadatos de SEO se escriben por ruta.** Esto es una SPA renderizada en el
cliente con un único `index.html`, así que `usePageMeta()` (`src/lib/pageMeta.ts`)
pone title, description, canonical, el juego de `hreflang` (más `x-default`),
Open Graph y Twitter en cada cambio de ruta, a partir de `t.meta[pageKey]`. En un
404 escribe un título de «no encontrado», añade `noindex` y **retira** canonical y
hreflang, para que una URL desconocida no pueda declararse como una página real.

**Los datos estructurados también.** `useStructuredData()`
(`src/lib/structuredData.ts`) inyecta un `<script type="application/ld+json">` por
ruta y lo retira en el 404, con la misma lógica que el canonical. El grafo sale
entero de `translations.ts`, así que viaja en el idioma de la página y no puede
contradecir a la copy: la academia como `["LocalBusiness", "EducationalOrganization"]`
con `areaServed` (lo que declara que Alondra es un negocio de **área de servicio**,
que se desplaza al domicilio y no tiene local), `WebSite`, la `WebPage` de la ruta,
migas en las internas, `FAQPage` en la portada, un `Course` por disciplina en
`/music-lessons`, el `Service` con los dos precios reales en `/pricing` y las
`Person` del equipo en `/about`.

**Los tipos se comprueban, no se deducen.** El grafo salió a producción con
`@type: "MusicSchool"`, que parece existir —por analogía con `MusicVenue` o
`MusicStore`— y schema.org no define. Un tipo inventado no se ignora: invalida
todas sus propiedades y arrastra a quien lo referencia. Antes de usar un tipo que
no hayas visto en el vocabulario, pásalo por `validator.schema.org`.

**No lleva `aggregateRating`, y es deliberado** — las directrices de Google
excluyen las *self-serving reviews*: la valoración del propio negocio, marcada en
su propio sitio, sobre reseñas recogidas en otra plataforma. Hay un test que lo
impide reintroducir. El razonamiento completo está en la cabecera del módulo.

**Un solo host público.** El túnel enruta `alondrama.com` y `www.alondrama.com`
al mismo contenedor, así que las cuatro variantes (http/https × apex/www)
respondían 200 con la misma página — Search Console llegó a marcar 24 URLs como
duplicadas por este motivo. `server/index.mjs` redirige con **301** cualquier
variante al apex en https, leyendo el esquema de `x-forwarded-proto` (detrás del
túnel el conector habla http con el contenedor). Sólo actúa sobre el dominio
público y sólo en GET/HEAD: localhost, la LAN y el preview de Tailscale siguen
sirviendo normal, y un 301 sobre un POST haría que el navegador lo reenviara como
GET y los formularios dejarían de funcionar.

`vite.config.ts` emite dos ficheros en el build desde ese mismo mapa de rutas,
para que no puedan desincronizarse: `sitemap.xml` (con alternates hreflang) y
`routes.json`. `server/index.mjs` lee `routes.json` para responder un **404 real**
en rutas desconocidas en vez de servir la SPA con un 200, que Google lee como un
soft 404. Si falta `routes.json`, el server cae a responder 200 en todo: una lista
de rutas obsoleta nunca debe tumbar el sitio.

**Analítica.** GA4 se carga desde `index.html`, con una guarda `ga-disable-*` para
que `npm run dev` en localhost no contamine los datos de producción. Como esto es
una SPA, la etiqueta sola sólo reportaría la página de entrada: `usePageviews()`
(`src/lib/analytics.ts`) emite un `page_view` en cada cambio de ruta posterior.
`track()`, en el mismo módulo, es un no-op seguro cuando gtag no está (bloqueador,
dev local). **Hoy `track()` no se llama desde ningún sitio: no hay eventos de
conversión instrumentados.**

**Los formularios van contra un backend de correo real.** `server/index.mjs` es un
Express (nodemailer sobre Gmail SMTP) que expone `POST /api/send-contact` y
`POST /api/send-application` (honeypot + validación + CV adjunto). `ContactForm` y
`ApplicationForm` hacen `fetch()` a esos endpoints con estados reales de
`sending`/`submitError`/éxito. `RegistrationWidget` embebe el planificador de
terceros **My Music Staff** en un iframe (desde `public/mms-widget.html`),
endurecido con skeleton de carga y fallback por timeout (`useIframeStatus`, que
usa también `CoverageMap`).

**El CTA del sitio es una llamada de descubrimiento gratuita de 15 minutos** (va a
contacto). La academia **no ofrece clases de prueba ni gratuitas**: fue una
decisión consciente, y «la primera clase gratis» de la competencia no es un modelo
a copiar aquí. No escribas copy, CTA ni diseño que insinúe una clase gratis.

**Capa de UI.** `src/components/ui/*` es el set estándar de shadcn-ui (primitivas
de Radix); en general no los edites, compónlos. `src/components/*` (los que no
están en `ui`) son las secciones propias. Iconos con `lucide-react`, animación con
`framer-motion`, andamiaje de datos con `@tanstack/react-query` (está puesto, pero
el sitio es estático).

## Disciplina de claims

El sitio publicó afirmaciones que la academia no puede sostener y se retiraron a
propósito. No las reintroduzcas, y aplica el mismo test a la copy nueva:
**¿habría un documento que lo respalde?**

- **Nunca** prometas resultados garantizados, beneficios cognitivos o clínicos,
  «el estándar de los mejores conservatorios del mundo», ni superlativos del tipo
  «la mejor academia de Miami».
- La cifra de «500+ estudiantes» es de **la carrera de Ilena**, nunca de la
  academia, que tiene un puñado de alumnos activos.
- La **musicoterapia** puede aparecer en las biografías de Ilena y Olivia como
  experiencia pasada, redactada en pasado. Nunca como servicio ofrecido ni como
  título en presente: la certificación de junta en EE. UU. (MT-BC) exige una
  credencial que no tienen.
- No anuncies recitales hasta que estén programados de verdad.
- Describe lo que **sí** hace el método de Alondra (técnica, ritmo, lectura
  musical, interpretación); nunca afirmes que otras academias no lo enseñan.
- `src/data/googleReviews.ts` guarda reseñas reales, una por idioma con su
  `originalLang`. Sólo se destacan reseñas de familias de verdad: quien tenga otra
  relación con la academia (profesores, colaboradores) no puede aparecer, y las
  traducciones se etiquetan como tales.

## Convenciones

- **Alias de ruta `@/` → `src/`** (configurado en `vite.config.ts`,
  `vitest.config.ts` y los `tsconfig`). Úsalo en todos los imports internos.
- **Estilos con Tailwind + variables CSS.** Los tokens de marca y las clases de
  componente propias viven en `src/index.css` (`@layer components`): usa
  `container`/`container-wide`/`container-full` para el ancho de página,
  `btn-cta`/`btn-outline` para botones, `eyebrow` para los kickers de sección. Los
  colores de marca son variables CSS en HSL (`--brand-purple`, `--brand-yellow`,
  `--brand-lavender`) expuestas por `tailwind.config.ts` (`primary`, `accent`,
  `lavender`…). Tipografías: `font-serif` (**Fraunces**) y `font-sans`
  (**Nunito**), cargadas con `@fontsource` en `main.tsx`. **El tema oscuro es el
  de arranque y es parte de la marca**: no pases el sitio a claro por defecto.
- **Tests** con Vitest + Testing Library en entorno jsdom; los globals están
  activados y `src/test/setup.ts` corre primero (matchers de jest-dom más
  polyfills de `matchMedia` e `IntersectionObserver`). Los ficheros de test
  encajan con `src/**/*.{test,spec}.{ts,tsx}`. El stub de `IntersectionObserver`
  reporta los elementos como visibles de forma **asíncrona**, igual que el real,
  así que comprueba un reveal con `whileInView` usando `waitFor`/`findBy*`, no un
  `getBy*` + `toBeVisible()` sincrónico.
- ESLint tiene `@typescript-eslint/no-unused-vars` **desactivado** y
  `react-refresh/only-export-components` como warning. Hay **3 errores
  preexistentes** (dos en `src/components/ui/`, boilerplate de shadcn, y uno en
  `tailwind.config.ts` por un `require()`): son esperados.
