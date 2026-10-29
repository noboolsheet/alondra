import { Check, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PageLink } from "@/components/PageLink";
import { CTABanner } from "@/components/CTABanner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLang } from "@/i18n/LanguageContext";
import { disciplineIcon, formatIcon } from "@/lib/icons";
import { reveal, fadeUp, staggerParent, staggerPop, staggerUp } from "@/lib/motion";
import { rich } from "@/lib/richtext";

// Which disciplines each format covers. Structural (identical across languages),
// so it lives in the component rather than the translations.
const FORMAT_DISCIPLINES: Record<string, string[]> = {
  individual: ["piano", "violin", "flute", "guitar", "bass", "voice", "soundArt"],
  pianoLab: ["piano"],
  littleMozart: ["piano", "violin", "guitar"],
};

/**
 * Formatos e instrumentos.
 *
 * La ficha de cada disciplina vivía en un modal: el texto más específico del
 * sitio quedaba detrás de un clic que un rastreador no da, y comparar dos
 * instrumentos obligaba a cerrar y abrir. Ahora son desplegables en la propia
 * página, con el mismo patrón que la FAQ y las biografías, y cada uno tiene su
 * `id` para que los chips de la portada puedan apuntar directamente a él.
 */
const Programs = () => {
  const { t } = useLang();
  const { offer, disciplines, formats } = t.programs;
  const { hash } = useLocation();

  // El desplegable apuntado por el hash (#instrument-piano) se abre solo al
  // llegar desde la tira de la portada o desde una tarjeta de formato.
  const [open, setOpen] = useState("");
  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (id.startsWith("instrument-")) setOpen(id.slice("instrument-".length));
  }, [hash]);

  const DisciplineIcon = ({ k, className }: { k: string; className: string }) => {
    const Icon: LucideIcon = disciplineIcon(k);
    return <Icon className={className} strokeWidth={1.8} />;
  };

  const ProgressItem = ({ label, text }: { label: string; text: string }) => (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/25">
        <Check className="h-3 w-3 text-primary" strokeWidth={3} />
      </span>
      <span className="text-sm text-primary/80">
        <span className="font-semibold text-primary">{label}:</span> {rich(text)}
      </span>
    </li>
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="container-narrow text-center">
          <span className="eyebrow">{t.programs.hero.eyebrow}</span>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl text-primary text-balance leading-[1.05]">
            {t.programs.hero.title}
          </h1>
          <p className="mt-6 text-lg text-primary/70 max-w-2xl mx-auto">{rich(t.programs.hero.subtitle)}</p>
        </div>
      </section>

      {/* ===== Formats — three cards, each surfacing its disciplines ===== */}
      <section className="pt-8 pb-16 md:pb-20">
        <div className="container-full">
          <motion.div {...reveal(fadeUp)} className="grid gap-6 md:gap-8 md:grid-cols-3 items-stretch">
            {formats.map((f) => {
              const Icon = formatIcon(f.key);
              const included = (FORMAT_DISCIPLINES[f.key] ?? [])
                .map((k) => disciplines.find((d) => d.key === k))
                .filter(Boolean) as typeof disciplines;
              return (
                <div
                  key={f.key}
                  className="flex flex-col rounded-3xl bg-card border border-border shadow-soft p-7 md:p-8"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15">
                      <Icon className="h-5 w-5 text-primary" strokeWidth={1.8} />
                    </span>
                    <span className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-ink">
                      {f.tag}
                    </span>
                  </div>

                  <h2 className="mt-5 font-serif text-2xl md:text-3xl text-primary">{f.title}</h2>
                  <p className="mt-3 text-primary/70 leading-relaxed">{rich(f.body)}</p>

                  <ul className="mt-5 space-y-2.5">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-accent/25">
                          <Check className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
                        </span>
                        <span className="text-sm text-primary/70">{rich(p)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary/70">{offer.includesLabel}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {included.map((d) => (
                        <PageLink
                          key={d.key}
                          to="programs"
                          hash={`instrument-${d.key}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-accent/40 hover:bg-accent/20"
                        >
                          <DisciplineIcon k={d.key} className="h-3.5 w-3.5 text-accent-ink" />
                          {d.name}
                        </PageLink>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* La teoría musical incluida. Llevaba escrito en el diccionario sin
              renderizarse en ningún sitio, y es un argumento de venta. */}
          <motion.p
            {...reveal(fadeUp)}
            className="mt-10 mx-auto max-w-2xl text-center text-sm text-primary/70 leading-relaxed"
          >
            {rich(offer.theoryFree)} {rich(offer.voiceException)}
          </motion.p>
        </div>
      </section>

      {/* ===== Las siete disciplinas, abiertas en la página ===== */}
      <section id="disciplines" className="pb-20 md:pb-28 scroll-mt-24">
        <div className="container-narrow">
          <motion.div {...reveal(fadeUp)} className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl text-primary text-balance">{t.instruments.title}</h2>
            <p className="mt-4 text-primary/70">{rich(t.instruments.subtitle)}</p>
          </motion.div>

          <motion.div {...reveal(staggerParent(0.05))}>
            <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="space-y-3">
              {disciplines.map((d) => (
                <motion.div
                  key={d.key}
                  variants={staggerUp}
                  id={`instrument-${d.key}`}
                  className="scroll-mt-24"
                >
                  <AccordionItem
                    value={d.key}
                    className="border border-border rounded-2xl bg-card px-5 md:px-6 shadow-soft data-[state=open]:shadow-lift transition-shadow"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-5">
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/15">
                          <DisciplineIcon k={d.key} className="h-5 w-5 text-primary" />
                        </span>
                        <span className="flex flex-col">
                          <span className="font-sans font-semibold text-lg md:text-xl text-primary">{d.name}</span>
                          <span className="mt-0.5 text-sm font-normal text-accent-ink">{d.tagline}</span>
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-primary/70">{offer.methodLabel}</h3>
                        <p className="mt-1.5 text-primary/70 leading-relaxed">{rich(d.method)}</p>
                      </div>

                      <div className="mt-5">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-primary/70">{offer.progressLabel}</h3>
                        <ul className="mt-2 space-y-3">
                          <ProgressItem label={offer.shortTermLabel} text={d.progress.short} />
                          <ProgressItem label={offer.longTermLabel} text={d.progress.long} />
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Journey through our academy timeline */}
      <section className="py-20 md:py-28 bg-secondary/40">
        <div className="container-wide">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="eyebrow">{t.programs.journey.eyebrow}</span>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl text-primary text-balance">{t.programs.journey.title}</h2>
            <p className="mt-4 text-primary/70">{rich(t.programs.journey.subtitle)}</p>
          </div>

          <motion.div {...reveal(fadeUp)} className="relative">
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-border" />
            <motion.div {...reveal(staggerParent(0.12))} className="grid gap-8 lg:grid-cols-5">
              {t.programs.journey.steps.map((s, i) => (
                <motion.div key={i} variants={staggerPop} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground font-serif text-2xl flex items-center justify-center mx-auto ring-8 ring-background relative z-10 shadow-soft">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 font-sans font-bold text-xl text-primary">{s.title}</h3>
                  <p className="mt-2 text-sm text-primary/70 leading-relaxed">{rich(s.body)}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <CTABanner />
    </Layout>
  );
};

export default Programs;
