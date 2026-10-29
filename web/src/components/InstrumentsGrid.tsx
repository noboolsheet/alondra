import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageLink } from "@/components/PageLink";
import { useLang } from "@/i18n/LanguageContext";
import { disciplineIcon, formatIcon } from "@/lib/icons";
import { reveal, fadeUp, staggerParent, staggerPop } from "@/lib/motion";
import { rich } from "@/lib/richtext";

/**
 * El catálogo entero en una sola sección: qué se aprende y cómo se entrega.
 *
 * Eran dos secciones seguidas, disciplinas y formatos, con la misma
 * construcción (tarjeta `rounded-3xl`, chip de icono `bg-accent/20`, icono de
 * lucide, título serif, cuerpo al 70%) y sumaban 2,3 pantallas de móvil. Con
 * `StepUp` eran tres rejillas idénticas seguidas, que es justo lo que DESIGN.md
 * §6 pide no hacer, y el efecto no era «hay mucho donde elegir» sino que
 * ninguna sección parecía más importante que otra.
 *
 * Ahora van juntas y en dos pesos distintos: las disciplinas son la tira de
 * pastillas (lo que un padre viene buscando) y los formatos quedan como una
 * fila compacta de tres, sin cuerpo de texto. El detalle de ambos, que es el
 * texto más específico del sitio, vive en `/music-lessons`, y un solo enlace
 * lleva allí en vez de los dos que había.
 *
 * La tira de disciplinas no se toca: es la única fuente de `programs.disciplines`
 * y el enlace por el que un rastreador que no ejecuta JavaScript llega al
 * desplegable de cada instrumento.
 */
export const InstrumentsGrid = () => {
  const { t } = useLang();

  return (
    <section className="py-12 md:py-16 bg-secondary/40">
      <div className="container-full">
        <motion.div {...reveal(fadeUp)} className="text-center mb-8 max-w-2xl mx-auto">
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
                  className="group inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-primary transition-all hover:border-accent/40 hover:bg-accent/15 hover:-translate-y-0.5 md:flex md:h-full md:w-full md:flex-col md:items-start md:gap-0 md:rounded-3xl md:px-6 md:py-6 md:shadow-soft md:hover:bg-card md:hover:shadow-lift md:hover:-translate-y-1 md:duration-500"
                >
                  <span className="md:mb-3 md:flex md:h-11 md:w-11 md:items-center md:justify-center md:rounded-2xl md:bg-accent/20 md:transition-all md:group-hover:bg-accent md:group-hover:rotate-6">
                    <Icon className="h-4 w-4 text-accent-ink md:h-5 md:w-5 md:text-primary" strokeWidth={1.8} />
                  </span>
                  <span className="font-medium md:font-serif md:text-xl md:font-normal md:text-primary">{d.name}</span>
                  <span className="hidden md:mt-1.5 md:block md:text-sm md:leading-relaxed md:text-primary/70">
                    {d.tagline}
                  </span>
                </PageLink>
              </motion.li>
            );
          })}
        </motion.ul>

        {/* Los formatos, en peso menor: nombre y a quién va dirigido. El cuerpo de
            cada uno estaba repetido aquí y en `/music-lessons`. */}
        <motion.div
          {...reveal(fadeUp)}
          className="mt-10 pt-8 border-t border-border max-w-3xl md:max-w-5xl mx-auto"
        >
          <h3 className="text-center font-serif text-2xl md:text-3xl text-primary">{t.formats.title}</h3>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3 list-none p-0">
            {t.programs.formats.map((f) => {
              const Icon = formatIcon(f.key);
              return (
                <li
                  key={f.key}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent/20">
                    <Icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-serif text-lg leading-tight text-primary">{f.title}</span>
                    <span className="block text-xs text-primary/70">{f.tag}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </motion.div>

        <motion.div {...reveal(fadeUp)} className="mt-8 text-center">
          <PageLink
            to="programs"
            className="inline-flex items-center gap-1.5 py-2 text-accent-ink font-semibold hover:gap-2.5 transition-all"
          >
            {t.instruments.cta}
            <ArrowRight className="w-4 h-4" />
          </PageLink>
        </motion.div>
      </div>
    </section>
  );
};
