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
GoogleReviews, TeachersGrid, Pedagogy, InstrumentsGrid, CoverageMap, StepUp,
FAQ, CTABanner). Para cambiar el contenido de una página, edita el
componente de sección, no la página.

**El orden de la portada no es arbitrario y está razonado en la cabecera de
`Index.tsx`.** El profesorado estaba octavo, a unos 8.500 px del hero: el miedo
real de un padre («quién entra en mi casa») quedaba detrás del método, las
disciplinas, los formatos y la beca. Ahora va cuarto, justo después de las
reseñas, y como `TeachersGrid` trae su propio dorado hay un punto de conversión
al 35% de la página en vez de al 62%. `StepUp` baja al noveno puesto: es la
respuesta a la objeción del precio y no debe interrumpir antes de que el
visitante haya conocido a nadie. Si mueves una sección, actualiza las dos
listas.

**Las disciplinas y los formatos son una sola sección.** `InstrumentsGrid` lleva
las dos: la tira de pastillas de las siete disciplinas y, debajo y en peso menor,
los tres formatos con su nombre y a quién van dirigidos. Eran dos secciones
seguidas con la misma construcción de tarjeta y sumaban 2,3 pantallas de móvil;
con `StepUp` eran tres rejillas idénticas, que es lo que DESIGN.md §6 pide no
hacer. El cuerpo de cada formato vive sólo en `/music-lessons`. `Formats.tsx` se
borró: su contenido está aquí y el historial lo conserva.

**`StepUp` tiene dos formas.** `<StepUp compact />` en la portada (titular, frase
y enlace a `/pricing`) y `<StepUp />` entero en `/pricing`. La objeción del precio
no debe costar 1,8 pantallas en una página donde el visitante todavía no sabe lo
que vale una clase.

**El ritmo vertical tiene tres niveles, a propósito.** Las nueve secciones usaban
`py-20 md:py-28` idéntico, y el efecto era que ninguna parecía más importante que
otra. Ahora: `py-24 md:py-32` en lo que convierte y es corto (reseñas),
`py-16 md:py-20` en lo que apoya (método, cobertura, FAQ) y `py-12 md:py-16` en
lo compacto (catálogo, Step Up). Si añades una sección, decide en qué nivel va.

**Cada contenido tiene una página y sólo una.** El reparto de octubre de 2026
deshizo tres mezclas que habían salido a producción, y conviene no rehacerlas:

- **`/music-teachers`** (`es: /profesores`, `fr: /professeurs`) es la página del
  profesorado: el retrato de la directora, las fichas del equipo y las
  **biografías completas**. Antes el acordeón de biografías se montaba al final
  de `/music-teacher-jobs`, la página de empleo, y ahí apuntaban todos los «ver
  más» de la portada y de la academia: un padre acababa en un anuncio de trabajo.
  `/about` enlaza aquí con una tarjeta y **no** vuelve a pintar el equipo.
- **`/pricing`** es sólo precio: tarifas, duración de clase, descuentos y Step Up.
  **`/enrollment`** (`es: /inscripcion`, `fr: /inscription`) es el cierre: pasos,
  contrato y el widget de My Music Staff. Compartían página, con los pasos
  **antes** del precio y el iframe de un tercero cargando para quien sólo venía a
  comparar. Ése es además el sitio donde tendrá que ir la puerta del
  consentimiento de cookies, y por eso no debe volver a `/pricing`.
- **Las siete disciplinas tienen una sola fuente: `t.programs.disciplines`.**
  Había dos juegos con el mismo `tagline` y el mismo `focus` (`t.instruments.items`
  era el otro) y sólo uno viajaba al JSON-LD. La portada muestra una tira de
  chips que enlaza a `#instrument-<key>` en `/music-lessons`, donde cada ficha es
  un **desplegable en la página** y no un modal: el texto más específico del
  sitio estaba detrás de un clic que un rastreador no da. `t.instruments` sólo
  conserva el titular de esa tira.
- Los iconos de disciplina y de formato viven en `src/lib/icons.ts`, indexados
  **por clave**. Estaban duplicados en tres componentes y uno indexaba por
  posición, así que reordenar el diccionario cambiaba los iconos en silencio.

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

**El build prerenderiza las cinco páginas que deciden.** `npm run build` corre
`vite build` y después `scripts/prerender.mjs`, que hace un build de servidor de
`src/entry-server.tsx` y escribe **un fichero HTML por ruta conocida**: portada,
formatos, profesores, precios y contacto llevan la página entera dentro, en los
tres idiomas; las 18 restantes llevan sólo sus metadatos. El motivo no es Google,
que ejecuta JavaScript aunque con retraso: son los rastreadores que alimentan las
respuestas generativas, que **no lo ejecutan**, y para los que el sitio era una
página en blanco.

