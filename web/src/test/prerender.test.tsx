import { describe, it, expect } from "vitest";
import { headFor, prerenderPaths, PRERENDER, render } from "@/entry-server";
import { translations } from "@/i18n/translations";
import { pathFor } from "@/i18n/routes";

/**
 * El prerenderizado del build.
 *
 * Lo que se verifica aquí es lo que falla en silencio: si alguien añade una
 * página con `lazy` y el prerenderizado la renderiza, `renderToString` no espera
 * a la promesa y escribe el esqueleto de carga en vez de la página. El HTML
 * seguiría generándose, pesaría parecido y estaría vacío de contenido.
 */
describe("prerenderizado", () => {
  it("cubre las cinco páginas que importan en los tres idiomas", () => {
    const paths = prerenderPaths();
    expect(paths).toHaveLength(PRERENDER.length * 3);
    for (const key of PRERENDER) for (const lang of ["en", "es", "fr"] as const) {
      expect(paths).toContain(pathFor(key, lang));
    }
  });

  it("cada ruta lleva su título, su canonical y sus tres hreflang", () => {
    const head = headFor("/es/profesores");
    expect(head.lang).toBe("es");
    expect(head.title).toBe(translations.es.meta.teachers.title);
    expect(head.description).toBe(translations.es.meta.teachers.description);
    expect(head.canonical).toBe("https://alondrama.com/es/profesores");
    expect(head.alternates.map((a) => a.lang).sort()).toEqual(["en", "es", "fr"]);
    expect(head.ogImage).toBe("https://alondrama.com/images/og/og-es.jpg");
  });

  it("el JSON-LD viaja dentro del HTML, no desde un efecto", () => {
    // `useStructuredData` lo inyecta en un efecto, y los efectos no corren al
    // renderizar en servidor: sin `headFor`, las quince rutas saldrían sin grafo.
    const graph = JSON.parse(headFor("/es/profesores").jsonLd.replace(/\\u003c/g, "<"));
    const people = graph["@graph"].filter((n: { "@type": string }) => n["@type"] === "Person");
    expect(people).toHaveLength(translations.es.teachers.team.length + 1);
  });

  it("el HTML trae el contenido de verdad, no el esqueleto de carga", async () => {
    const html = await render("/music-teachers");
    expect(html).toContain(translations.en.teachers.director.name);
    expect(html).toContain(translations.en.teachers.bios.title);
    // La biografía, que es el texto que un rastreador sin JavaScript no podía leer
    // y la razón entera de hacer esto. Se comprueba el tramo anterior a la primera
    // negrita: `rich()` parte el párrafo en varios nodos, así que la cadena
    // completa no aparece contigua en el HTML.
    const [opening] = translations.en.teachers.director.bio[0].split("**");
    expect(opening.length).toBeGreaterThan(60);
    expect(html).toContain(opening);
  });

  it("el español renderiza en español", async () => {
    const html = await render("/es/precios");
    expect(html).toContain(translations.es.registration.pricingTitle);
    expect(html).not.toContain(translations.en.registration.pricingTitle);
  });
});
