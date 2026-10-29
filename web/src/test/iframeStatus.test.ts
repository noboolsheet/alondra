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
