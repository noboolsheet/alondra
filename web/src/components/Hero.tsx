import { PageLink } from "@/components/PageLink";
import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useTrack } from "@/lib/analytics";
import { rich } from "@/lib/richtext";

export const Hero = () => {
  const { t, lang } = useLang();

  /* El titular baja un escalón en francés, y sólo en francés.
     Son 89 caracteres contra 69 en inglés y 75 en español, así que a 80 px el h1
     medía 480 px (53vh) y el CTA caía en y=864: visible en una ventana de 900 px
     de alto, por debajo del pliegue en cualquier portátil de 768. La paridad
     trilingüe es un requisito de primera clase, y adaptar el escalón tipográfico
     por idioma es más honesto que recortar la copy francesa o rebajar el inglés
     a la medida del idioma más largo. El techo de 5rem de DESIGN.md §3 sigue
     siendo el del inglés y el español. */
  const long = lang === "fr";
  const titleSize = long
    ? "text-5xl sm:text-6xl md:text-6xl lg:text-7xl"
    : "text-5xl sm:text-6xl md:text-7xl lg:text-[5rem]";
  const accentSize = long
    ? "text-5xl sm:text-6xl md:text-6xl lg:text-6xl"
    : "text-5xl sm:text-6xl md:text-7xl lg:text-[4.5rem]";
  const track = useTrack();

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      {/* Full-screen horizontal hero image (optimized from imagen-sources/hero-img.png) */}
      <img
        src="/images/hero-img.webp"
        alt=""
        aria-hidden="true"
        width={1920}
        height={1075}
        // React 18 no reconoce `fetchPriority` en camelCase: avisa por consola y
        // lo quita del DOM, asi que la pista de prioridad del LCP no llegaba a
        // viajar. En minusculas si pasa. (React 19 acepta las dos.)
        {...{ fetchpriority: "high" }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Legibility scrims — theme-adaptive (light in light mode, dark in dark mode) */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 dark:via-background/85 to-background/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent pointer-events-none" />
      {/* Velo adicional, sólo por debajo de `sm`.

          La imagen lleva un reflejo muy claro y, con el recorte de `object-cover`
          a 390 px, cae justo detrás del acento dorado. El degradado horizontal
          termina al 30% por la derecha, que es donde está el acento en móvil, así
          que dejaba pasar el reflejo entero: medido, el 22% de la caja del acento
          bajaba de 3:1, con mínimos de 1,0:1. En claro falla al revés (el ámbar
          oscuro sobre el vinilo oscuro) y llegaba al 96%.

          Un velo plano al 80% deja la foto al 14-20% en el tramo derecho: sigue
          estando, deja de competir con el texto. A partir de `sm` el recorte
          aparta el reflejo del texto (allí se mide 7,1:1) y el velo no se monta,
          así que la imagen se ve entera donde hay sitio para ella. */}
      <div className="absolute inset-0 sm:hidden bg-background/80 pointer-events-none" />
      {/* En claro este halo dorado, con el vinilo cálido asomando al 85%, teñía el
          tercio izquierdo del campo de melocotón: la Regla del No-Crema dice que el
          calor lo trae el oro y la imagen, nunca el fondo. En oscuro no pasa. */}
      <div className="absolute top-24 -left-20 w-96 h-96 rounded-full bg-accent/[0.07] dark:bg-accent/15 blur-3xl pointer-events-none" />

      {/* El relleno lateral de móvil era `pl-10 pr-6`, que dejaba la medida del
          titular en unos 326 px. En francés el titular son 89 caracteres (contra
          69 en inglés) y el CTA caía en y≈842 de una ventana de 844: el botón
          principal quedaba en la línea del pliegue sólo en francés. Recuperar
          esos 34 px de medida, más el secundario convertido en enlace de texto,
          lo sube por encima del pliegue en los tres idiomas. */}
      <div className="relative w-full py-10 sm:py-20 md:py-28 pl-6 sm:pl-20 lg:pl-40 pr-5 sm:pr-6">
        <div className="max-w-2xl lg:max-w-3xl text-left">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className={`font-serif ${titleSize} text-primary leading-[0.98] text-balance`}
          >
            {t.hero.title1}{" "}
            <span className={`font-serif font-normal italic text-accent-display ${accentSize} block sm:inline mt-2 sm:mt-0`}>
              {t.hero.title2}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-primary/70 max-w-xl leading-relaxed"
          >
            {rich(t.hero.subtitle)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5"
          >
            {/* El primario va primero. Estaba detras del secundario, asi que en
                movil el primer boton que alcanzaba el pulgar era «ver las
                clases», que sale del embudo. */}
            {/* Mobile: the discovery-call CTA opens WhatsApp directly (uses the
                contact phone number). Desktop keeps the routed contact page.
                Its label names WhatsApp: the same words on both would promise
                the same destination and deliver two. */}
            <a data-track-loc="hero"
              href={`https://wa.me/${t.contact.infoPhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta sm:hidden"
            >
              {t.hero.ctaPrimaryWhatsApp}
              <WhatsAppIcon className="w-4 h-4" />
            </a>
            <PageLink
              to="contact"
              className="btn-cta hidden sm:inline-flex"
              onClick={() => track("cta_click", { location: "hero", label: "discovery_call" })}
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="w-4 h-4" />
            </PageLink>
            {/* Secundario como enlace de texto, no como píldora.
                En pastilla competía de igual a igual con la llamada: dos botones
                del mismo tamaño en la primera pantalla obligan a elegir, y el
                que sale del embudo (el catálogo de clases) es el que gana
                cuando los dos pesan lo mismo. El destino sigue existiendo y a un
                toque; lo que cambia es el peso. */}
            <PageLink
              to="programs"
              className="inline-flex items-center gap-1.5 py-2 self-start font-semibold text-accent-ink transition-all hover:gap-2.5"
            >
              {t.hero.ctaSecondary}
              <ArrowUpRight className="w-4 h-4" />
            </PageLink>
          </motion.div>

          {/* Lo que de verdad pasa al pulsar: el boton no abre un calendario. */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-4 text-sm text-primary/70 max-w-md"
          >
            {t.hero.ctaNote}
          </motion.p>

          {/* La insignia flotante de confianza (DESIGN.md §5): el Principio 2
              («enseña la prueba, no la afirmes») hecho objeto. El sistema la
              describe sobre la imagen del hero y el componente no la tenía en
              ninguna parte, así que la primera pantalla no traía ni una prueba.
              Reutiliza `hero.stat3Label`, que ya existe en los tres idiomas: no
              añade una afirmación nueva, sólo la pone donde se decide. */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-border bg-card shadow-lift px-4 py-3"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent/20">
              <ShieldCheck className="h-5 w-5 text-accent-ink" strokeWidth={1.8} />
            </span>
            <span className="text-sm font-semibold leading-tight text-primary">
              {t.hero.badge}
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
