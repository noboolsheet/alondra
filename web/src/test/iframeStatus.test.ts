import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { useIframeStatus } from "@/hooks/use-iframe-status";

/** Un observador que nunca reporta intersección: el embed sigue fuera de pantalla. */
class NeverVisible implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds: ReadonlyArray<number> = [0];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useIframeStatus", () => {
  // La regresión: los dos iframes del sitio llevan loading="lazy", así que el
  // navegador no los pide hasta que te acercas. El reloj arrancaba al montar, y
  // en la portada, con el mapa al final de la página, se agotaba mientras el
  // visitante bajaba: la tarjeta anunciaba que no se podía cargar un mapa que
  // nunca se había llegado a pedir.
  it("no declara fallido un embed que todavía no se ha acercado a la pantalla", () => {
    vi.stubGlobal("IntersectionObserver", NeverVisible);
    vi.useFakeTimers();

    const { result } = renderHook(() => useIframeStatus(1000));
    act(() => result.current.containerRef(document.createElement("div")));
    act(() => void vi.advanceTimersByTime(10000));

    expect(result.current.status).toBe("loading");
  });

  it("una vez visible, si no carga en el plazo cae al estado de error", async () => {
    vi.useFakeTimers();

    // El stub de setup.ts reporta la intersección en un microtask.
    const { result } = renderHook(() => useIframeStatus(1000));
    await act(async () => {
      result.current.containerRef(document.createElement("div"));
    });
    act(() => void vi.advanceTimersByTime(1500));

    expect(result.current.status).toBe("error");
  });

  it("reintentar vuelve a poner el esqueleto", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useIframeStatus(1000));
    act(() => void vi.advanceTimersByTime(0));
    act(() => void vi.advanceTimersByTime(1500));
    expect(result.current.status).toBe("error");

    act(() => result.current.reload());
    expect(result.current.status).toBe("loading");
  });

  it("sin contenedor que observar arranca al montar, como antes", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useIframeStatus(1000));
    act(() => void vi.advanceTimersByTime(0)); // vence el tick de gracia
    act(() => void vi.advanceTimersByTime(1500));

    expect(result.current.status).toBe("error");
  });

  it("un onLoad a tiempo gana al reloj", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useIframeStatus(1000));
    act(() => result.current.onLoad());
    act(() => void vi.advanceTimersByTime(5000));

    expect(result.current.status).toBe("loaded");
  });
});

/**
 * Confirmación por `postMessage` (el widget de My Music Staff).
 *
 * La regresión que motiva todo esto: `public/mms-widget.html` es una página
 * nuestra, así que el `load` del iframe llega SIEMPRE, también cuando el script
 * del tercero está bloqueado o su servicio está caído. Ese `load` marcaba
 * `loaded`, cancelaba el reloj y el mensaje alternativo con los contactos no
 * aparecía nunca: el visitante se quedaba con un recuadro vacío de 700 px.
 * Comprobado en Chrome con `app.mymusicstaff.com` bloqueado.
 *
 * Con la confirmación, el estado sólo pasa a `loaded` cuando lo dice el
 * documento de dentro, y un mensaje que no supere las tres comprobaciones
 * (origen, emisor y forma) no cuenta.
 */
