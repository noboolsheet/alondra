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
 *
 * ── `confirmacion`: cuando el `load` del iframe no demuestra nada ────────────
 *
 * El widget de My Music Staff vive en una página NUESTRA (`public/mms-widget.html`)
 * porque usa `document.write`. Esa página carga siempre, así que su `load`
 * llegaba aunque el script del tercero estuviera bloqueado o caído: marcaba
 * `loaded`, cancelaba el reloj, y el mensaje alternativo con los contactos no
 * aparecía nunca. El visitante se quedaba con un recuadro vacío de 700 px.
 *
 * Con `confirmacion`, el `load` deja de significar «cargado» y el estado sólo
 * pasa a `loaded` cuando llega un `postMessage` de dentro diciendo que el
 * formulario está pintado de verdad. Se valida lo que hay que validar: el
 * origen, que el emisor sea EL iframe de este contenedor (no otro marco de la
 * página) y la forma del mensaje. El reloj sigue corriendo como siempre, así
 * que un widget que no confirma acaba en el fallback en vez de colgarse.
 *
 * Sin esta opción el hook se comporta exactamente como antes, que es lo que
 * necesita `CoverageMap`: el mapa de Google es de otro origen y no puede
 * mandarnos nada.
 */

/** Mensaje que una página incrustada manda para confirmar que ya está lista. */
type Confirmacion = { fuente: string; tipo: "listo" | "fallo"; motivo?: string };

const esConfirmacion = (d: unknown, fuente: string): d is Confirmacion =>
  typeof d === "object" &&
  d !== null &&
  (d as Confirmacion).fuente === fuente &&
  ((d as Confirmacion).tipo === "listo" || (d as Confirmacion).tipo === "fallo");

export function useIframeStatus(timeoutMs = 10000, confirmacion?: string) {
  const [status, setStatus] = useState<IframeStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [container, setContainerState] = useState<HTMLElement | null>(null);
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  // El contenedor también en una ref: el listener de mensajes se registra una
  // sola vez y tiene que ver el contenedor actual, no el que hubiera cuando se
  // registró. Con la versión de estado, un `listo` que llegara pronto se
  // descartaría por no poder comprobar de qué iframe viene.
  const contenedor = useRef<HTMLElement | null>(null);
  const setContainer = useCallback((el: HTMLElement | null) => {
    contenedor.current = el;
    setContainerState(el);
  }, []);

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

  /**
   * El mensaje de confirmación, con sus tres comprobaciones.
   *
   * Cualquier página puede hacer `postMessage` a cualquier ventana, así que un
   * mensaje suelto no vale como prueba de nada. Tienen que cumplirse las tres:
   * que venga de nuestro propio origen, que el emisor sea exactamente el iframe
   * de este contenedor (otro marco de la misma página no sirve) y que el cuerpo
   * tenga la forma acordada.
   */
  useEffect(() => {
    if (!confirmacion) return;
    const alMensaje = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const marco = contenedor.current?.querySelector("iframe");
      if (!marco || !e.source || e.source !== marco.contentWindow) return;
      if (!esConfirmacion(e.data, confirmacion)) return;
      clearTimeout(timer.current);
      // Un `listo` que llega tarde, con el fallback ya puesto, no lo retira: el
      // visitante puede estar leyéndolo o pulsando el enlace de WhatsApp, y
      // cambiarle la pantalla debajo del dedo es peor que pedirle «reintentar».
      if (e.data.tipo === "listo") setStatus((s) => (s === "error" ? s : "loaded"));
      else setStatus("error");
    };
    window.addEventListener("message", alMensaje);
    return () => window.removeEventListener("message", alMensaje);
  }, [confirmacion]);

  const onLoad = useCallback(() => {
    // Con confirmación, que llegue nuestra propia página no dice nada del
    // widget que va dentro: marcar `loaded` aquí es justo lo que mataba el
    // fallback. El reloj sigue corriendo y lo resuelve el `postMessage`.
    if (confirmacion) return;
    clearTimeout(timer.current);
    setStatus("loaded");
  }, [confirmacion]);

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
