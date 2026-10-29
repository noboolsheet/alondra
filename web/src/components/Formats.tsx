import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageLink } from "@/components/PageLink";
import { useLang } from "@/i18n/LanguageContext";
import { formatIcon } from "@/lib/icons";
import { reveal, fadeUp, staggerParent, staggerSide } from "@/lib/motion";
import { rich } from "@/lib/richtext";

export const Formats = () => {
  const { t } = useLang();

  return (
    <section className="py-20 md:py-28">
      <div className="container-full">
        <motion.div {...reveal(fadeUp)} className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-primary text-balance">{t.formats.title}</h2>
          <p className="mt-4 text-primary/70 max-w-[68ch] mx-auto">{rich(t.formats.subtitle)}</p>
        </motion.div>

        <motion.div className="grid gap-6 md:grid-cols-3" {...reveal(staggerParent())}>
          {t.programs.formats.map((f) => {
            const Icon = formatIcon(f.key);
            return (
              <motion.div
                key={f.key}
                variants={staggerSide(-1)}
                className="rounded-3xl bg-card border border-border p-7 flex flex-col hover:shadow-lift transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-ink">
                    {f.tag}
                  </span>
                </div>
                <h3 className="mt-5 font-serif text-2xl text-primary">{f.title}</h3>
                <p className="mt-3 text-sm text-primary/70 leading-relaxed">{rich(f.body)}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* La sección enseñaba los tres formatos y no llevaba a ninguna parte: el
            detalle (qué incluye cada uno, con qué disciplinas) vive en su página. */}
        <motion.div {...reveal(fadeUp)} className="mt-10 text-center">
          <PageLink
            to="programs"
            className="inline-flex items-center gap-1.5 text-accent-ink font-semibold hover:gap-2.5 transition-all"
          >
            {t.formats.cta}
            <ArrowRight className="w-4 h-4" />
          </PageLink>
        </motion.div>
      </div>
    </section>
  );
};