Tres cosas que hay que respetar al tocar esto:

- **`express.static` va con `redirect: false`.** Con el valor por defecto, una
  petición a `/music-teachers` encuentra el directorio del mismo nombre y
  responde un 301 a `/music-teachers/`, que el middleware de barra final devuelve
  a `/music-teachers`: bucle infinito. El HTML de cada ruta lo elige `htmlFor()`
  en `server/index.mjs`, nunca el servidor de estáticos.
- **Lo desconocido se sirve desde `404.html`**, un esqueleto con `noindex`. Antes
  se servía `index.html`, que desde el prerenderizado es la portada con su
  contenido y su canonical dentro: una URL inventada se habría anunciado como la
  portada, que hace más daño que no tener canonical.
- **Una página nueva en `lazy()` no se prerenderiza sola.** `renderToString` no
  espera a la promesa de un `lazy`, así que escribiría el esqueleto de carga en
  vez de la página, y el fichero se generaría igual y pesaría parecido. Por eso
  `src/pages/registry.ts` expone `loadPage()` además de `PAGES`, y hay un test
  (`src/test/prerender.test.tsx`) que comprueba que el HTML trae texto de verdad.

**Los metadatos de SEO se escriben también por ruta en el cliente.** `usePageMeta()` (`src/lib/pageMeta.ts`)
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
`Person` del equipo en `/music-teachers` (donde se renderizan de verdad: estaban
declaradas en `/about`, que ya no las muestra, y hay un test que lo impide
reintroducir).

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
soft 404, y es además la lista de la que el prerenderizado saca qué ficheros
escribir. Si falta `routes.json`, el server cae a responder 200 en todo: una lista
de rutas obsoleta nunca debe tumbar el sitio.

**Cabeceras de seguridad.** `server/index.mjs` manda `frame-ancestors 'self'`
(más `X-Frame-Options` para los navegadores antiguos), `nosniff`,
`Referrer-Policy` y `Permissions-Policy` en todas las respuestas, y HSTS **sólo**
en el dominio público sobre https. Dos cosas que conviene no tocar sin leer: la
CSP lleva a propósito **una sola directiva**, porque una completa tendría que
autorizar gtag, el script de My Music Staff, los estilos en línea de
framer-motion y los scripts en línea de `index.html`, y equivocarse ahí rompe el
sitio en silencio; y `frame-ancestors` es `'self'` y no `'none'` porque el widget
vive en un iframe del propio dominio y con `'none'` se bloquearía a sí mismo.

**Terceros y consentimiento: el sitio NO pide consentimiento de cookies, y es
deliberado.** No hay banner ni CMP, y la política de cookies no afirma que lo
haya: remite a los ajustes del navegador y a la exclusión de Google Analytics,
que es lo que de verdad ofrece. El negocio es de Florida y su público son
familias de Miami-Dade y Broward; Estados Unidos no exige consentimiento previo
y la ley de privacidad de Florida sólo alcanza a empresas desde mil millones de
ingresos. Antes de «arreglarlo» añadiendo un banner, lee la tarea del artefacto:
cuesta conversión en un sitio cuyo problema declarado es que llegan pocos leads.

Lo que sí conviene saber es qué carga sin preguntar, porque la lista tiene que
seguir siendo corta y conocida:

| Tercero | Dónde | Cuándo |
|---|---|---|
| `gtag.js` de Google Analytics (542 KB) | todas | al cargar |
| iframe del mapa de Google | portada y contacto | con `loading="lazy"`, al acercarse |
| iframe de My Music Staff | `/enrollment` | con `loading="lazy"`, al acercarse |

Los enlaces a WhatsApp, Instagram y Facebook son `<a href>`: no cargan nada ni
ponen cookies. El servidor no manda ninguna cabecera `Set-Cookie` propia; el
idioma y el tema viven en `localStorage`, que es almacenamiento funcional de
primera parte. **Si añades un tercero que cargue solo, apunta aquí por qué.**

**Analítica.** GA4 se carga desde `index.html`, con una guarda `ga-disable-*` para
que `npm run dev` en localhost no contamine los datos de producción. Como esto es
una SPA, la etiqueta sola sólo reportaría la página de entrada: `usePageviews()`
(`src/lib/analytics.ts`) emite un `page_view` en cada cambio de ruta posterior.
`track()`, en el mismo módulo, es un no-op seguro cuando gtag no está (bloqueador,
dev local).

