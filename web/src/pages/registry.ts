import { lazy, type ComponentType } from "react";
import type { PageKey } from "@/i18n/routes";
import Index from "./Index";

/**
 * Clave de página → componente. La otra mitad de `routes.ts`: allí viven las
 * URLs, aquí lo que se renderiza en ellas. El tipo `Record<PageKey, …>` obliga a
 * que no falte ninguna, así que añadir una ruta sin página no compila.
 *
 * La portada se importa estática para que el primer render no espere a un chunk;
 * las internas van en `lazy()` para que la landing arranque ligera.
 */
export const PAGES: Record<PageKey, ComponentType> = {
  home: Index,
  programs: lazy(() => import("./Programs")),
  teachers: lazy(() => import("./Teachers")),
  about: lazy(() => import("./About")),
  registration: lazy(() => import("./Registration")),
  enroll: lazy(() => import("./Enroll")),
  careers: lazy(() => import("./Careers")),
  contact: lazy(() => import("./Contact")),
  privacy: lazy(() => import("./Privacy")),
  cookies: lazy(() => import("./Cookies")),
  legal: lazy(() => import("./LegalNotice")),
};
