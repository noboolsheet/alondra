import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useLang } from "@/i18n/LanguageContext";

/**
 * La llamada de descubrimiento, siempre al alcance del pulgar en móvil.
 *
 * La portada mide unas dieciséis pantallas a 390 px y la única acción permanente
 * era la píldora de la cabecera, que además vive arriba, fuera del arco del
 * pulgar. Entre el hero y el CTA de profesores no había nada que pulsar.
 *
 * Sólo móvil: a partir de `sm` el visitante tiene el CTA del hero y la cabecera
 * entera a la vista, y una barra fija le robaría alto de ventana.
 *
 * **Se aparta cuando hay otra llamada en pantalla.** La primera versión sólo se
 * retiraba al llegar al cierre, y medido con `elementFromPoint` se montaba encima
 * de dos CTA reales: «ver los formatos en detalle» y la llamada de StepUp. Peor
 * todavía, en la sección de profesores dejaba dos dorados idénticos a la vez
 * pidiendo lo mismo, que es justo lo que la cabecera de CTABanner avisa de no
 * hacer. Ahora un IntersectionObserver vigila los CTA de la página (`.btn-cta` y
 * los enlaces marcados con `data-cta="call"`) y la barra desaparece mientras
 * alguno esté a la vista: cuando hay un botón de verdad, sobra el de repuesto.
 */
const SHOW_AFTER = 560; // px de scroll: el alto del hero en móvil, en números redondos.

export const StickyCallBar = () => {
  const { t } = useLang();
  const prefersReduced = useReducedMotion();
  const [scrolledPast, setScrolledPast] = useState(false);
  const ctaOnScreen = useRef(new Set<Element>());
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolledPast(window.scrollY > SHOW_AFTER);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    // El pie entra en la lista a propósito: cuando se ve el pie, el cierre con su
    // dorado ya ha pasado y la barra sobra. Observarlo sustituye a la constante
    // en píxeles que hacía ese trabajo antes, que era un número mágico y además
    // se quedaba corta cuando el pie crecía en francés.
    const targets = document.querySelectorAll('main .btn-cta, main [data-cta="call"], footer');
    if (!targets.length) return;
    const seen = ctaOnScreen.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target);
          else seen.delete(e.target);
        }
        setCtaVisible(seen.size > 0);
      },
      // Sin márgenes. Un margen inferior negativo recorta la raíz justo por
      // donde se monta la barra, así que el CTA tapado por ella dejaba de contar
      // como visible: el único caso que esto tenía que detectar era precisamente
      // ése, y el signo lo excluía. Con 0, cualquier CTA que toque la ventana
      // (tapado o no) retira la barra.
      { rootMargin: "0px" },
    );
    targets.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      seen.clear();
    };
  }, []);

  const show = scrolledPast && !ctaVisible;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <a
            data-track-loc="sticky_mobile"
            href={`https://wa.me/${t.contact.infoPhone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta w-full"
          >
            {t.hero.ctaPrimary}
            <WhatsAppIcon className="w-4 h-4" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
