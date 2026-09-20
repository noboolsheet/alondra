import { BadgeCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageLink } from "@/components/PageLink";
import { useLang } from "@/i18n/LanguageContext";
import { reveal, fadeUp, portraitIn } from "@/lib/motion";
import { rich } from "@/lib/richtext";

export const TeachersGrid = () => {
  const { t } = useLang();
  const director = t.teachers.director;

  return (
    <section className="py-20 md:py-28">
      <div className="container-full">
        <motion.div {...reveal(fadeUp)} className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-primary text-balance">{t.teachers.title}</h2>
          <p className="mt-4 text-primary/70">{rich(t.teachers.subtitle)}</p>
        </motion.div>

        <div className="grid gap-8 lg:gap-10 lg:grid-cols-2 items-center max-w-4xl mx-auto">
          {/* Director portrait */}
          <motion.div {...reveal(portraitIn)} className="relative max-w-sm w-full mx-auto lg:ml-auto lg:mr-0">
            <img
              src={director.photo}
              alt={director.name}
              loading="lazy"
              width={1086}
              height={1448}
              className="aspect-[3/4] w-full object-cover object-center rounded-3xl shadow-lift"
            />
            <div className="on-brand-dark absolute top-4 left-4 inline-flex items-center gap-1.5 bg-primary-foreground text-primary text-[10px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-soft">
              <BadgeCheck className="w-3.5 h-3.5 text-accent" />
              {t.teachers.verified}
            </div>
          </motion.div>

          {/* Description beside the photo */}
          <motion.div {...reveal(fadeUp)}>
            <h3 className="font-serif text-3xl md:text-4xl text-primary">{director.name}</h3>
            <p className="mt-2 text-accent-ink font-semibold">{director.role}</p>
            <p className="mt-5 text-primary/70 leading-relaxed">{rich(director.summary)}</p>
            <PageLink
              to="careers"
              hash={director.slug}
              className="mt-6 inline-flex items-center gap-1.5 text-accent-ink font-semibold hover:gap-2.5 transition-all"
            >
              {t.teachers.moreLink.replace("{name}", director.name.split(" ")[0])}
              <ArrowRight className="w-4 h-4" />
            </PageLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
