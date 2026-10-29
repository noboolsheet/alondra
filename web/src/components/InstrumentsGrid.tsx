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
 * portada sólo abre el apetito y cada chip lleva al desplegable de su
 * instrumento en la página de formatos, que es la fuente única.
 */
export const InstrumentsGrid = () => {
  const { t } = useLang();

  return (
    <section className="py-20 md:py-28 bg-secondary/40">
      <div className="container-full">
        <motion.div {...reveal(fadeUp)} className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-primary text-balance">{t.instruments.title}</h2>
          <p className="mt-4 text-primary/70">{rich(t.instruments.subtitle)}</p>
        </motion.div>

        <motion.ul
          className="flex flex-wrap justify-center gap-3 list-none p-0 max-w-3xl mx-auto"
          {...reveal(staggerParent(0.06))}
        >
          {t.programs.disciplines.map((d) => {
            const Icon = disciplineIcon(d.key);
            return (
              <motion.li key={d.key} variants={staggerPop}>
                <PageLink
                  to="programs"
                  hash={`instrument-${d.key}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-primary transition-all hover:border-accent/40 hover:bg-accent/15 hover:-translate-y-0.5"
                >
                  <Icon className="h-4 w-4 text-accent-ink" strokeWidth={1.8} />
                  <span className="font-medium">{d.name}</span>
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
