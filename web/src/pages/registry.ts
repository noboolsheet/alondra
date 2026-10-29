import { lazy, type ComponentType } from "react";
import type { PageKey } from "@/i18n/routes";
import Index from "./Index";

type Loader = () => Promise<{ default: ComponentType }>;

/**
 * Clave de página → cómo se carga. La otra mitad de `routes.ts`: allí viven las
 * URLs, aquí lo que se renderiza en ellas. El tipo `Record<PageKey, …>` obliga a
 * que no falte ninguna, así que añadir una ruta sin página no compila.
 *
 * Un único mapa de cargadores porque hay dos consumidores con necesidades
 * opuestas: el navegador quiere los trozos diferidos para que la portada arranque
 * ligera, y el prerenderizado los necesita resueltos antes de renderizar, porque
 * `renderToString` no espera a un `lazy` y pintaría el esqueleto de carga en vez
 * de la página. Tener dos listas era garantizar que se desincronizaran.
 */
const LOADERS: Record<PageKey, Loader> = {
  home: () => Promise.resolve({ default: Index }),
  programs: () => import("./Programs"),
  teachers: () => import("./Teachers"),
  about: () => import("./About"),
  registration: () => import("./Registration"),
  enroll: () => import("./Enroll"),
  careers: () => import("./Careers"),
  contact: () => import("./Contact"),
  privacy: () => import("./Privacy"),
  cookies: () => import("./Cookies"),
  legal: () => import("./LegalNotice"),
};

/** Para el navegador: la portada estática, el resto en trozos diferidos. */
export const PAGES = (Object.keys(LOADERS) as PageKey[]).reduce((acc, key) => {
  acc[key] = key === "home" ? Index : lazy(LOADERS[key]);
  return acc;
}, {} as Record<PageKey, ComponentType>);

/** Para el prerenderizado: el componente ya resuelto, sin `Suspense` de por medio. */
export const loadPage = async (key: PageKey): Promise<ComponentType> =>
  (await LOADERS[key]()).default;
