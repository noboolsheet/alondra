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
npm run dev          # Vite en http://localhost:8080 (sólo loopback)
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

**Los dos servidores escuchan sólo en loopback por defecto, y es a propósito.**
`vite.config.ts` ataba el de desarrollo a `host: "::"`, que en macOS son todas las
interfaces, IPv6 **y** IPv4: cualquier equipo de la misma wifi podía leer el árbol
entero de `web/` (código, `package-lock.json`, las notas internas de trabajo y
`cloudflared/config.yml` con el UUID del túnel), y con `npm run dev:all` alcanzaba
además los dos endpoints de correo por el proxy de `/api`. Ahora:

- `npm run dev` escucha en `localhost`. Para probar desde el móvil en la LAN,
  `VITE_HOST=:: npm run dev`, a sabiendas.
- `server/index.mjs` escucha en `BIND_HOST`, que por defecto es `127.0.0.1`. El
  contenedor necesita `0.0.0.0` para que la publicación de puertos de Docker
  alcance al proceso, y **lo pone el propio `Dockerfile`**, no el compose: así la
  imagen funciona siempre y un `npm run server` en el portátil no publica nada.
- `server.fs.deny` de Vite lleva `**/cloudflared/**` además de los tres patrones
  por defecto, que hay que repetir porque esa lista **reemplaza** la de Vite en vez
  de extenderla. El directorio vive dentro de la raíz de Vite porque `tunnel.sh`
  exige la credencial ahí, y su nombre no encaja con ningún patrón por defecto.

**La imagen corre como `node` (uid 1000) y las bases van fijadas por digest.**
Dos cosas que hay que respetar al tocar el `Dockerfile`:

- **`USER node` va después de todos los `COPY`.** Si se colara antes, los ficheros
  quedarían a nombre del usuario que atiende las peticiones y el proceso podría
  reescribir su propio código. Como está, el servidor no necesita escribir nada en
  runtime (lee `routes.json`, sirve `dist/`, y multer usa `memoryStorage`) y el
  puerto 3000 no pide privilegios.
- **Las dos etapas llevan el mismo digest de `node:22-alpine`.** Si difirieran, el
  build y el runtime podrían usar Nodes distintos. El conector del túnel va fijado
  igual en `cloudflared.docker-compose.yml`, y por eso `./tunnel.sh update` ya no
  actualiza solo: compara y te dice qué línea cambiar, porque subir de versión debe
  quedar versionado. El verbo antiguo sigue como `update-forzado`. Hay tests
  estáticos de las tres cosas en `src/test/build-context.test.ts`, y en
  `SECURITY.md` está cómo refrescar los digests.

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

`src/App.tsx` envuelve todo en `MotionConfig` → `ThemeProvider` →
`TooltipProvider` → `BrowserRouter` → `LanguageProvider`, monta
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

**Analítica.** GA4 se carga desde `index.html`, con una guarda `ga-disable-*` que
funciona por **lista blanca**: se apaga en cualquier hostname que no sea
`alondrama.com` o `www.alondrama.com`. Antes enumeraba los nombres locales, así
que abrir el sitio de desarrollo por la IP de la LAN o por el nombre de Tailscale
caía fuera de la lista y mandaba `page_view` y `generate_lead` **reales** a la
propiedad del cliente. Al revés es correcto en cualquier nombre futuro. Como esto es
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
`POST /api/send-application` (honeypot + validación + CV adjunto).

**Todo campo de formulario se coerce a string antes de usarlo** (`texto()`), y los
dos handlers van envueltos en `asyncRoute()`. `texto()` **no puede lanzar**, y eso
no es un detalle: la primera versión del arreglo coercionaba con `String(v)` a
secas, y eso tira `TypeError` con `{"toString": 0}` y con el objeto sin prototipo
que produce un nombre de campo multipart con corchetes (`name[a]=X`), o sea que el
propio arreglo era un sitio donde se lanzaba, desde una petición sin autenticar.
Un objeto o un array nunca es un campo válido: se descarta. `asyncRoute` es la red
que impide que un rechazo mate el proceso, pero no debe ser lo único que sostenga
esto. No es cosmética: un cuerpo JSON puede
traer cualquier tipo, el valor por defecto de una desestructuración sólo cubre
`undefined`, y `{"email": 1}` llegaba a `email.trim()`, lanzaba TypeError dentro de
un handler `async`, Express 4 descartaba el rechazo y Node 22 **mataba el proceso**.
Una petición sin autenticar tumbaba el sitio entero, y encima antes del apunte de
cuota, o sea sin límite de frecuencia. Hay test de regresión (`server.test.ts`): si
vuelve a fallar, lo que falla no es una validación, es la disponibilidad.

**La cuota de envíos tiene tres piezas y cada una responde a algo distinto:**

- **Tope global diario** (`SEND_MAX_DAY`), porque el recurso que se protege es el
  cupo **diario** de Gmail. Cincuenta por hora son hasta 1.200 al día: el tope
  horario podía no saltar nunca mientras el cupo se agotaba.
- **Tope global horario** (`SEND_MAX_TOTAL`), que acota una ráfaga.
- **Tope por identidad** (`SEND_MAX`), que **sólo se aplica desde
  `SEND_FAIR_FROM`**. La identidad sale de `cf-connecting-ip`, que el visitante
  elige en las vías que no pasan por Cloudflare (puerto publicado, tailnet,
  Funnel), así que si se aplicara siempre, llenar el cubo de otra persona le
  negaría el formulario habiendo cupo de sobra: el tope sería un arma. Con
  demanda real sí reparte. Consecuencia que conviene conocer: el tope efectivo
  para quien llega con el sitio en frío es `SEND_FAIR_FROM`, no `SEND_MAX`.
