import { describe, it, expect } from "vitest";
import { translations, LANGS, type Lang } from "@/i18n/translations";

const langs = LANGS.map((l) => l.code);

/** Aplana el diccionario a `ruta → cadena`, con índices para los arrays. */
const flatten = (value: unknown, path = "", out: Record<string, string> = {}) => {
  if (typeof value === "string") out[path] = value;
  else if (Array.isArray(value)) value.forEach((v, i) => flatten(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) flatten(v, path ? `${path}.${k}` : k, out);
  return out;
};

const FLAT: Record<Lang, Record<string, string>> = Object.fromEntries(
  langs.map((l) => [l, flatten(translations[l])]),
) as Record<Lang, Record<string, string>>;

const paths = Object.keys(FLAT.en);
const bolds = (s: string) => (s.match(/\*\*/g) ?? []).length;

/**
 * Un cierre de negrita pegado a una letra: `**personalizado**s`, que pinta el
 * adjetivo y deja la «s» del plural fuera.
 *
 * Hay que emparejar las marcas de verdad: una expresión regular suelta no sabe
 * cuál abre y cuál cierra, y en un texto con dos negritas toma el cierre de la
 * primera como apertura de la siguiente. Al partir por `**`, los tramos impares
 * son el interior de una negrita y los pares, lo de fuera.
 */
const glued = (s: string) => {
  const parts = s.split("**");
  for (let i = 2; i < parts.length; i += 2) if (/^\p{L}/u.test(parts[i])) return true;
  return false;
};

/**
 * Paridad entre los tres idiomas.
 *
 * El tipo `Dict` garantiza que no falte ninguna clave, pero no que las tres
 * digan lo mismo: el inglés es la fuente y el español y el francés se editan
 * por separado, así que la deriva entra sin que nada la frene. Esto no compara
 * significado, que no se puede automatizar: compara las señales mecánicas que
 * sí deben coincidir, que son las que delatan una edición a medias.
 */
describe("paridad entre idiomas", () => {
  it("los tres diccionarios tienen exactamente las mismas rutas", () => {
    for (const lang of langs) {
      expect(Object.keys(FLAT[lang]).sort(), lang).toEqual(paths.slice().sort());
    }
  });

  it("el énfasis en negrita coincide en los tres", () => {
    const off = paths.filter((p) => {
      const n = bolds(FLAT.en[p]);
      return n !== bolds(FLAT.es[p]) || n !== bolds(FLAT.fr[p]);
    });
    expect(off).toEqual([]);
  });

  it("ninguna negrita queda abierta ni parte una palabra", () => {
    // `**totalmente personalizado**s` pintaba el adjetivo y dejaba la «s» del
    // plural fuera. Un número impar de marcas deja la negrita abierta al resto
    // del párrafo.
    const broken: string[] = [];
    for (const lang of langs)
      for (const p of paths) {
        const text = FLAT[lang][p];
        if (bolds(text) % 2 !== 0) broken.push(`${lang} ${p}: marcas impares`);
        if (glued(text)) broken.push(`${lang} ${p}: cierre pegado a una letra`);
      }
    expect(broken).toEqual([]);
  });

  it("los nombres propios no se traducen", () => {
    // «Little Mozart» se respetaba en los tres y «Piano Lab» se traducía en dos:
    // son los dos productos con nombre de la academia y es el nombre con el que
    // van a tener landing propia.
    const NAMES = ["Step Up", "Stripe", "My Music Staff", "Piano Lab", "Little Mozart", "Alondra"];
    const off: string[] = [];
    for (const p of paths)
      for (const name of NAMES) {
        const seen = langs.filter((l) => FLAT[l][p].includes(name));
        if (seen.length && seen.length !== langs.length) off.push(`${p}: "${name}" sólo en ${seen.join(", ")}`);
      }
    // El título de la portada y el de empleo nombran los dos condados en inglés
    // y sólo "Miami" en español y francés: ahí manda el límite de 60 caracteres.
    expect(off.filter((o) => !o.startsWith("meta."))).toEqual([]);
  });

  it("las cifras coinciden, salvo el reloj y la marca", () => {
    // El inglés usa reloj de 12 horas y los otros dos de 24: es localización
    // correcta, no deriva.
    const EXCEPT = new Set(["coverage.hoursOpen", "coverage.hoursClosed", "contact.infoHoursValue", "programs.formats[2].body"]);
    const nums = (s: string) => (s.match(/\d+/g) ?? []).join(",");
    const off = paths.filter((p) => !EXCEPT.has(p) && (nums(FLAT.en[p]) !== nums(FLAT.es[p]) || nums(FLAT.en[p]) !== nums(FLAT.fr[p])));
    expect(off).toEqual([]);
  });

  it("ninguna raya larga en ningún idioma", () => {
    // Delata texto escrito por una IA, y es requisito explícito del proyecto.
    const off: string[] = [];
    for (const lang of langs) for (const p of paths) if (FLAT[lang][p].includes("—")) off.push(`${lang} ${p}`);
    expect(off).toEqual([]);
  });
});
