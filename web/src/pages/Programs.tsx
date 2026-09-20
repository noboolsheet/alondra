import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  User,
  Users,
  Baby,
  Piano,
  Guitar,
  Mic,
  Music2,
  Music3,
  Music4,
  AudioLines,
  X,
  type LucideIcon,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { CTABanner } from "@/components/CTABanner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLang } from "@/i18n/LanguageContext";
import { reveal, fadeUp, staggerParent, staggerPop } from "@/lib/motion";
import { rich } from "@/lib/richtext";

const DISCIPLINE_ICON: Record<string, LucideIcon> = {
  piano: Piano,
  violin: Music2,
  flute: Music4,
  guitar: Guitar,
  bass: Music3,
  voice: Mic,
  soundArt: AudioLines,
};

const FORMAT_ICON: Record<string, LucideIcon> = {
  individual: User,
  pianoLab: Users,
  littleMozart: Baby,
};

// Which disciplines each format covers. Structural (identical across languages),
// so it lives in the component rather than the translations.
const FORMAT_DISCIPLINES: Record<string, string[]> = {
  individual: ["piano", "violin", "flute", "guitar", "bass", "voice", "soundArt"],
  pianoLab: ["piano"],
  littleMozart: ["piano", "violin", "guitar"],
};

const Programs = () => {
  const { t } = useLang();
  const { offer, disciplines, formats } = t.programs;
  const isMobile = useIsMobile();

  const discByKey = Object.fromEntries(disciplines.map((d) => [d.key, d]));
  type Discipline = (typeof disciplines)[number];
  const [selected, setSelected] = useState<Discipline | null>(null);

  // Shared detail body used by both the desktop dialog and the mobile drawer.
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

  const DetailBody = ({ d }: { d: Discipline }) => (
    <>
      <div className="mt-5">
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

      {d.key === "voice" && (
        <p className="mt-5 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-primary/80">
          {rich(offer.voiceException)}
        </p>
      )}
    </>
  );

  const DetailIcon = ({ d }: { d: Discipline }) => {
    const Icon = DISCIPLINE_ICON[d.key] ?? Music3;
    return (
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/15">
        <Icon className="h-6 w-6 text-primary" strokeWidth={1.8} />
      </span>
    );
  };

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
      <section className="pt-8 pb-20 md:pb-28">
        <div className="container-full">
          <motion.div {...reveal(fadeUp)} className="grid gap-6 md:gap-8 md:grid-cols-3 items-stretch">
            {formats.map((f) => {
              const Icon = FORMAT_ICON[f.key] ?? User;
              const included = (FORMAT_DISCIPLINES[f.key] ?? [])
                .map((k) => discByKey[k])
                .filter(Boolean) as Discipline[];
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
                      {included.map((d) => {
                        const ChipIcon = DISCIPLINE_ICON[d.key] ?? Music3;
                        return (
                          <button
                            key={d.key}
                            type="button"
                            onClick={() => setSelected(d)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-accent/40 hover:bg-accent/20"
                          >
                            <ChipIcon className="h-3.5 w-3.5 text-accent-ink" strokeWidth={1.8} />
                            {d.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Discipline detail — dialog on desktop, bottom drawer on mobile */}
      {isMobile ? (
        <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DrawerContent className="px-4 pb-8">
            <DrawerClose className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-primary/60 transition-colors hover:bg-secondary hover:text-primary">
              <X className="h-5 w-5" />
              <span className="sr-only">Cerrar</span>
            </DrawerClose>
            {selected && (
              <>
                <DrawerHeader className="px-0">
                  <div className="flex items-center gap-3 text-left">
                    <DetailIcon d={selected} />
                    <div>
                      <DrawerTitle className="font-serif text-2xl text-primary">{selected.name}</DrawerTitle>
                      <DrawerDescription className="font-medium text-accent-ink">{selected.tagline}</DrawerDescription>
                    </div>
                  </div>
                </DrawerHeader>
                <DetailBody d={selected} />
              </>
            )}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-lg">
            {selected && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 text-left">
                    <DetailIcon d={selected} />
                    <div>
                      <DialogTitle className="font-serif text-2xl text-primary">{selected.name}</DialogTitle>
                      <DialogDescription className="font-medium text-accent-ink">{selected.tagline}</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <DetailBody d={selected} />
              </>
            )}
          </DialogContent>
        </Dialog>
      )}

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
