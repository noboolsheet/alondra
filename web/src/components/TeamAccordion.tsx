import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLang } from "@/i18n/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { reveal, fadeUp, staggerParent, staggerUp } from "@/lib/motion";
import { rich } from "@/lib/richtext";

/**
 * El equipo, con la biografía completa de cada uno.
 *
 * La cara va en el **disparador**, no dentro del desplegable: la página enseñaba
 * primero una rejilla de fotos que no hacía más que mandarte abajo, al mismo
 * acordeón. Así se ve a quién va a entrar en tu casa con todo cerrado, y lo que
 * se despliega es sólo el texto.
 *
 * La directora llega abierta porque es la respuesta a la pregunta con la que se
 * entra («¿quién es Ilena?»), y además evita que la página arranque con cinco
 * filas cerradas y nada que leer. El hash manda sobre eso: si vienes desde un
 * «ver más» de la portada, se abre la ficha que pediste.
 */
export const TeamAccordion = () => {
  const { t } = useLang();
  const isMobile = useIsMobile();
  const { hash } = useLocation();
  const teachers = [t.teachers.director, ...t.teachers.team];

  const [open, setOpen] = useState(t.teachers.director.slug);
  useEffect(() => {
    const slug = hash.replace(/^#/, "");
    if (slug) setOpen(slug);
  }, [hash]);

  return (
    <section id="team" className="pb-20 md:pb-28 scroll-mt-24">
      <div className="container-narrow">
        <motion.div {...reveal(fadeUp)} className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-primary text-balance">{t.teachers.bios.title}</h2>
          <p className="mt-4 text-primary/70">{rich(t.teachers.bios.subtitle)}</p>
        </motion.div>

        <motion.div {...reveal(staggerParent(0.05))}>
          <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="space-y-3">
            {teachers.map((teacher) => (
              <motion.div key={teacher.slug} variants={staggerUp} id={teacher.slug} className="scroll-mt-24">
                <AccordionItem
                  value={teacher.slug}
                  className="border border-border rounded-2xl bg-card px-4 md:px-6 shadow-soft data-[state=open]:shadow-lift transition-shadow"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4 md:py-5">
                    <span className="flex items-center gap-4">
                      <img
                        src={teacher.photo}
                        alt={teacher.name}
                        loading="lazy"
                        width={600}
                        height={600}
                        className="aspect-square w-16 md:w-20 shrink-0 object-cover object-center rounded-2xl shadow-soft"
                      />
                      <span className="flex flex-col">
                        <span className="font-sans font-semibold text-lg md:text-xl text-primary">{teacher.name}</span>
                        <span className="mt-0.5 text-sm font-normal text-accent-ink">{teacher.role}</span>
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
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
