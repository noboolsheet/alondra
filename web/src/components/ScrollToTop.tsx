import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Con hash (#ancla) saltamos a ese elemento en vez de al top. El destino puede
    // montarse después por el lazy-load de la página, así que reintentamos unos frames.
    if (hash) {
      const id = hash.slice(1);
      let tries = 0;
      let settles = 0;
      const timers: ReturnType<typeof setTimeout>[] = [];
      // Sin animación y repitiendo, porque **el destino se mueve mientras viajas**.
      //
      // Al llegar a /music-teachers con #slug, `TeamAccordion` abre esa ficha, lo
      // que cierra la de la directora, que está encima: la página se acorta
      // varios cientos de píxeles bajo los pies. Con scroll suave el navegador
      // seguía rumbo a la posición vieja y acababa pasado de largo, casi al final
      // de la página. Las fotos con `loading="lazy"` mueven el destino otra vez.
      //
      // `instant` es obligatorio porque `html` lleva `scroll-behavior: smooth`.
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (!el) {
          if (tries++ < 20) timers.push(setTimeout(tryScroll, 50));
          return;
        }
        el.scrollIntoView({ behavior: "instant", block: "start" });
        // Reajusta hasta que el layout deja de moverse.
        if (settles++ < 6) timers.push(setTimeout(tryScroll, 80));
      };
      tryScroll();
      return () => timers.forEach(clearTimeout);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};
