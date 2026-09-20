import { motion } from "framer-motion";
import { Piano, Mic, Guitar, Music, Music2, Music3, Music4, AudioLines } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { reveal, fadeUp, staggerParent, staggerPop } from "@/lib/motion";
import { rich } from "@/lib/richtext";

// Positional — must match the order of t.instruments.items:
// Piano, Violin, Voice, Guitar, Flute, Electric Bass, The Art of Sound.
const ICONS = [Piano, Music2, Mic, Guitar, Music4, Music3, AudioLines];

export const InstrumentsGrid = () => {
  const { t } = useLang();

  return (
    <section className="py-20 md:py-28 bg-secondary/40">
      <div className="container-full">
        <motion.div {...reveal(fadeUp)} className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-primary text-balance">{t.instruments.title}</h2>
          <p className="mt-4 text-primary/70">{rich(t.instruments.subtitle)}</p>
        </motion.div>

        <motion.div className="flex flex-wrap justify-center gap-4" {...reveal(staggerParent(0.07))}>
          {t.instruments.items.map((it, i) => {
            const Icon = ICONS[i] ?? Music;
            return (
              <motion.div
                key={i}
                variants={staggerPop}
                className="group relative flex flex-col rounded-3xl bg-card border border-border p-6 hover:shadow-lift hover:-translate-y-1 transition-all duration-500 basis-full sm:basis-[calc(50%-0.6rem)] lg:basis-[calc(25%-1rem)]"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:rotate-6 transition-all">
                  <Icon className="w-6 h-6 text-primary" strokeWidth={1.8} />
                </div>
                <h3 className="font-serif text-2xl text-primary">{it.name}</h3>
                <p className="mt-2 text-sm text-primary/70 leading-relaxed">{rich(it.body)} {rich(it.focus)}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
