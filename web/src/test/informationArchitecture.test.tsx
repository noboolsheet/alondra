import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ThemeProvider } from "@/theme/ThemeContext";
import { translations } from "@/i18n/translations";
import { TeachersGrid } from "@/components/TeachersGrid";
import About from "@/pages/About";
import Teachers from "@/pages/Teachers";
import Programs from "@/pages/Programs";
import Registration from "@/pages/Registration";
import Enroll from "@/pages/Enroll";
import Careers from "@/pages/Careers";
import { Header } from "@/components/Header";

const at = (path: string, ui: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <LanguageProvider>{ui}</LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );

const widget = () => document.querySelector('iframe[src="/mms-widget.html"]');

/**
 * Invariantes de arquitectura de información.
 *
 * Cada una de estas afirmaciones fue falsa en producción y costó dinero o
 * credibilidad: las biografías vivían en la página de empleo y todos los «ver
 * más» llevaban allí; el equipo se pintaba dos veces seguidas en /about; y el
 * iframe de My Music Staff cargaba para quien sólo comparaba precios.
 */
describe("arquitectura de información", () => {
  it("los «ver más» del equipo llevan a la página de profesores, no a la de empleo", () => {
    at("/", <TeachersGrid />);
    const hrefs = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).map((a) => a.getAttribute("href"));
    const slugs = [translations.en.teachers.director, ...translations.en.teachers.team].map((m) => m.slug);
    for (const slug of slugs) {
      expect(hrefs).toContain(`/music-teachers#${slug}`);
    }
    expect(hrefs.some((h) => h?.startsWith("/music-teacher-jobs"))).toBe(false);
  });

  it("las biografías completas se renderizan en /music-teachers", async () => {
    at("/music-teachers", <Teachers />);
    const team = [translations.en.teachers.director, ...translations.en.teachers.team];
    expect(await screen.findByText(translations.en.teachers.bios.title)).toBeInTheDocument();
    // Un desplegable por persona. Radix desmonta el panel cerrado, así que lo que
    // se comprueba es que cada ficha tiene su disparador y su ancla de hash.
    for (const m of team) {
      expect(screen.getByRole("button", { name: new RegExp(m.name) })).toBeInTheDocument();
      expect(document.getElementById(m.slug)).not.toBeNull();
    }
  });

  it("la ficha de la directora llega abierta y las caras se ven con todo cerrado", async () => {
    at("/music-teachers", <Teachers />);
    const team = [translations.en.teachers.director, ...translations.en.teachers.team];

    // Todas las fotos visibles sin abrir nada: la página enseñaba una rejilla de
    // retratos cuyo único efecto era mandarte más abajo, al mismo acordeón.
    for (const m of team) {
      expect(screen.getByAltText(m.name), m.slug).toBeInTheDocument();
    }

    await waitFor(() =>
      expect(document.querySelector(`#${translations.en.teachers.director.slug} [data-state="open"]`)).not.toBeNull(),
    );
    for (const m of translations.en.teachers.team) {
      expect(document.querySelector(`#${m.slug} [data-state="open"]`), m.slug).toBeNull();
    }
  });

  it("la foto crece al abrir la ficha y vuelve a miniatura al cerrarla", async () => {
    at("/music-teachers", <Teachers />);
    const photo = (name: string) => screen.getByAltText(name) as HTMLImageElement;

    // Ilena llega abierta: su foto ocupa el ancho en móvil y, en escritorio, la
    // altura entera de la ficha en vez de quedarse como un cuadrado arriba.
    await waitFor(() => expect(photo(translations.en.teachers.director.name)).toHaveClass("w-full"));
    expect(photo(translations.en.teachers.director.name)).toHaveClass("md:w-56", "md:self-stretch", "md:aspect-auto");

    // Las demás, cerradas, se quedan en miniatura junto al nombre.
    for (const m of translations.en.teachers.team) {
      expect(photo(m.name), m.slug).toHaveClass("w-16");
      expect(photo(m.name), m.slug).not.toHaveClass("w-full");
    }
  });

  it("el menú principal lleva a inscripción, junto a precios", () => {
    at("/", <Header />);
    const hrefs = Array.from(document.querySelectorAll<HTMLAnchorElement>("nav a[href]")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toContain("/enrollment");
    // Pegada a precios, no al final de la fila.
    const nav = hrefs.filter((h) => h && !h.startsWith("http"));
    expect(nav.indexOf("/enrollment")).toBe(nav.indexOf("/pricing") + 1);
  });

  it("la página de empleo ya no lleva las biografías", () => {
    at("/music-teacher-jobs", <Careers />);
    expect(screen.queryByText(translations.en.teachers.bios.title)).toBeNull();
    expect(screen.queryByText(translations.en.teachers.director.bio[2])).toBeNull();
  });

  it("/about enlaza al equipo en vez de pintarlo dos veces", async () => {
    at("/about", <About />);
    await waitFor(() => expect(screen.getByText(translations.en.about.teamLink.title)).toBeInTheDocument());
    // Ni el retrato de la directora ni las fichas del equipo: eso es /teachers.
    expect(screen.queryByText(translations.en.teachers.teamTitle)).toBeNull();
    expect(screen.queryByAltText(translations.en.teachers.team[0].name)).toBeNull();
  });

  it("la ficha del instrumento se lee en la página, y el hash la abre", async () => {
    at("/music-lessons#instrument-violin", <Programs />);
    // Cada disciplina tiene su ancla: eso es lo que hace enlazable el contenido
    // que antes vivía dentro de un modal.
    for (const d of translations.en.programs.disciplines) {
      expect(document.getElementById(`instrument-${d.key}`), d.key).not.toBeNull();
    }
    // Y la apuntada por el hash llega abierta, sin un clic por delante.
    await waitFor(() =>
      expect(document.querySelector('#instrument-violin [data-state="open"]')).not.toBeNull(),
    );
    expect(document.querySelector('#instrument-piano [data-state="open"]')).toBeNull();
  });

  it("precios cierra con un solo dorado y la inscripción detrás de su pregunta", async () => {
    at("/pricing", <Registration />);
    // La página tenía dos llamadas en dorado pidiendo cosas distintas. El CTA del
    // sitio es uno: la llamada de descubrimiento. La inscripción es la puerta de
    // quien ya pasó por ella, y por eso va cualificada y en secundario.
    // `CallCta` pinta las dos variantes, la de móvil y la de escritorio, y
    // esconde una con `sm:hidden`. jsdom no aplica Tailwind, así que aquí se ven
    // las dos: contar nodos contaría botones, no llamadas. Lo que esta página
    // tiene que cumplir es que **sólo se pida una cosa en dorado**, así que se
    // cuentan etiquetas distintas. El dorado de la cabecera queda fuera de `main`.
    await waitFor(() => expect(document.querySelectorAll("main .btn-cta").length).toBeGreaterThan(0));
    const dorados = [...document.querySelectorAll("main .btn-cta")];
    expect(new Set(dorados.map((b) => b.textContent?.trim())).size).toBe(1);
    expect(dorados[0]).toHaveTextContent(translations.en.hero.ctaPrimary);
    expect(screen.getByText(translations.en.registration.enrollQualifier)).toBeInTheDocument();

    const enroll = screen.getByText(translations.en.registration.enrollCta).closest("a");
    expect(enroll).toHaveAttribute("href", "/enrollment");
    expect(enroll).toHaveClass("btn-outline-invert");
  });

  it("precios no carga el iframe de My Music Staff y la inscripción sí", async () => {
    at("/pricing", <Registration />);
    expect(screen.getByText(translations.en.registration.lessonLengthTitle)).toBeInTheDocument();
    expect(widget()).toBeNull();

    at("/enrollment", <Enroll />);
    await waitFor(() => expect(widget()).not.toBeNull());
  });
});
