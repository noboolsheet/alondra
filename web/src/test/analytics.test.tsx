import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { useOutboundTracking, GA_MEASUREMENT_ID } from "@/lib/analytics";

/** Eventos capturados por el gtag de mentira. */
let events: { name: string; params: Record<string, unknown> }[] = [];

beforeEach(() => {
  events = [];
  window.gtag = vi.fn((...args: unknown[]) => {
    if (args[0] === "event") events.push({ name: args[1] as string, params: (args[2] ?? {}) as Record<string, unknown> });
  }) as typeof window.gtag;
  // jsdom corre en localhost, donde index.html apaga GA a propósito.
  delete (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`];
});

const Probe = ({ children }: { children: React.ReactNode }) => {
  useOutboundTracking();
  return <>{children}</>;
};

const at = (path: string, ui: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider>
        <Probe>{ui}</Probe>
      </LanguageProvider>
    </MemoryRouter>,
  );

describe("eventos de conversión", () => {
  it.each([
    ["https://wa.me/17868431028", "contact_whatsapp"],
    ["tel:+17868431028", "contact_phone"],
    ["mailto:hola@alondrama.com", "contact_email"],
  ])("un clic en %s emite %s con su origen", async (href, expected) => {
    const { getByText } = at(
      "/",
      <div data-track-loc="hero">
        <a href={href}>contactar</a>
      </div>,
    );
    fireEvent.click(getByText("contactar"));
    await waitFor(() => expect(events).toHaveLength(1));
    expect(events[0].name).toBe(expected);
    expect(events[0].params.location).toBe("hero");
    expect(events[0].params.lang).toBe("en");
    expect(events[0].params.page).toBe("home");
  });

  it("el idioma y la página salen de la URL, no de un estado", async () => {
    const { getByText } = at(
      "/es/precios",
      <div data-track-loc="footer">
        <a href="tel:+17868431028">llamar</a>
      </div>,
    );
    fireEvent.click(getByText("llamar"));
    await waitFor(() => expect(events).toHaveLength(1));
    expect(events[0].params.lang).toBe("es");
    expect(events[0].params.page).toBe("registration");
    expect(events[0].params.location).toBe("footer");
  });

  it("un enlace interno no genera evento", async () => {
    const { getByText } = at("/", <a href="/pricing">precios</a>);
    fireEvent.click(getByText("precios"));
    await new Promise((r) => setTimeout(r, 20));
    expect(events).toHaveLength(0);
  });

  it("sin data-track-loc el evento sale igual, marcado como desconocido", async () => {
    const { getByText } = at("/", <a href="https://wa.me/1786">wa</a>);
    fireEvent.click(getByText("wa"));
    await waitFor(() => expect(events).toHaveLength(1));
    expect(events[0].params.location).toBe("unknown");
  });
});
