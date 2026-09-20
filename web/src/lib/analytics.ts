import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Debe coincidir con el ID del snippet de gtag.js en index.html.
export const GA_MEASUREMENT_ID = "G-4K99WS2BR6";

type GtagArgs =
  | ["event", string, Record<string, unknown>?]
  | ["config", string, Record<string, unknown>?]
  | ["js", Date];

declare global {
  interface Window {
    gtag?: (...args: GtagArgs) => void;
    dataLayer?: unknown[];
  }
}

/** true si gtag cargó y no está desactivado (dev local, bloqueador de anuncios). */
const gaReady = () =>
  typeof window !== "undefined" &&
  typeof window.gtag === "function" &&
  !(window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`];

/**
 * Envía un evento a GA4. No hace nada si gtag no está disponible, así que se puede
 * llamar sin condicionar: en local, con un bloqueador o si el script falla, es un no-op.
 */
export const track = (event: string, params: Record<string, unknown> = {}) => {
  if (!gaReady()) return;
  window.gtag!("event", event, params);
};

/**
 * Registra las navegaciones internas del router.
 *
 * El snippet de index.html solo dispara UN page_view, el de la carga inicial. Como esto
 * es una SPA, el resto de las rutas se renderizan sin recargar la página y GA no se
 * entera: sin este hook, Analytics solo vería la página de entrada de cada visitante.
 *
 * Por eso saltamos la primera ubicación (ya la contó el snippet) y emitimos page_view
 * en cada cambio posterior.
 */
export const usePageviews = () => {
  const { pathname, search } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!gaReady()) return;

    window.gtag!("event", "page_view", {
      page_path: pathname + search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, search]);
};
