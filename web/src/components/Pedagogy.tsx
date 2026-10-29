import { Hand, Activity, BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { reveal, fadeUp, staggerParent, staggerSide } from "@/lib/motion";
import { rich } from "@/lib/richtext";

// Un icono por dimensión. Antes eran tres y el primero era un cerebro: el icono
// iba a juego con la promesa cognitiva que esta seccion acaba de dejar de hacer.
const ICONS = [Hand, Activity, BookOpen, Sparkles];

export const Pedagogy = () => {
  const { t } = useLang();
  return (
    <section className="py-20 md:py-28">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <motion.div {...reveal(fadeUp)}>
            <span className="eyebrow">{t.pedagogy.eyebrow}</span>
            <h2 className="mt-4 font-serif text-3xl md:text-4xl text-primary text-balance leading-[1.1]">
              {t.pedagogy.title}
            </h2>
            <p className="mt-6 text-lg text-primary/70 leading-relaxed">{rich(t.pedagogy.body)}</p>
          </motion.div>
          <motion.div className="divide-y divide-border" {...reveal(staggerParent())}>
            {t.pedagogy.pillars.map((p, i) => {
              const Icon = ICONS[i];
              return (
                <motion.div key={i} variants={staggerSide(1)} className="flex gap-5 py-6 first:pt-0 last:pb-0">
                  <Icon className="w-6 h-6 text-accent-ink flex-shrink-0 mt-1" strokeWidth={1.8} />
                  <div>
                    <h3 className="font-sans font-bold text-xl text-primary">{p.title}</h3>
                    <p className="mt-1.5 text-primary/70 leading-relaxed">{rich(p.body)}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
