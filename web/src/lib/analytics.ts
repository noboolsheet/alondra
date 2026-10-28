import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";

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

/* ────────────────────────────────────────────────────────────────────────────
 * Conversiones
 *
 * GA4 medía visitas y nada más: `track()` existía y no se llamaba desde ningún
 * sitio, así que una visita y un contacto eran indistinguibles. Sin esto, la
 * Fase 22 no se puede medir y no hay forma de saber qué canal trae alumnos.
 * ──────────────────────────────────────────────────────────────────────────── */

/** `track()` con el idioma y la página ya puestos: son el corte que más se mira. */
export const useTrack = () => {
  const { lang, page } = useLang();
  return useCallback(
    (event: string, params: Record<string, unknown> = {}) => {
      track(event, { lang, page: page ?? "404", ...params });
    },
    [lang, page],
  );
};

/** href → evento. El orden no importa: los tres patrones son excluyentes. */
const OUTBOUND: [RegExp, string][] = [
  [/^https?:\/\/(wa\.me|api\.whatsapp\.com)/i, "contact_whatsapp"],
  [/^tel:/i, "contact_phone"],
  [/^mailto:/i, "contact_email"],
];

/**
 * Registra los clics a WhatsApp, teléfono y correo con UN listener delegado.
 *
 * La alternativa —un `onClick` en cada enlace— son quince ediciones repartidas
 * por siete componentes, y la decimosexta se olvida. Así, cualquier enlace que
 * se añada mañana se mide solo.
 *
 * El `location` sale del `data-track-loc` del ancestro más cercano, y es el
 * parámetro que de verdad importa: sin él sabes que hubo 40 clics a WhatsApp,
 * pero no si salieron del hero o del pie, que es lo que decide dónde va el botón.
 *
 * Va en fase de captura para que llegue aunque un componente pare la propagación.
 */
export const useOutboundTracking = () => {
  const send = useTrack();

  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      const el = ev.target as HTMLElement | null;
      const anchor = el?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      const match = OUTBOUND.find(([re]) => re.test(href));
      if (!match) return;

      send(match[1], {
        location: anchor.closest("[data-track-loc]")?.getAttribute("data-track-loc") ?? "unknown",
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [send]);
};