- **La cuota se devuelve si el envío no sale** (`refundSend`). El apunte va antes
  del `await` para que no haya ventana entre comprobar y apuntar, pero sin
  devolverlo un envío que el proveedor rechaza gastaba cupo igual. Con la ventana
  diaria eso era grave: unas 150 peticiones baratas en pocas horas, sin que
  saliera un solo correo, cerraban los dos formularios el resto del día. Y se
  autoinfligía tras un despliegue sin credenciales. La rama de «sin credenciales»
  sale antes del `try`, así que **también** tiene que devolver la marca.
- **Contador de intentos** aparte (`ATTEMPT_MAX`), apuntado **al entrar** en la
  candidatura. El corte previo a multer leía el contador de envíos, que sólo
  avanza en la ruta de éxito, así que una petición que siempre falla la validación
  no gastaba nada y el corte no podía saltar nunca: los 5 MB se buffereaban
  enteros antes de rechazarla. Su mapa se acota **expulsando la clave más
  antigua**, no con un tope global: un tope global que respondiera 429 a todos
  sería un interruptor de apagado accionable con 300 peticiones vacías, unas
  30.000 veces más barato que la avalancha de 5 MB que el contador encarece.
  `/api/send-contact` no lleva contador de intentos, y es deliberado: su cuerpo
  está acotado a 32 kB por `express.json`, así que una petición inválida cuesta
  poco. Si algún día ese endpoint acepta algo caro, hay que extenderlo.

**El adjunto no es lo único acotado.** multer recibía sólo `fileSize` y pasaba el
objeto a busboy tal cual, y busboy pone `Infinity` en `files`, `fields` y `parts`.
Ahora están declarados los siete límites, y el mapeo de errores da un código por
cada uno. Si añades un campo al formulario, mira `parts`/`fields`.

Si falla un envío, el log incluye los datos del lead (`docker logs`), porque no
están guardados en ningún otro sitio. `ContactForm` y
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

**La llamada cambia de destino según el tamaño de pantalla, y es a propósito**
(30-10-2026, decisión del dueño). Todas viven en `CallCta` (`src/components/`),
que es el único sitio donde tocarlo:

- **Móvil → WhatsApp.** El visitante ya tiene la app, escribir le cuesta un toque
  y rellenar un formulario a pulgar es por donde se cae.
- **Escritorio → `/contact`**, y allí elige entre escribir por WhatsApp o
  rellenar el formulario, que es el que emite `generate_lead`. Cuando los cuatro
  botones iban a WhatsApp ese evento dejó de dispararse: esto lo recupera sin
  perder la vía rápida en el teléfono.

El icono acompaña al **destino**, no a la marca: glifo de WhatsApp donde abre
WhatsApp, flecha donde navega dentro del sitio. Y lo que lleva icono de teléfono
marca de verdad (`tel:`): el recuadro de contactos y el pie, nada más.

`CallCta` pinta las dos variantes y esconde una con `sm:hidden`, no con
`useIsMobile`: las quince rutas se prerenderizan, y decidirlo en JavaScript
dejaría en el HTML la variante equivocada hasta que hidratara. El efecto
secundario es que en jsdom se ven las dos, así que el test de `/pricing` cuenta
**etiquetas distintas**, no nodos.

**El recuadro de contactos tiene las tres vías**: teléfono (`tel:`), correo y
WhatsApp, cada una con su icono. Sale en la portada y en `/contact`, que es el
mismo componente. En `/contact` vivía además un recuadro «contacto directo» al
lado del formulario que repetía esos mismos datos tres bloques más abajo; se
quitó.

**Capa de UI.** `src/components/ui/*` son primitivas de shadcn-ui (sobre Radix);
en general no los edites, compónlos. Están **sólo las siete que el sitio usa**
(`accordion`, `button`, `carousel`, `sonner`, `toast`, `toaster`, `tooltip`): las
otras 42 que venían con la plantilla de Lovable se borraron, y con ellas 36
dependencias que no entraban en el bundle pero sí en cada `npm ci` y en cada
`npm audit`. Si necesitas una, tráela de shadcn con su dependencia, no la
reconstruyas a mano. `src/components/*` (los que no
están en `ui`) son las secciones propias. Iconos con `lucide-react`, animación con
`framer-motion`, y nada de andamiaje de datos: el sitio es estático y
`@tanstack/react-query` se quitó al no tener una sola consulta.

## Seguridad

`SECURITY.md` recoge la postura: qué se revisó, qué hechos del despliegue están
comprobados contra el sitio vivo, los avisos de dependencias que **no** se arreglan
con el motivo de cada uno, y los riesgos que siguen abiertos. Lee ese fichero antes
de tocar los endpoints de correo, la cuota, el contexto de build o la configuración
del servidor de desarrollo: varias cosas que parecen descuidos están ahí
explicadas como decisiones, y una de ellas (el tope por identidad que sólo se
aplica con demanda) se rompe sola si se "arregla" sin leer el por qué.

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
- **`.dockerignore` y `.gitignore` protegen lo mismo para destinos distintos, y
  tienen que ir a la par.** El `Dockerfile` hace `COPY . .`, así que
  `.dockerignore` es el único filtro entre el árbol de trabajo y una capa de
  imagen. Se desincronizaron una vez: el commit que añadió la credencial del
  túnel a `.gitignore` no tocó `.dockerignore`, y en la máquina donde ese fichero
  existe entraba entera en la capa del builder. Hay un test que lo vigila
  (`src/test/build-context.test.ts`). Al marcar algo secreto en uno, márcalo en el
  otro.
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
  `react-refresh/only-export-components` como warning. Queda **1 error
  preexistente**, el `require()` de `tailwind.config.ts`: es esperado. Los otros
  dos vivían en componentes de `ui/` que ya no existen.
