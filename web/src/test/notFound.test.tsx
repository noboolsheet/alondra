import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ThemeProvider } from "@/theme/ThemeContext";
import { usePageMeta } from "@/lib/pageMeta";
import { translations } from "@/i18n/translations";
import NotFound from "@/pages/NotFound";

const Probe = () => { usePageMeta(); return null; };
const at = (p: string, ui: React.ReactNode = <Probe />) =>
  render(<MemoryRouter initialEntries={[p]}><ThemeProvider><LanguageProvider>{ui}</LanguageProvider></ThemeProvider></MemoryRouter>);
const head = (s: string, a = "content") => document.head.querySelector(s)?.getAttribute(a);

describe("404", () => {
  it("el título dice que no se encontró, aunque vengas de una página real", async () => {
    at("/es/precios");
    await waitFor(() => expect(document.title).toContain("Precios"));
    at("/es/no-existe");
    await waitFor(() => expect(document.title).toBe("Página no encontrada · Alondra Music Academy"));
    expect(head('meta[name="description"]')).toBe(translations.es.notFound.body);
  });

  it("no se indexa y no reclama ser otra página", async () => {
    at("/es/precios");
    await waitFor(() => expect(head('link[rel="canonical"]', "href")).toBeTruthy());
    at("/no-existe");
    await waitFor(() => expect(head('meta[name="robots"]')).toBe("noindex, follow"));
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelector('link[rel="alternate"]')).toBeNull();
    expect(document.head.querySelector('meta[property="og:url"]')).toBeNull();
  });

  it("al volver a una página real se quita el noindex y vuelve el canonical", async () => {
    at("/no-existe");
    await waitFor(() => expect(head('meta[name="robots"]')).toBe("noindex, follow"));
    at("/pricing");
    await waitFor(() => expect(document.head.querySelector('meta[name="robots"]')).toBeNull());
    expect(head('link[rel="canonical"]', "href")).toBe("https://alondrama.com/pricing");
  });

  it("la página muestra el error, la URL pedida y salidas", () => {
    at("/es/ruta-rota", <NotFound />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Página no encontrada");
    expect(screen.getByText("/es/ruta-rota")).toBeInTheDocument();
    expect(screen.getByText(translations.es.notFound.elsewhere)).toBeInTheDocument();
    expect(screen.getByText(translations.es.notFound.back)).toBeInTheDocument();
  });
});
