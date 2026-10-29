import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageLink } from "@/components/PageLink";
import { useLang } from "@/i18n/LanguageContext";
import { useTrack } from "@/lib/analytics";
import { motion } from "framer-motion";
import { reveal, fadeUp, staggerParent, staggerUp } from "@/lib/motion";
import { rich } from "@/lib/richtext";

/**
 * Preguntas frecuentes.
 *
 * Lo que no está en la lista no se explica aquí: se manda a la llamada. Había
 * una tarea para publicar las condiciones de contratación (duración, ausencias,
 * quién entra en casa, cómo se comunica el progreso) y la decisión del 29 de
 * octubre es que las responda Ilena en persona, que puede hacerlo con la edad y
 * el horario del niño delante en vez de con una regla general.
 */
export const FAQ = () => {
  const { t } = useLang();
  const track = useTrack();
  return (
    <section id="faq" className="scroll-mt-20 md:scroll-mt-24 py-20 md:py-28 bg-secondary/30">
      <div className="container-narrow">
        <motion.div {...reveal(fadeUp)} className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl text-primary">{t.faq.title}</h2>
        </motion.div>

        <motion.div {...reveal(staggerParent(0.05))}>
          <Accordion type="single" collapsible className="space-y-3">
            {t.faq.items.map((it, i) => (
              <motion.div key={i} variants={staggerUp}>
                <AccordionItem
                  value={`item-${i}`}
                  className="border border-border rounded-2xl bg-card px-5 md:px-6 shadow-soft data-[state=open]:shadow-lift transition-shadow"
                >
                  <AccordionTrigger className="text-left font-sans font-semibold text-lg md:text-xl text-primary data-[state=open]:text-primary-soft dark:data-[state=open]:text-accent-ink transition-colors hover:no-underline py-5">
                    {it.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-primary/70 leading-relaxed pb-5 text-base">
                    {rich(it.a)}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        <motion.p {...reveal(fadeUp)} className="mt-10 mx-auto max-w-[68ch] text-center text-primary/70 leading-relaxed">
          {rich(t.faq.more)}{" "}
          <PageLink
            to="contact"
            className="inline-flex items-center gap-1.5 font-semibold text-accent-ink hover:gap-2.5 transition-all"
            onClick={() => track("cta_click", { location: "faq", label: "discovery_call" })}
          >
            {t.ctaBanner.button}
            <ArrowRight className="w-4 h-4" />
          </PageLink>
        </motion.p>
      </div>
    </section>
  );
};
