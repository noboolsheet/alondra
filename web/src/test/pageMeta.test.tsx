import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { LanguageProvider, useLang } from "@/i18n/LanguageContext";
import { usePageMeta } from "@/lib/pageMeta";
import { translations } from "@/i18n/translations";

const Probe = () => { usePageMeta(); return null; };
const at = (path: string) =>
  render(<MemoryRouter initialEntries={[path]}><LanguageProvider><Probe /></LanguageProvider></MemoryRouter>);

const head = (sel: string, attr = "content") =>
  document.head.querySelector(sel)?.getAttribute(attr);

describe("metadatos por página", () => {
  it.each([
    ["/", "en", "home"],
    ["/pricing", "en", "registration"],
    ["/es/precios", "es", "registration"],
    ["/fr/cours-de-musique", "fr", "programs"],
  ])("%s → título e idioma correctos", async (path, lang, key) => {
    at(path);
    const expected = translations[lang as "en"].meta[key as "home"];
    await waitFor(() => expect(document.title).toBe(expected.title));
    expect(head('meta[name="description"]')).toBe(expected.description);
    expect(document.documentElement.lang).toBe(lang);
  });

  it("emite canonical y hreflang de los tres idiomas", async () => {
    at("/es/precios");
    await waitFor(() =>
      expect(head('link[rel="canonical"]', "href")).toBe("https://alondrama.com/es/precios"));
    expect(head('link[rel="alternate"][hreflang="en"]', "href")).toBe("https://alondrama.com/pricing");
    expect(head('link[rel="alternate"][hreflang="fr"]', "href")).toBe("https://alondrama.com/fr/tarifs");
    expect(head('link[rel="alternate"][hreflang="x-default"]', "href")).toBe("https://alondrama.com/pricing");
  });

  it("dos rutas distintas no comparten título", async () => {
    at("/pricing");
    await waitFor(() => expect(document.title).toContain("Prices"));
    const first = document.title;
    at("/music-lessons");
    await waitFor(() => expect(document.title).not.toBe(first));
  });
});

const LangProbe = () => {
  const { setLang, lang } = useLang();
  const { pathname } = useLocation();
  return (
    <>
      <span data-testid="path">{pathname}</span>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang("es")}>es</button>
      <button onClick={() => setLang("fr")}>fr</button>
    </>
  );
};

describe("cambio de idioma", () => {
  it("lleva a la MISMA página en el otro idioma", async () => {
    render(<MemoryRouter initialEntries={["/pricing"]}><LanguageProvider><LangProbe /></LanguageProvider></MemoryRouter>);
    expect(screen.getByTestId("lang")).toHaveTextContent("en");
    act(() => { fireEvent.click(screen.getByText("es")); });
    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/es/precios"));
    act(() => { fireEvent.click(screen.getByText("fr")); });
    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/fr/tarifs"));
  });

  it("desde un 404 cae en la home del idioma", async () => {
    render(<MemoryRouter initialEntries={["/nada"]}><LanguageProvider><LangProbe /></LanguageProvider></MemoryRouter>);
    act(() => { fireEvent.click(screen.getByText("es")); });
    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/es"));
  });
});
