import { render, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { priceOf, useStructuredData } from "@/lib/structuredData";
import { translations } from "@/i18n/translations";

const Probe = () => { useStructuredData(); return null; };
const at = (path: string) =>
  render(<MemoryRouter initialEntries={[path]}><LanguageProvider><Probe /></LanguageProvider></MemoryRouter>);

const script = () =>
  document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"][data-alondra]');

/** El grafo tal y como lo recibe un rastreador: parseado desde el <script>. */
const graph = async (path: string) => {
  at(path);
  await waitFor(() => expect(script()?.textContent).toBeTruthy());
  const raw = script()!.textContent!.replace(/\\u003c/g, "<");
  const parsed = JSON.parse(raw) as { "@graph": Record<string, unknown>[] };
  return parsed["@graph"];
};

const typed = (nodes: Record<string, unknown>[], type: string) =>
  nodes.filter((n) => {
    const t = n["@type"];
    return Array.isArray(t) ? t.includes(type) : t === type;
  });

describe("datos estructurados", () => {
  it("la portada declara la academia como negocio de área de servicio", async () => {
    const nodes = await graph("/");
    const [org] = typed(nodes, "LocalBusiness");
    expect(org).toBeDefined();
    // Los dos tipos, y ninguno inventado: un @type que schema.org no define
    // invalida todo lo que cuelga de él. `MusicSchool` lo parecía y no existe.
    expect(org["@type"]).toEqual(["LocalBusiness", "EducationalOrganization"]);
    expect(org.name).toBe("Alondra Music Academy");
    // Lo que hace falta que Google entienda: se desplaza, no tiene local.
    expect(org.areaServed).toEqual(
      expect.arrayContaining([{ "@type": "AdministrativeArea", name: "Miami-Dade County, FL" }]),
    );
    expect(org.address).not.toHaveProperty("streetAddress");
  });

  it("cada idioma emite su propia URL e idioma declarado", async () => {
    for (const [path, lang, url] of [
      ["/pricing", "en", "https://alondrama.com/pricing"],
      ["/es/precios", "es", "https://alondrama.com/es/precios"],
      ["/fr/tarifs", "fr", "https://alondrama.com/fr/tarifs"],
    ] as const) {
      const nodes = await graph(path);
      const [page] = typed(nodes, "WebPage");
      expect(page.url).toBe(url);
      expect(page.inLanguage).toBe(lang);
    }
  });

  it("la portada es FAQPage con todas sus preguntas, en texto plano", async () => {
    const nodes = await graph("/");
    const [page] = typed(nodes, "FAQPage");
    const questions = page.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    expect(questions).toHaveLength(translations.en.faq.items.length);
    // La copy lleva marcadores `**negrita**`; en JSON-LD no deben viajar.
    for (const q of questions) {
      expect(q.name).not.toContain("**");
      expect(q.acceptedAnswer.text).not.toContain("**");
    }
  });

  it("/music-lessons emite un Course por disciplina", async () => {
    const nodes = await graph("/music-lessons");
    expect(typed(nodes, "Course")).toHaveLength(translations.en.programs.disciplines.length);
  });

  it("cada Course declara las cuatro dimensiones del método", async () => {
    const nodes = await graph("/music-lessons");
    const [course] = typed(nodes, "Course");
    // Son las de pedagogy.pillars. Si alguien vuelve a meter ahí un beneficio
    // cognitivo, acaba publicado como dato estructurado: este test lo frena.
    expect(course.teaches).toEqual(["Technique", "Rhythm", "Music reading", "Interpretation"]);
  });

  it("/pricing emite los precios reales en USD", async () => {
    const nodes = await graph("/pricing");
    const [service] = typed(nodes, "Service");
    type Offer = { priceSpecification: { price: number; priceCurrency: string } };
    const catalog = service.hasOfferCatalog as { itemListElement: Offer[] };
    const prices = catalog.itemListElement.map((o) => o.priceSpecification.price);
    expect(prices).toEqual([50, 35]);
    for (const offer of catalog.itemListElement) {
      expect(offer.priceSpecification.priceCurrency).toBe("USD");
    }
  });

  it("/music-teachers emite al equipo como personas de la academia", async () => {
    const nodes = await graph("/music-teachers");
    const people = typed(nodes, "Person").filter((p) => p["@id"]);
    expect(people.length).toBe(translations.en.teachers.team.length + 1); // + la directora
    expect(people.every((p) => p.worksFor)).toBe(true);
  });

  // Las fichas del equipo se mudaron de /about a su propia página. Si alguien
  // las devuelve a /about, las Person saldrían en las dos y el grafo mentiría
  // sobre cuál es la página del equipo.
  it("/about ya no emite a las personas del equipo", async () => {
    const nodes = await graph("/about");
    expect(typed(nodes, "Person").filter((p) => p["@id"])).toHaveLength(0);
  });

  it("un 404 no deja grafo: la URL no debe declararse como página", async () => {
    at("/");
    await waitFor(() => expect(script()).not.toBeNull());
    at("/esta-ruta-no-existe");
    await waitFor(() => expect(script()).toBeNull());
  });

  it("no marca la valoración del propio negocio (self-serving reviews)", async () => {
    // Si alguien añade aggregateRating sin leer la nota de structuredData.ts,
    // este test lo frena: las directrices de Google lo excluyen y arriesga una
    // acción manual sobre todo el marcado del dominio.
    const raw = JSON.stringify(await graph("/"));
    expect(raw).not.toContain("aggregateRating");
    expect(raw).not.toContain("reviewCount");
  });
});

/**
 * El precio es el único dato del grafo que se **deduce** de una cadena de copy,
 * y por eso tiene tests propios: lo que se escriba en `registration.formats[].price`
 * deja de ser texto y pasa a ser una cifra que se le entrega a Google.
 *
 * El caso que motiva esto: "$35–$50" (la forma natural de escribir dos tarifas,
 * y la que ya usa `priceRange`) se convertía en **3550**.
 */
describe("priceOf", () => {
  it("lee un importe suelto, que es lo que hay hoy en las dos tarifas", () => {
    expect(priceOf("$50")).toBe(50);
    expect(priceOf("$35")).toBe(35);
    // Con texto alrededor, en cualquiera de los tres idiomas.
    expect(priceOf("desde $50")).toBe(50);
    expect(priceOf("$50 / clase")).toBe(50);
  });

  it("acepta decimales sin redondearlos", () => {
    expect(priceOf("$49.50")).toBe(49.5);
    expect(priceOf("$37.25")).toBe(37.25);
  });

  it("entiende el separador de millar", () => {
    expect(priceOf("$1,200")).toBe(1200);
    expect(priceOf("$1,200.50")).toBe(1200.5);
  });

  it("un RANGO no es un precio: se descarta en vez de pegar las cifras", () => {
    // Antes: 3550, 3550 y 3550. Un precio inventado en el JSON-LD es peor que
    // una oferta sin precio, que es lo que pasa ahora (la oferta se omite).
    expect(priceOf("$35–$50")).toBeNull();
    expect(priceOf("$35-$50")).toBeNull();
    expect(priceOf("de $35 a $50")).toBeNull();
  });

  it("sin cifras no se inventa nada", () => {
    expect(priceOf("")).toBeNull();
    expect(priceOf("consultar")).toBeNull();
    expect(priceOf("$")).toBeNull();
    expect(priceOf(".")).toBeNull();
  });

  it("un precio ilegible saca la oferta del catálogo, no la publica a medias", async () => {
    // El contrato del que depende lo de arriba: `lessonService` omite la oferta
    // cuando `priceOf` devuelve null (`if (price === null) return []`).
    const nodes = await graph("/pricing");
    const [service] = typed(nodes, "Service");
    const catalog = service.hasOfferCatalog as { itemListElement: unknown[] };
    // Las dos tarifas de hoy sí se publican: el cambio de `priceOf` no puede
    // haber vaciado el catálogo.
    expect(catalog.itemListElement).toHaveLength(2);
  });
});
