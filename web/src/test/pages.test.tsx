import { render, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Suspense } from "react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ThemeProvider } from "@/theme/ThemeContext";
import { PAGE_KEYS, pathFor } from "@/i18n/routes";
import { PAGES } from "@/pages/registry";
import type { Lang } from "@/i18n/translations";

const LANGS: Lang[] = ["en", "es", "fr"];

/**
 * Las 33 URLs del sitio renderizan, y cada una tiene exactamente un `<h1>`.
 *
 * El registro se importa de `pages/registry.ts`, el mismo que usa la aplicación,
 * así que una página nueva entra sola en este recorrido. El conteo de `<h1>` es
 * la comprobación que faltaba al repartir el contenido: una página sin título o
 * con dos (porque se le montó encima una sección que ya traía el suyo) es
 * exactamente el fallo que se acaba de corregir en la de precios.
 */
describe("todas las páginas", () => {
  for (const lang of LANGS) {
    for (const key of PAGE_KEYS) {
      it(`${lang} · ${key} renderiza con un solo h1`, async () => {
        const Page = PAGES[key];
        const { unmount } = render(
          <MemoryRouter initialEntries={[pathFor(key, lang)]}>
            <ThemeProvider>
              <LanguageProvider>
                <Suspense fallback={null}>
                  <Page />
                </Suspense>
              </LanguageProvider>
            </ThemeProvider>
          </MemoryRouter>,
        );
        await waitFor(() => expect(document.querySelector("main h1")).not.toBeNull());
        const titles = document.querySelectorAll("main h1");
        expect(titles.length, `${lang}/${key}`).toBe(1);
        expect(titles[0].textContent?.trim().length ?? 0).toBeGreaterThan(3);
        unmount();
      });
    }
  }
});
