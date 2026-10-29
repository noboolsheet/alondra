import { build } from "vite";
import react from "@vitejs/plugin-react-swc";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Prerenderiza en el build las rutas que importan.
 *
 * El sitio es una SPA: el servidor manda un `index.html` vacío y el contenido lo
 * pone el navegador. Google lo ejecuta, con retraso y menos fiabilidad; los
 * rastreadores que alimentan las respuestas generativas **no lo ejecutan**, y
 * para ellos alondrama.com era una página en blanco. Esto escribe el HTML ya
 * renderizado de cada ruta, con su título, su canonical, sus hreflang y su
 * JSON-LD dentro.
 *
 * El Express no necesita cambios: `express.static` sirve `dist/<ruta>/index.html`
 * cuando existe, y lo que no esté prerenderizado sigue cayendo en el catch-all
 * de la SPA exactamente como antes.
 */
const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");
const SSR_DIR = path.join(ROOT, ".ssr-build");

const buildSsrBundle = async () => {
  // Sin `vite.config.ts`: su `manualChunks` parte react y framer-motion en trozos
  // cacheables para el navegador, y en un build de servidor esas dependencias son
  // externas, así que rollup se niega a trocear lo que no empaqueta. Aquí sólo
  // hacen falta el plugin de React y el alias `@/`.
  await build({
    configFile: false,
    root: ROOT,
    logLevel: "warn",
    resolve: { alias: { "@": path.join(ROOT, "src") } },
    plugins: [react()],
    build: {
      ssr: path.join(ROOT, "src/entry-server.tsx"),
      outDir: SSR_DIR,
      emptyOutDir: true,
      cssCodeSplit: false,
      copyPublicDir: false,
    },
  });
  return import(pathToFileURL(path.join(SSR_DIR, "entry-server.js")).href);
};

/** Sustituye una etiqueta existente del `index.html`, o falla si cambió de forma. */
const swap = (html, pattern, replacement, what) => {
  if (!pattern.test(html)) throw new Error(`no encuentro ${what} en index.html`);
  return html.replace(pattern, replacement);
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const pageHtml = (template, head, app) => {
  let html = template;

  html = swap(html, /<html lang="en"/, `<html lang="${head.lang}"`, "<html lang>");
  html = swap(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(head.title)}</title>`, "<title>");
  html = swap(html, /<meta name="description" content="[^"]*"\s*\/>/,
    `<meta name="description" content="${esc(head.description)}" />`, "la descripción");
  html = swap(html, /<meta property="og:url" content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${head.canonical}" />`, "og:url");
  html = swap(html, /<meta property="og:title" content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${esc(head.title)}" />`, "og:title");
  html = swap(html, /<meta property="og:description" content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${esc(head.description)}" />`, "og:description");
  html = swap(html, /<meta property="og:image" content="[^"]*"\s*\/>/,
    `<meta property="og:image" content="${head.ogImage}" />\n    <meta property="og:locale" content="${head.lang}" />`, "og:image");
  html = swap(html, /<meta name="twitter:image" content="[^"]*"\s*\/>/,
    `<meta name="twitter:image" content="${head.ogImage}" />`, "twitter:image");
  html = swap(html, /<meta name="twitter:title" content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${esc(head.title)}" />`, "twitter:title");
  html = swap(html, /<meta name="twitter:description" content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${esc(head.description)}" />`, "twitter:description");

  const links = [
    `    <link rel="canonical" href="${head.canonical}" />`,
    ...head.alternates.map((a) => `    <link rel="alternate" hreflang="${a.lang}" href="${a.href}" />`),
    `    <link rel="alternate" hreflang="x-default" href="${head.alternates.find((a) => a.lang === "en").href}" />`,
    `    <script type="application/ld+json" data-alondra>${head.jsonLd}</script>`,
  ].join("\n");
  html = swap(html, /\s*<\/head>/, `\n${links}\n  </head>`, "</head>");

  return swap(html, /<div id="root"><\/div>/, `<div id="root">${app}</div>`, "el contenedor #root");
};

const run = async () => {
  const template = await readFile(path.join(DIST, "index.html"), "utf8");
  const mod = await buildSsrBundle();
  const full = new Set(mod.prerenderPaths());
  const all = JSON.parse(await readFile(path.join(DIST, "routes.json"), "utf8")).paths;

  for (const route of all) {
    // Las elegidas llevan la página entera dentro; el resto, sólo la cabecera.
    // Eso segundo no es relleno: sin un fichero propio por ruta, el catch-all
    // servía `dist/index.html` a todo, y desde que esa es la portada
    // prerenderizada eso significaba mandar el contenido y el **canonical de la
    // portada** en /about, /enrollment y las legales. Un canonical equivocado
    // hace más daño que no tener ninguno.
    const app = full.has(route) ? await mod.render(route) : "";
    const html = pageHtml(template, mod.headFor(route), app);
    // "/" es dist/index.html; "/es/precios" es dist/es/precios/index.html, que es
    // lo que express.static sirve para esa URL sin tocar el servidor.
    const out = route === "/" ? path.join(DIST, "index.html") : path.join(DIST, route, "index.html");
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, html);
    if (full.has(route)) console.log(`  prerender  ${route.padEnd(28)} ${(html.length / 1024).toFixed(1)} kB`);
  }

  // El esqueleto para lo que no es una ruta conocida. Sin esto el catch-all
  // tendría que elegir el fichero de alguna ruta real, y un 404 acabaría
  // anunciando el canonical de otra página.
  await writeFile(
    path.join(DIST, "404.html"),
    template
      .replace(/<meta name="description"/, '<meta name="robots" content="noindex" />\n    <meta name="description"')
      .replace(/<title>[\s\S]*?<\/title>/, "<title>Alondra Music Academy</title>"),
  );

  await rm(SSR_DIR, { recursive: true, force: true });
  console.log(`\n  ${full.size} rutas con la página dentro, ${all.length - full.size} sólo con metadatos.`);
};

run().catch((err) => {
  console.error("\nEl prerenderizado falló:", err);
  process.exit(1);
});
