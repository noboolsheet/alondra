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
    host: "::",
    port: 8080,
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