describe("useIframeStatus con confirmación", () => {
  const FUENTE = "alondra-mms";

  /** Contenedor real con su iframe dentro, que es lo que valida el hook. */
  const montarContenedor = () => {
    const caja = document.createElement("div");
    const marco = document.createElement("iframe");
    caja.appendChild(marco);
    document.body.appendChild(caja);
    return { caja, marco };
  };

  const mandar = (data: unknown, opciones: { origin?: string; source?: Window | null } = {}) =>
    window.dispatchEvent(
      new MessageEvent("message", {
        data,
        origin: opciones.origin ?? window.location.origin,
        source: opciones.source === undefined ? null : opciones.source,
      }),
    );

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("carga correcta: el formulario sólo se da por listo cuando lo confirma", async () => {
    vi.useFakeTimers();
    const { caja, marco } = montarContenedor();
    const { result } = renderHook(() => useIframeStatus(1000, FUENTE));
    await act(async () => result.current.containerRef(caja));

    // El `load` del iframe por sí solo ya no dice nada: es nuestra página.
    act(() => result.current.onLoad());
    expect(result.current.status).toBe("loading");

    act(() => void mandar({ fuente: FUENTE, tipo: "listo" }, { source: marco.contentWindow }));
    expect(result.current.status).toBe("loaded");

    // Y el reloj ya no puede tumbarlo.
    act(() => void vi.advanceTimersByTime(5000));
    expect(result.current.status).toBe("loaded");
  });

  it("fallo: un aviso de error salta al mensaje alternativo sin esperar al reloj", async () => {
    vi.useFakeTimers();
    const { caja, marco } = montarContenedor();
    const { result } = renderHook(() => useIframeStatus(10000, FUENTE));
    await act(async () => result.current.containerRef(caja));
    act(() => result.current.onLoad());

    act(() => void mandar({ fuente: FUENTE, tipo: "fallo", motivo: "script" }, { source: marco.contentWindow }));

    expect(result.current.status).toBe("error");
    // Sin esperar los 10 s: es el caso del bloqueador de anuncios, y el aviso
    // llega en cuanto el <script> da error.
    act(() => void vi.advanceTimersByTime(100));
    expect(result.current.status).toBe("error");
  });

  it("timeout: un load sin confirmación acaba en el mensaje alternativo", async () => {
    vi.useFakeTimers();
    const { caja } = montarContenedor();
    const { result } = renderHook(() => useIframeStatus(1000, FUENTE));
    await act(async () => result.current.containerRef(caja));

    // Exactamente el caso roto: la página de dentro carga, el widget no.
    act(() => result.current.onLoad());
    act(() => void vi.advanceTimersByTime(1500));

    expect(result.current.status).toBe("error");
  });

  it("no bloquea la interfaz: sin noticias de nadie, el reloj resuelve igual", async () => {
    vi.useFakeTimers();
    const { caja } = montarContenedor();
    const { result } = renderHook(() => useIframeStatus(1000, FUENTE));
    await act(async () => result.current.containerRef(caja));

    act(() => void vi.advanceTimersByTime(1500));

    expect(result.current.status).toBe("error");
  });

  it("mensajes no autorizados: ninguno mueve el estado", async () => {
    vi.useFakeTimers();
    const { caja, marco } = montarContenedor();
    const otroMarco = document.createElement("iframe");
    document.body.appendChild(otroMarco);

    const { result } = renderHook(() => useIframeStatus(10000, FUENTE));
    await act(async () => result.current.containerRef(caja));
    act(() => result.current.onLoad());

    const rechazados: [string, unknown, { origin?: string; source?: Window | null }][] = [
      ["otro origen", { fuente: FUENTE, tipo: "listo" }, { origin: "https://evil.example", source: marco.contentWindow }],
      ["otro iframe de la página", { fuente: FUENTE, tipo: "listo" }, { source: otroMarco.contentWindow }],
      ["sin emisor", { fuente: FUENTE, tipo: "listo" }, { source: null }],
      ["la ventana de arriba", { fuente: FUENTE, tipo: "listo" }, { source: window }],
      ["otra fuente", { fuente: "otra-cosa", tipo: "listo" }, { source: marco.contentWindow }],
      ["sin tipo conocido", { fuente: FUENTE, tipo: "lo-que-sea" }, { source: marco.contentWindow }],
      ["una cadena suelta", "listo", { source: marco.contentWindow }],
      ["null", null, { source: marco.contentWindow }],
    ];

    for (const [caso, data, opciones] of rechazados) {
      act(() => void mandar(data, opciones));
      expect(result.current.status, `aceptó un mensaje de ${caso}`).toBe("loading");
    }

    // Y el bueno, para probar que el montaje sí funcionaba.
    act(() => void mandar({ fuente: FUENTE, tipo: "listo" }, { source: marco.contentWindow }));
    expect(result.current.status).toBe("loaded");
  });

  it("un fallo falsificado tampoco puede tirar un widget que funciona", async () => {
    vi.useFakeTimers();
    const { caja, marco } = montarContenedor();
    const { result } = renderHook(() => useIframeStatus(10000, FUENTE));
    await act(async () => result.current.containerRef(caja));

    act(() => void mandar({ fuente: FUENTE, tipo: "listo" }, { source: marco.contentWindow }));
    expect(result.current.status).toBe("loaded");

    act(() => void mandar({ fuente: FUENTE, tipo: "fallo" }, { origin: "https://evil.example", source: marco.contentWindow }));
    expect(result.current.status).toBe("loaded");
  });

  it("una confirmación que llega tarde no retira el mensaje alternativo", async () => {
    vi.useFakeTimers();
    const { caja, marco } = montarContenedor();
    const { result } = renderHook(() => useIframeStatus(1000, FUENTE));
    await act(async () => result.current.containerRef(caja));
    act(() => void vi.advanceTimersByTime(1500));
    expect(result.current.status).toBe("error");

    // Cambiarle la pantalla debajo del dedo a quien ya está leyendo el fallback
    // (o pulsando su enlace de WhatsApp) es peor que dejarle el botón de
    // reintentar, que es lo que hay.
    act(() => void mandar({ fuente: FUENTE, tipo: "listo" }, { source: marco.contentWindow }));
    expect(result.current.status).toBe("error");

    act(() => result.current.reload());
    expect(result.current.status).toBe("loading");
  });
});
