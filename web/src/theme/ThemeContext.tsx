import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "alondra-theme";

interface Ctx {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<Ctx | null>(null);

/**
 * Leer y escribir `localStorage` puede **lanzar**, no sólo devolver null: con las
 * cookies y los datos de sitio bloqueados en Chrome o Firefox, y dentro de un
 * iframe sandboxed, el propio acceso a `window.localStorage` tira SecurityError.
 *
 * Aquí eso no era «se me olvida el tema»: `ThemeProvider` es el proveedor más
 * externo del árbol y no hay error boundary por encima, así que la excepción se
 * llevaba la aplicación entera y el visitante veía una página en blanco. El
 * arranque de `index.html` y `LanguageContext` ya lo envolvían; este era el único
 * acceso que quedaba sin envolver. Hay test de regresión
 * (`src/test/theme.test.tsx`).
 */
const leerTema = (): Theme | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return null;
  }
};

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  return leerTema() ?? "dark"; // dark is the default
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Igual que arriba: recordar la preferencia es opcional, pintar el tema no.
    }
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
