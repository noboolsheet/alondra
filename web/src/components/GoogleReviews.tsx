import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, ExternalLink, Pause, Play } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { fadeUp, reveal, EASE_OUT_EXPO } from "@/lib/motion";
import { googleReviews, googleProfileUrl, googleRating, googleReviewCount } from "@/data/googleReviews";

const AUTOPLAY_MS = 15000;

// A partir de aquí una reseña deja de caber en la tarjeta a tamaño de cita y se
// renderiza como texto corrido, recortado, con un botón para leerla entera. Las
// reseñas no se tocan ni se recortan en el dato: lo que cambia es cómo se pintan.
const LONG_REVIEW_CHARS = 420;

// Directional slide for the review transition (dir: 1 = forward, -1 = back).
const reviewVariants = {
  enter: (d: number) => ({ opacity: 0, x: 40 * d, scale: 0.98 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (d: number) => ({ opacity: 0, x: -40 * d, scale: 0.98 }),
};

// Inline multi-color Google "G" (no external asset, works under the site CSP).
const GoogleG = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
  </svg>
);

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex gap-1" aria-hidden="true">
    {[...Array(5)].map((_, s) => (
      <Star
        key={s}
        className={`w-4 h-4 ${s < Math.round(rating) ? "fill-accent text-accent" : "fill-primary/15 text-primary/15"}`}
      />
    ))}
  </div>
);