**Las conversiones se miden con seis eventos.** `useTrack()` añade solos el idioma
y la página; `useOutboundTracking()` (montado en `RouteEffects`) registra con **un
único listener delegado** los clics a WhatsApp, teléfono y correo — la alternativa
eran quince `onClick` repartidos por siete componentes, y la número dieciséis se
olvida. Cada enlace saliente lleva un `data-track-loc` con su origen (`hero`,
`header`, `footer`, `coverage`, `widget`, `contact_page`): sin ese parámetro sabes
que hubo 40 clics a WhatsApp pero no de dónde salieron, que es lo que decide dónde
va el botón. Los formularios emiten `generate_lead` y `application_submit`
**en la respuesta OK del fetch**, nunca en el clic del botón, o se contarían como
leads los envíos que fallaron. Falta la parte de consola, que no es código:
marcar los eventos clave y registrar `lang`, `page` y `location` como dimensiones
personalizadas — que no son retroactivas.

Para probarlos en local, `?ga=on` levanta la guarda de localhost y enciende
`debug_mode`, así que los eventos aparecen en DebugView sin ensuciar producción.

**Los formularios van contra un backend de correo real.** `server/index.mjs` es un
Express (nodemailer sobre Gmail SMTP) que expone `POST /api/send-contact` y
`POST /api/send-application` (honeypot + validación + CV adjunto). `ContactForm` y
`ApplicationForm` hacen `fetch()` a esos endpoints con estados reales de
`sending`/`submitError`/éxito. `RegistrationWidget` embebe el planificador de
terceros **My Music Staff** en un iframe (desde `public/mms-widget.html`),
endurecido con skeleton de carga y fallback por timeout (`useIframeStatus`, que
usa también `CoverageMap`).

**El timeout de `useIframeStatus` arranca cuando el embed entra en pantalla, no al
montar.** Los dos iframes llevan `loading="lazy"`, así que el navegador no los pide
hasta que el visitante se acerca; con el reloj corriendo desde el montaje, el mapa
de la portada (que está al final de la página) anunciaba «no se puede cargar» un
mapa que nunca se había llegado a pedir, mientras el de contacto, que está arriba,
funcionaba. Por eso el llamante pasa `containerRef` al envoltorio del iframe: si lo
olvida, el hook cae al comportamiento antiguo tras un tick de gracia, pero vuelve
el fallo. Y armar no reescribe el estado, o el esqueleto parpadearía encima de un
embed ya cargado.

**El CTA del sitio es una llamada de descubrimiento gratuita.** La academia **no
ofrece clases de prueba ni gratuitas**: fue una decisión consciente, y «la primera
clase gratis» de la competencia no es un modelo a copiar aquí. No escribas copy,
CTA ni diseño que insinúe una clase gratis.

**El CTA del hero abre WhatsApp, en los dos tamaños y con la misma etiqueta**
(30-10-2026, decisión del dueño). Antes el móvil abría WhatsApp y el escritorio
llevaba al formulario de contacto, con etiquetas distintas a propósito para que
las mismas palabras no prometieran el mismo destino y entregaran dos. Ahora los
dos van al mismo sitio, así que la etiqueta es una sola y quien dice adónde va es
el icono de WhatsApp. El resto de llamadas de la portada (profesores, cierre,
barra fija) siguen yendo a `/contact`, que es el embudo que mide `generate_lead`.

**`StickyCallBar` da la llamada al pulgar en móvil.** La portada mide unas
dieciséis pantallas a 390 px y la única acción permanente era la píldora de
WhatsApp de la cabecera, arriba y fuera del arco del pulgar. La barra sale sólo
por debajo de `sm`, aparece cuando el hero ya se ha ido y **se retira al llegar
al cierre**, que lleva su propio dorado: dos llamadas idénticas a la vez obligan
a elegir entre lo mismo, y por eso tampoco hace falta compensar con relleno
abajo. Emite `cta_click` con `location: "sticky_mobile"`, etiqueta nueva en GA4.

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
- **Excepción explícita y única: el titular del hero.** «Dale a tu hijo el
  superpoder de la música. Descubre su potencial hoy mismo» se retiró en
  `87add42` por prometer un beneficio, y el **30-10-2026 el dueño pidió reponerlo:
  es el titular que quiere Ilena**. No lo vuelvas a quitar por disciplina de
  claims sin hablarlo con ella. La excepción es ese titular y nada más: no abre
  la puerta a otras promesas de beneficio en copy nueva.
- La cifra de «500+ estudiantes» es de **la carrera de Ilena**, nunca de la
  academia, que tiene un puñado de alumnos activos.
- La **musicoterapia** puede aparecer en las biografías de Ilena y Olivia como
  experiencia pasada, redactada en pasado. Nunca como servicio ofrecido ni como
  título en presente: la certificación de junta en EE. UU. (MT-BC) exige una
  credencial que no tienen.
