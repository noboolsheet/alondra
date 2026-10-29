import { useCallback, useEffect, useRef, useState } from "react";

export type IframeStatus = "loading" | "loaded" | "error";

/**
 * Tracks a third-party iframe's load state so callers can show a skeleton while
 * it loads and a fallback if it never does. Cross-origin embeds rarely fire a
 * reliable `onError`, so a timeout is the real guard: if `onLoad` hasn't fired
 * within `timeoutMs`, we surface the error/fallback state. `reload` bumps a key
 * so the caller can remount the iframe to retry.
 *
 * El reloj arranca cuando el embed **entra en pantalla**, no al montar. Los dos
 * iframes del sitio llevan `loading="lazy"`, así que el navegador ni empieza a
 * pedirlos hasta que el visitante se acerca; en la portada el mapa está al final
 * de la página y los 10 segundos se agotaban durante el scroll, de modo que la
 * tarjeta decía «no se puede cargar» un mapa que nunca se había pedido. En
 * contacto el mapa está arriba y por eso ahí no fallaba.
 *
 * Para armarlo, el llamante pasa `containerRef` al envoltorio del iframe. Si no
 * lo pasa, o no hay IntersectionObserver, el reloj arranca al montar como antes.
 */
export function useIframeStatus(timeoutMs = 10000) {
  const [status, setStatus] = useState<IframeStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (armed) return;

    // Todavía sin contenedor. No armamos en el acto: el ref callback llega en el
    // commit, antes que este efecto, pero su `setState` provoca un render nuevo
    // y es ése el que lo deja visible aquí. Un tick de gracia distingue «aún no
    // ha llegado» de «el llamante no pasa ref», que es el caso en el que hay que
    // comportarse como antes y arrancar el reloj igualmente.
    if (!container) {
      const grace = setTimeout(() => setArmed(true), 0);
      return () => clearTimeout(grace);
    }

    if (typeof IntersectionObserver === "undefined") {
      setArmed(true);
      return;
    }
    // Un margen generoso para armar antes de que el embed sea visible del todo,
    // sin llegar a hacerlo nada más cargar la página.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [container, armed]);

  useEffect(() => {
    if (!armed) return;
    timer.current = setTimeout(() => {
      setStatus((s) => (s === "loaded" ? s : "error"));
    }, timeoutMs);
    return () => clearTimeout(timer.current);
  }, [armed, timeoutMs, reloadKey]);

  const onLoad = useCallback(() => {
    clearTimeout(timer.current);
    setStatus("loaded");
  }, []);

  const onError = useCallback(() => {
    clearTimeout(timer.current);
    setStatus("error");
  }, []);

  const reload = useCallback(() => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  }, []);

  return { status, reloadKey, onLoad, onError, reload, containerRef: setContainer };
}