export const GoogleReviews = () => {
  const { t, lang } = useLang();
  const items = googleReviews;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [interacting, setInteracting] = useState(false); // hover / keyboard focus within
  // Pausa pedida a mano. `interacting` cuelga del ratón y del foco, dos cosas que
  // un móvil no emite: sin esto el carrusel avanzaba cada 15 s y en táctil no
  // había manera de pararlo, que es un fallo de WCAG 2.2.2 en nivel A.
  const [paused, setPaused] = useState(false);
  // Se vuelve a plegar al cambiar de reseña, o la siguiente llegaría expandida.
  const [expanded, setExpanded] = useState(false);
  const prefersReduced = useReducedMotion();

  const canAuto = items.length > 1 && !prefersReduced;
  // Con una reseña abierta el reloj se para. Antes seguía corriendo, así que el
  // cambio de slide le plegaba la reseña al visitante a media frase.
  const isPlaying = canAuto && !interacting && !paused && !expanded;

  // Advance via a timeout keyed on the current slide, so the progress bar and the
  // auto-advance stay in sync and reset cleanly on manual navigation.
  useEffect(() => {
    if (!isPlaying) return;
    const id = setTimeout(() => {
      setDir(1);
      setI((v) => (v + 1) % items.length);
    }, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [i, isPlaying, items.length]);

  const go = (d: number) => {
    setDir(d);
    setI((v) => (v + d + items.length) % items.length);
  };
  const jump = (idx: number) => {
    setDir(idx > i ? 1 : -1);
    setI(idx);
  };

  const review = items[i];
  const body = review.text[lang];
  const isLong = body.length > LONG_REVIEW_CHARS;

  useEffect(() => setExpanded(false), [i, lang]);

  return (
    <section className="py-20 md:py-32">
      <div className="container-wide">
        <div className="text-center mb-10">
          <motion.h2 {...reveal(fadeUp)} className="font-serif text-4xl md:text-5xl text-primary text-balance max-w-2xl mx-auto">
            {t.testimonials.title}
          </motion.h2>

          {/* Aggregate rating — links to the Google profile */}
          <a
            href={googleProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${googleRating.toFixed(1)} out of 5 · ${googleReviewCount} ${t.testimonials.reviewsSuffix} · ${t.testimonials.seeAll}`}
            className="mt-6 inline-flex items-center gap-3 rounded-full border border-border bg-card shadow-soft px-5 py-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <GoogleG className="w-5 h-5" />
            <span className="font-sans font-bold text-lg text-primary leading-none">{googleRating.toFixed(1)}</span>
            <Stars rating={googleRating} />
            <span className="text-sm text-primary/70">
              {googleReviewCount} {t.testimonials.reviewsSuffix}
            </span>
            <ExternalLink className="w-4 h-4 text-primary/70" />
          </a>
        </div>

        {/* Carousel region. Se pausa con el ratón encima, con el foco de teclado
            dentro, con la reseña larga abierta y con el botón de pausa de la fila
            de mandos, que es el único de los cuatro que existe en táctil. */}
        <div
          className="relative max-w-3xl mx-auto"
          role="group"
          aria-roledescription="carousel"
          aria-label={t.testimonials.title}
          onMouseEnter={() => setInteracting(true)}
          onMouseLeave={() => setInteracting(false)}
          onFocus={() => setInteracting(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setInteracting(false);
          }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-soft py-10 md:py-12 px-6 sm:px-10 md:px-16 min-h-[300px]">
            <Quote className="absolute top-6 left-6 w-9 h-9 text-accent/30 pointer-events-none" strokeWidth={1.5} />
            <span className="absolute top-6 right-6 pointer-events-none">
              <GoogleG className="w-6 h-6" />
            </span>

            {/* `initial={false}`: la primera reseña se pinta ya en su sitio, sin
                animar su montaje. Lo que se gana es que el HTML prerenderizado no
                la lleve en `opacity:0` (ver `src/lib/motion.ts`); el fundido y el
                deslizamiento entre reseñas, que es el que se ve de verdad, se
                mantiene intacto. */}
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={i}
                custom={dir}
                variants={reviewVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                className="text-center"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="flex justify-center mb-6">
                  <Stars rating={review.rating} />
                </div>
                {isLong ? (
                  <>
                    <blockquote
                      className={`mx-auto max-w-[62ch] text-left font-serif text-base md:text-lg text-primary leading-relaxed text-pretty ${
                        expanded ? "" : "line-clamp-[8]"
                      }`}
                    >
                      "{body}"
                    </blockquote>
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className="mt-3 text-sm font-semibold text-accent-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                    >
                      {expanded ? t.testimonials.readLess : t.testimonials.readMore}
                    </button>
                  </>
                ) : (
                  <blockquote className="font-serif text-xl md:text-2xl text-primary leading-relaxed text-balance">
                    "{body}"
                  </blockquote>
                )}
                {review.originalLang !== lang && (
                  <div className="mt-3 text-xs text-primary/70">{t.testimonials.translatedNote}</div>
                )}
                <div className="mt-6 flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-semibold text-primary">
                    {review.initial ?? review.author.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-primary leading-none">{review.author}</div>
                    {review.date && <div className="text-xs text-primary/70 mt-1">{review.date}</div>}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Una sola fila de mandos debajo de la tarjeta.
              Las flechas iban encimadas sobre la cita (`left-2` con 44 px de botón
              dentro de 48 px de padding, o sea 4 px de solape en móvil) y los
              puntos medían 6 x 6 px, cuatro veces por debajo del mínimo de
              24 x 24. Fuera de la tarjeta caben los mandos a tamaño de dedo, la
              cita recupera el ancho completo y todo cae donde llega el pulgar. */}
          {items.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous review"
                className="h-11 w-11 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-1.5">
                {items.map((_, idx) => {
                  const active = idx === i;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => jump(idx)}
                      aria-label={`Go to review ${idx + 1} of ${items.length}`}
                      aria-current={active}
                      className="group h-11 min-w-8 flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span
                        className={`block h-1.5 rounded-full transition-all duration-300 ${
                          active
                            ? "w-8 bg-primary/15 overflow-hidden"
                            : "w-1.5 bg-primary/25 group-hover:bg-primary/45"
                        }`}
                      >
                        {active &&
                          (isPlaying ? (
                            <motion.span
                              key={i}
                              className="block h-full w-full bg-accent rounded-full origin-left"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                            />
                          ) : (
                            <span className="block h-full w-full bg-accent rounded-full" />
                          ))}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next review"
                className="h-11 w-11 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {canAuto && (
                <button
                  type="button"
                  onClick={() => setPaused((v) => !v)}
                  aria-label={paused ? t.testimonials.play : t.testimonials.pause}
                  className="ml-1 h-11 w-11 rounded-full flex items-center justify-center text-primary/60 hover:text-primary hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
                >
                  {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