- No anuncies recitales hasta que estén programados de verdad.
- Describe lo que **sí** hace el método de Alondra (técnica, ritmo, lectura
  musical, interpretación); nunca afirmes que otras academias no lo enseñan.
  Esas cuatro dimensiones viven en `pedagogy.pillars` y **viajan al JSON-LD**
  como `teaches` de cada `Course`: lo que se escriba ahí deja de ser copy y
  pasa a ser un dato que le entregas a Google. Antes eran los beneficios
  cognitivos, y por eso la propiedad estuvo deliberadamente ausente.
- `src/data/googleReviews.ts` guarda reseñas reales, una por idioma con su
  `originalLang`. Sólo se destacan reseñas de familias de verdad: quien tenga otra
  relación con la academia (profesores, colaboradores) no puede aparecer, y las
  traducciones se etiquetan como tales. Lo que la FTC exige es que la relación se
  **revele**, así que una reseña que la declara dentro de su propio texto («conozco
  a Ilena desde siempre») puede publicarse tal cual; lo que no vale es que no la
  revele nadie.
- Una reseña larga (más de `LONG_REVIEW_CHARS` en `GoogleReviews.tsx`) no se
  recorta en el dato: se pinta como texto corrido, plegada, con un botón para
  leerla entera. El original nunca se toca.

## Convenciones

- **Nada de raya larga (—) en la copy.** Ni en `translations.ts`, ni en reseñas,
  ni en nada que lea un visitante: delata que el texto lo escribió una IA, y
  «que no parezca de IA» es un requisito explícito de este sitio. Usa coma, dos
  puntos, punto y coma, paréntesis o punto. La **semirraya (–) sí se queda** en
  rangos reales (`Lun–Sáb`, `1–3 meses`, `$35–$50`). En comentarios de código da
  igual. Comprobación: `grep -c '—' src/i18n/translations.ts` debe dar **0**.
- **Las reseñas en su idioma original no se tocan.** Ni erratas, ni puntuación:
  son palabras textuales de una clienta y alterarlas es territorio de la FTC.
  Sus traducciones sí se pueden ajustar.
- **Alias de ruta `@/` → `src/`** (configurado en `vite.config.ts`,
  `vitest.config.ts` y los `tsconfig`). Úsalo en todos los imports internos.
- **Estilos con Tailwind + variables CSS.** Los tokens de marca y las clases de
  componente propias viven en `src/index.css` (`@layer components`): usa
  `container`/`container-wide`/`container-full` para el ancho de página,
  `btn-cta`/`btn-outline` para botones, `eyebrow` para los kickers de sección. Los
  colores de marca son variables CSS en HSL (`--brand-purple`, `--brand-yellow`,
  `--brand-lavender`) expuestas por `tailwind.config.ts` (`primary`, `accent`,
  `lavender`…). Tipografías: `font-serif` (**Fraunces**) y `font-sans`
  (**Nunito**), cargadas con `@fontsource` en `main.tsx` y servidas desde el
  propio dominio: 34 `.woff2` en `dist/assets/`. **No las cambies al CDN de
  Google Fonts**, aunque parezca que ahorra peso. Pedir una fuente a
  `fonts.gstatic.com` manda la IP del visitante a Google antes de que haya
  aceptado nada, que es el caso que han sancionado en Europa, y es justo el
  único tercero que hoy este sitio no tiene. Comprobación:
  `grep -rl 'fonts.googleapis\|fonts.gstatic' dist/` no debe devolver nada. **El tema oscuro es el
  de arranque y es parte de la marca**: no pases el sitio a claro por defecto.
- **Tests** con Vitest + Testing Library en entorno jsdom; los globals están
  activados y `src/test/setup.ts` corre primero (matchers de jest-dom más
  polyfills de `matchMedia`, `IntersectionObserver` y `ResizeObserver`, este
  último porque Embla lo pide al montar el carrusel de `/about`). Los ficheros de test
  encajan con `src/**/*.{test,spec}.{ts,tsx}`. El stub de `IntersectionObserver`
  reporta los elementos como visibles de forma **asíncrona**, igual que el real,
  así que comprueba un reveal con `whileInView` usando `waitFor`/`findBy*`, no un
  `getBy*` + `toBeVisible()` sincrónico.
- ESLint tiene `@typescript-eslint/no-unused-vars` **desactivado** y
  `react-refresh/only-export-components` como warning. Hay **3 errores
  preexistentes** (dos en `src/components/ui/`, boilerplate de shadcn, y uno en
  `tailwind.config.ts` por un `require()`): son esperados.
