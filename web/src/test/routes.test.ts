import { describe, it, expect } from "vitest";
import { allPaths, alternatesFor, langFromPath, PAGE_KEYS, parsePath, pathFor, LEGACY_REDIRECTS } from "@/i18n/routes";
import { translations, LANGS } from "@/i18n/translations";

const langs = LANGS.map(l => l.code);

describe("rutas", () => {
  it("toda ruta generada se resuelve de vuelta a su página e idioma", () => {
    for (const { key, lang, path } of allPaths()) {
      expect(parsePath(path), path).toEqual({ lang, key });
    }
  });

  it("no hay rutas duplicadas", () => {
    const paths = allPaths().map(p => p.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("solo inglés vive en la raíz", () => {
    for (const lang of langs)
      for (const key of PAGE_KEYS) {
        const p = pathFor(key, lang);
        if (lang === "en") expect(p.startsWith("/es/") || p.startsWith("/fr/")).toBe(false);
        else expect(p.startsWith(`/${lang}`)).toBe(true);
      }
  });

  it("cada página tiene title y description en los tres idiomas", () => {
    for (const lang of langs)
      for (const key of PAGE_KEYS) {
        const m = translations[lang].meta[key];
        expect(m?.title.length, `${lang}/${key} title`).toBeGreaterThan(10);
        expect(m?.description.length, `${lang}/${key} desc`).toBeGreaterThan(40);
      }
  });

  // Google corta el título sobre los 60 caracteres y la descripción sobre los 155.
  // Pasarse no penaliza, pero recorta justo el final, que suele ser la llamada a la acción.
  it("titles y descriptions caben en el resultado de búsqueda", () => {
    for (const lang of langs)
      for (const key of PAGE_KEYS) {
        const m = translations[lang].meta[key];
        expect(m.title.length, `${lang}/${key} title (${m.title.length})`).toBeLessThanOrEqual(60);
        expect(m.description.length, `${lang}/${key} desc (${m.description.length})`).toBeLessThanOrEqual(155);
      }
  });

  it("los títulos son únicos dentro de cada idioma", () => {
    for (const lang of langs) {
      const titles = PAGE_KEYS.map(k => translations[lang].meta[k].title);
      expect(new Set(titles).size, lang).toBe(titles.length);
    }
  });

  it("hreflang cubre los tres idiomas en cada página", () => {
    for (const key of PAGE_KEYS)
      expect(alternatesFor(key).map(a => a.lang).sort()).toEqual(["en", "es", "fr"]);
  });

  it("las rutas antiguas apuntan a páginas que existen", () => {
    for (const [old, key] of Object.entries(LEGACY_REDIRECTS)) {
      expect(PAGE_KEYS).toContain(key);
      expect(parsePath(old), `${old} ya no debe resolver`).toBeNull();
    }
  });

  it("una ruta desconocida conserva el idioma del prefijo", () => {
    expect(langFromPath("/es/no-existe")).toBe("es");
    expect(langFromPath("/fr/nimporte-quoi")).toBe("fr");
    expect(langFromPath("/no-existe")).toBe("en");
  });

  it("una ruta desconocida no resuelve", () => {
    expect(parsePath("/no-existe")).toBeNull();
    expect(parsePath("/es/no-existe")).toBeNull();
  });

  it("tolera barra final", () => {
    expect(parsePath("/es/precios/")).toEqual({ lang: "es", key: "registration" });
  });
});
