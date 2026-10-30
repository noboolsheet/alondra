import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { allPaths, alternatesFor } from "./src/i18n/routes";
import { SITE_ORIGIN } from "./src/lib/siteOrigin";

/**
 * Emits sitemap.xml and routes.json from the route map, so neither can drift out
 * of sync with the routes the app actually serves. routes.json is what lets the
 * Express server tell a real page from a 404 (see server/index.mjs). Each URL declares its hreflang
 * alternates, which is how Google learns the three language versions are the
 * same page rather than duplicates competing with each other.
 */
const sitemap = () => ({
  name: "alondra-sitemap",
  apply: "build" as const,
  generateBundle() {
    // lastmod tells Google what to re-crawl after a deploy. priority is ignored by
    // Google and was only noise, so it is deliberately not emitted.
    const lastmod = new Date().toISOString().slice(0, 10);
    const urls = allPaths()
      .map(({ key, path: p }) => {
        const alts = alternatesFor(key)
          .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${SITE_ORIGIN}${a.path}"/>`)
          .join("\n");
        return [
          "  <url>",
          `    <loc>${SITE_ORIGIN}${p}</loc>`,
          alts,
          `    <lastmod>${lastmod}</lastmod>`,
          "  </url>",
        ].join("\n");
      })
      .join("\n");

    const emit = (this as unknown as { emitFile: (f: Record<string, string>) => void }).emitFile;

    emit({
      type: "asset",
      fileName: "routes.json",
      source: JSON.stringify({ paths: allPaths().map((p) => p.path).sort() }, null, 2) + "\n",
    });

    emit({
      type: "asset",
      fileName: "sitemap.xml",
      source:
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
        urls +
        "\n</urlset>\n",
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Por defecto loopback. `host: "::"` ataba el servidor de desarrollo a TODAS
    // las interfaces (en macOS, con v6only a 0, eso incluye las IPv4), así que
    // cualquier equipo de la misma wifi podía leer todo el árbol de `web/`:
    // el código, el package-lock, las notas internas de trabajo y
    // `cloudflared/config.yml` con el UUID del túnel. Y con `npm run dev:all`
    // alcanzaba además los dos endpoints de correo por el proxy de abajo.
    // Para probar desde el móvil en la LAN: `VITE_HOST=:: npm run dev`.
    host: process.env.VITE_HOST || "localhost",
    port: 8080,
    // Esta lista REEMPLAZA la de Vite, no la extiende, así que las tres primeras
    // entradas son las suyas por defecto y hay que repetirlas. `cloudflared` se
    // añade porque el directorio vive dentro de la raíz de Vite y es donde
    // `tunnel.sh` exige la credencial del túnel: su nombre no encaja con ningún
    // patrón por defecto, así que se habría servido tal cual.
    // `**/.git/**` no está en los tres por defecto de Vite 5 (upstream lo añadió
    // en la línea 6). Aquí es prevención, no un agujero abierto: comprobado
    // levantando el servidor, `/.git/HEAD` devuelve el `index.html` de la SPA por
    // el fallback, porque el `.git` de este repo está en el directorio padre y
    // `fs.allow` se limita a `web/`. Se deja por si algún día alguien levanta
    // Vite con la raíz del repositorio, donde sí estaría dentro.
    //
    // Lo que sí se sirve con el servidor abierto a la red es el resto del árbol:
    // `src/`, `package-lock.json` y los documentos internos (`CLAUDE.md` sale
    // como text/markdown, comprobado). Eso es lo que hace un servidor de
    // desarrollo, y es la razón de que por defecto escuche sólo en loopback.
    fs: { deny: [".env", ".env.*", "*.{crt,pem}", "**/cloudflared/**", "**/.git/**"] },
    hmr: {
      overlay: false,
    },
    // Forward API calls to the local Express server so email sending works in dev.
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), sitemap(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split the libraries that never change into their own chunks. They are
        // the bulk of the JavaScript and they keep their hash across deploys, so
        // a returning visitor re-downloads only the app code that actually moved.
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
        },
      },
    },
  },
}));
