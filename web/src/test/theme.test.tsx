/**
 * Regresión: el tema no puede tumbar el sitio.
 *
 * `localStorage` no sólo puede estar vacío: con las cookies y los datos de sitio
 * bloqueados (Chrome, Firefox) o dentro de un iframe sandboxed, **el acceso a
 * `window.localStorage` lanza SecurityError**. `ThemeProvider` es el proveedor
 * más externo del árbol y no hay error boundary por encima, así que esa
 * excepción dejaba al visitante una página en blanco: el HTML entero estaba, y
 * no se renderizaba nada.
 *
 * Si alguno de estos tests vuelve a fallar, lo que falla no es el recuerdo de la
 * preferencia: es que el sitio no se ve.
 */
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";

const original = Object.getOwnPropertyDescriptor(window, "localStorage")!;

/** Deja `window.localStorage` lanzando en el acceso, como un navegador con los datos de sitio bloqueados. */
const bloquearAlmacenamiento = () =>
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw new DOMException("The operation is insecure.", "SecurityError");
    },
  });

/** Deja la lectura bien y sólo la escritura lanzando (Safari privado histórico, cuota llena). */
const bloquearEscritura = () =>
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      },
      removeItem: () => {},
    },
  });

const Sonda = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} data-testid="tema">
      {theme}
    </button>
  );
};

afterEach(() => {
  Object.defineProperty(window, "localStorage", original);
  document.documentElement.classList.remove("dark");
});

describe("ThemeProvider con el almacenamiento bloqueado", () => {
  it("renderiza a sus hijos en vez de tumbar el árbol", () => {
    bloquearAlmacenamiento();
    render(
      <ThemeProvider>
        <p>contenido</p>
      </ThemeProvider>,
    );
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });

  it("cae al tema oscuro, que es el de la marca", () => {
    bloquearAlmacenamiento();
    render(
      <ThemeProvider>
        <Sonda />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("tema")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("el interruptor sigue funcionando aunque no se pueda guardar", () => {
    bloquearEscritura();
    render(
      <ThemeProvider>
        <Sonda />
      </ThemeProvider>,
    );
    expect(() => act(() => screen.getByTestId("tema").click())).not.toThrow();
    expect(screen.getByTestId("tema")).toHaveTextContent("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });
});

describe("ThemeProvider con almacenamiento normal", () => {
  it("respeta la preferencia guardada", () => {
    window.localStorage.setItem("alondra-theme", "light");
    render(
      <ThemeProvider>
        <Sonda />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("tema")).toHaveTextContent("light");
    window.localStorage.removeItem("alondra-theme");
  });
});
