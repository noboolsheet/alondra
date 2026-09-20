import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLang } from "@/i18n/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { reveal, fadeUp, staggerParent, staggerUp } from "@/lib/motion";
import { rich } from "@/lib/richtext";

// Lista desplegable de todo el equipo (directora + profesores), con la biografía
// completa y la foto. Reutiliza el patrón del FAQ (Accordion de shadcn/Radix). El
// item apuntado por el hash (#profe-...) se abre solo al llegar desde "ver más".
export const TeamAccordion = () => {
  const { t } = useLang();
  const isMobile = useIsMobile();
  const { hash } = useLocation();
  const teachers = [t.teachers.director, ...t.about.team.members];

  const [open, setOpen] = useState("");
  useEffect(() => {
    const slug = hash.replace(/^#/, "");
    if (slug) setOpen(slug);
  }, [hash]);

  return (
    <section id="team" className="py-20 md:py-28 scroll-mt-24">
      <div className="container-narrow">
        <motion.div {...reveal(fadeUp)} className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-primary text-balance">{t.careers.teamTitle}</h2>
          <p className="mt-4 text-primary/70">{rich(t.careers.teamSubtitle)}</p>
        </motion.div>

        <motion.div {...reveal(staggerParent(0.05))}>
          <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="space-y-3">
            {teachers.map((teacher) => (
              <motion.div key={teacher.slug} variants={staggerUp} id={teacher.slug} className="scroll-mt-24">
                <AccordionItem
                  value={teacher.slug}
                  className="border border-border rounded-2xl bg-card px-5 md:px-6 shadow-soft data-[state=open]:shadow-lift transition-shadow"
                >
                  <AccordionTrigger className="text-left font-sans font-semibold text-lg md:text-xl text-primary data-[state=open]:text-primary-soft dark:data-[state=open]:text-accent-ink transition-colors hover:no-underline py-5">
                    <span className="flex flex-col">
                      {teacher.name}
                      <span className="mt-0.5 text-sm font-normal text-accent-ink">{teacher.role}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <img
                        src={teacher.photo}
                        alt={teacher.name}
                        loading="lazy"
                        width={600}
                        height={600}
                        className="aspect-square w-44 sm:w-52 shrink-0 object-cover object-center rounded-2xl"
                      />
                      <div
                        onClick={() => {
                          if (!isMobile) return;
                          setOpen("");
                          // Al cerrar desde el fondo del texto, la página se acorta y el
                          // scroll quedaría en el footer; devolvemos la vista a la ficha.
                          requestAnimationFrame(() =>
                            document.getElementById(teacher.slug)?.scrollIntoView({ behavior: "smooth", block: "start" }),
                          );
                        }}
                        className="space-y-3 text-primary/70 leading-relaxed text-[15px] cursor-pointer md:cursor-auto"
                      >
                        {teacher.bio.map((paragraph, i) => (
                          <p key={i}>{rich(paragraph)}</p>
                        ))}
                      </div>
                    </div>
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
