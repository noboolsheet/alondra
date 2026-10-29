import { BadgeDollarSign, FileCheck2, Languages, Home } from "lucide-react";
import { motion } from "framer-motion";
import { PageLink } from "@/components/PageLink";
import { useLang } from "@/i18n/LanguageContext";
import { reveal, fadeUp, staggerParent, staggerPop } from "@/lib/motion";
import { rich } from "@/lib/richtext";

const ICONS = [BadgeDollarSign, FileCheck2, Languages, Home];

/**
 * Step Up For Students.
 *
 * Es la respuesta más barata que existe a la objeción que de verdad frena a las
 * familias: el precio. Para una familia con beca, la conversación deja de ser
 * «cuánto cuesta» y pasa a ser «te ayudo con el trámite».
 *
 * El ángulo NO es «aceptamos Step Up» a secas: la Fase 5 avisa de que no es
 * exclusivo y de que la competencia ya lo comunica con fuerza. Lo que sólo tiene
 * Alondra es la combinación — proveedor directo, trámite acompañado, atención en
 * tres idiomas y clases a domicilio — y por eso la sección son cuatro puntos y
 * no un logotipo.
 *
 * La nota del final no es letra pequeña defensiva: quién califica lo decide Step
 * Up, no la academia, y prometer lo contrario sería justo el tipo de afirmación
 * que la disciplina de claims no permite.
 */
export const StepUp = () => {
  const { t } = useLang();

  return (
    <section className="py-20 md:py-28 bg-secondary/40">
      <div className="container-wide">
        <motion.div {...reveal(fadeUp)} className="max-w-2xl">
          <span className="eyebrow">{t.stepUp.eyebrow}</span>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl text-primary text-balance leading-[1.1]">
            {t.stepUp.title}
          </h2>
          <p className="mt-6 text-lg text-primary/70 leading-relaxed">{rich(t.stepUp.body)}</p>
        </motion.div>

        <motion.ul
          {...reveal(staggerParent())}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 list-none p-0"
        >
          {t.stepUp.points.map((point, i) => {
            const Icon = ICONS[i];
            return (
              <motion.li
                key={point.title}
                variants={staggerPop}
                className="rounded-2xl bg-card border border-border p-6"
              >
                <Icon className="w-6 h-6 text-accent-ink" strokeWidth={1.8} />
                <h3 className="mt-4 font-sans font-bold text-lg text-primary">{point.title}</h3>
                <p className="mt-2 text-sm text-primary/70 leading-relaxed">{point.body}</p>
              </motion.li>
            );
          })}
        </motion.ul>

        <motion.p {...reveal(fadeUp)} className="mt-8 text-sm text-primary/60 max-w-2xl">
          {t.stepUp.note}{" "}
          <PageLink to="contact" className="font-semibold text-accent-ink underline underline-offset-2">
            {t.ctaBanner.button}
          </PageLink>
        </motion.p>
      </div>
    </section>
  );
};
