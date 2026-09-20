import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLang } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { reveal, fadeUp, staggerParent, staggerUp } from "@/lib/motion";
import { rich } from "@/lib/richtext";

export const FAQ = () => {
  const { t } = useLang();
  return (
    <section id="faq" className="py-20 md:py-28 bg-secondary/30">
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
                  <AccordionContent className="text-primary/70 leading-relaxed pb-5 text-[15px]">
                    {rich(it.a)}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
