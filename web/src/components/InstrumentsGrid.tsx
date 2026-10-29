import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageLink } from "@/components/PageLink";
import { useLang } from "@/i18n/LanguageContext";
import { disciplineIcon } from "@/lib/icons";
import { reveal, fadeUp, staggerParent, staggerPop } from "@/lib/motion";
import { rich } from "@/lib/richtext";

/**
 * Las siete disciplinas, en corto.
 *
 * Esto era una rejilla de siete fichas con el texto completo, y el mismo texto
 * vivía otra vez en `programs.disciplines` con su método y su progreso. Ahora la
 * portada sólo abre el apetito y cada pieza lleva al desplegable de su
 * instrumento en la página de formatos, que es la fuente única.
 *
 * Una sola lista, dos formas: píldora en móvil, donde siete tarjetas serían siete
 * pantallazos de scroll, y tarjeta con icono, nombre y la frase corta a partir de
 * `md`, donde las píldoras sueltas dejaban la sección vacía. El `tagline` es el
 * mismo que se lee bajo el nombre en el desplegable de la página de formatos, así
 * que el visitante reconoce la ficha cuando llega.
 */
export const InstrumentsGrid = () => {
  const { t } = useLang();

  return (
    <section className="py-20 md:py-28 bg-secondary/40">
      <div className="container-full">
        <motion.div {...reveal(fadeUp)} className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-primary text-balance">{t.instruments.title}</h2>
          <p className="mt-4 text-primary/70 max-w-[68ch] mx-auto">{rich(t.instruments.subtitle)}</p>
        </motion.div>

        <motion.ul
          className="flex flex-wrap justify-center gap-3 md:gap-5 list-none p-0 max-w-3xl md:max-w-5xl mx-auto"
          {...reveal(staggerParent(0.06))}
        >
          {t.programs.disciplines.map((d) => {
            const Icon = disciplineIcon(d.key);
            return (
              <motion.li
                key={d.key}
                variants={staggerPop}
                className="md:basis-[calc(50%-0.625rem)] lg:basis-[calc(25%-0.9375rem)]"
              >
                <PageLink
                  to="programs"
                  hash={`instrument-${d.key}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-primary transition-all hover:border-accent/40 hover:bg-accent/15 hover:-translate-y-0.5 md:flex md:h-full md:w-full md:flex-col md:items-start md:gap-0 md:rounded-3xl md:px-6 md:py-7 md:shadow-soft md:hover:bg-card md:hover:shadow-lift md:hover:-translate-y-1 md:duration-500"
                >
                  <span className="md:mb-4 md:flex md:h-12 md:w-12 md:items-center md:justify-center md:rounded-2xl md:bg-accent/20 md:transition-all md:group-hover:bg-accent md:group-hover:rotate-6">
                    <Icon className="h-4 w-4 text-accent-ink md:h-6 md:w-6 md:text-primary" strokeWidth={1.8} />
                  </span>
                  <span className="font-medium md:font-serif md:text-2xl md:font-normal md:text-primary">{d.name}</span>
                  <span className="hidden md:mt-2 md:block md:text-sm md:leading-relaxed md:text-primary/70">
                    {d.tagline}
                  </span>
                </PageLink>
              </motion.li>
            );
          })}
        </motion.ul>

        <motion.div {...reveal(fadeUp)} className="mt-10 text-center">
          <PageLink
            to="programs"
            className="inline-flex items-center gap-1.5 text-accent-ink font-semibold hover:gap-2.5 transition-all"
          >
            {t.instruments.cta}
            <ArrowRight className="w-4 h-4" />
          </PageLink>
        </motion.div>
      </div>
    </section>
  );
};
