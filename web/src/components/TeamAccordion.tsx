import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLang } from "@/i18n/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { reveal, fadeUp, staggerParent, staggerUp } from "@/lib/motion";
import { rich } from "@/lib/richtext";

/**
 * El equipo, con la biografía completa de cada uno.
 *
 * La cara va **fuera** del desplegable, no dentro: la página enseñaba primero
 * una rejilla de fotos que no hacía más que mandarte abajo, al mismo acordeón.
 * Así se ve a quién va a entrar en tu casa con todo cerrado.
 *
 * Y la foto crece al abrir. Cerrada es una miniatura junto al nombre, que es lo
 * que hace legible una lista de seis; abierta es la ficha de una persona, y ahí
 * una miniatura de 64 píxeles no sirve de nada. En móvil pasa a ocupar el ancho
 * completo con el texto debajo; en escritorio se coloca a la izquierda y la
 * biografía corre a su lado, que aprovecha el ancho en vez de empujar el texto
 * media pantalla hacia abajo.
 *
 * El estado abierto se lee de `open`, no de `data-state`: la foto vive fuera del
 * disparador, así que no hay un `group` del que colgarse, y este componente ya
 * controla el acordeón.
 *
 * La directora llega abierta porque es la respuesta a la pregunta con la que se
 * entra, y evita que la página arranque con seis filas cerradas y nada que leer.
 * El hash manda sobre eso: si vienes desde un «ver más» de la portada, se abre
 * la ficha que pediste.
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
            {teachers.map((teacher) => {
              const isOpen = open === teacher.slug;
              return (
                <motion.div key={teacher.slug} variants={staggerUp} id={teacher.slug} className="scroll-mt-24">
                  <AccordionItem
                    value={teacher.slug}
                    className="border border-border rounded-2xl bg-card px-4 md:px-6 shadow-soft data-[state=open]:shadow-lift transition-shadow"
                  >
                    <div
                      className={cn(
                        "flex gap-4",
                        isOpen
                          ? "flex-col items-stretch md:flex-row md:items-stretch md:gap-6"
                          : "items-center",
                      )}
                    >
                      <img
                        src={teacher.photo}
                        alt={teacher.name}
                        loading="lazy"
                        width={600}
                        height={600}
                        className={cn(
                          "shrink-0 object-cover rounded-2xl shadow-soft",
                          "transition-[width,margin] duration-500 motion-reduce:transition-none",
                          isOpen
                            // Escritorio: la foto se estira a la altura de la ficha
                            // entera en vez de quedarse como un cuadrado pequeño
                            // arriba. `object-top` porque al recortar a vertical el
                            // centro de un retrato cuadrado deja la cara fuera.
                            ? "aspect-square object-center w-full mt-5 md:mt-5 md:mb-5 md:w-56 lg:w-64 md:aspect-auto md:h-auto md:self-stretch md:max-h-[26rem] md:object-top"
                            : "aspect-square object-center w-16 md:w-20 my-4 md:my-5",
                        )}
                      />

                      <div className="min-w-0 flex-1">
                        <AccordionTrigger className="text-left hover:no-underline py-4 md:py-5">
                          <span className="flex flex-col">
                            <span className="font-sans font-semibold text-lg md:text-xl text-primary">{teacher.name}</span>
                            <span className="mt-0.5 text-sm font-normal text-accent-ink">{teacher.role}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6">
                          <div
                            onClick={() => {
                              if (!isMobile) return;
                              // Subir primero, y sin animación. Al revés (cerrar y después
                              // hacer scroll suave) el scroll corría mientras el panel se
                              // plegaba y la página se acortaba bajo los pies: el navegador
                              // perdía el destino y se veía venir la ficha desde abajo dando
                              // un giro. Así el cierre se ve desde la cabecera de la tarjeta,
                              // igual que cuando se pulsa el disparador. `instant` es
                              // necesario porque `html` lleva `scroll-behavior: smooth`.
                              document
                                .getElementById(teacher.slug)
                                ?.scrollIntoView({ behavior: "instant", block: "start" });
                              setOpen("");
                            }}
                            className="space-y-3 text-primary/70 leading-relaxed text-[15px] cursor-pointer md:cursor-auto"
                          >
                            {teacher.bio.map((paragraph, i) => (
                              <p key={i}>{rich(paragraph)}</p>
                            ))}
                          </div>
                        </AccordionContent>
                      </div>
                    </div>
                  </AccordionItem>
                </motion.div>
              );
            })}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
