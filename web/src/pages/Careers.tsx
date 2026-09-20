import { motion } from "framer-motion";
import { Heart, CalendarClock, TrendingUp, ShieldCheck, Briefcase, MapPin } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ApplicationForm } from "@/components/ApplicationForm";
import { TeamAccordion } from "@/components/TeamAccordion";
import { useLang } from "@/i18n/LanguageContext";
import { rich } from "@/lib/richtext";

const PERK_ICONS = [Heart, CalendarClock, TrendingUp, ShieldCheck];

const Careers = () => {
  const { t } = useLang();
  const positions = t.careers.positions;

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-12 pb-10 md:pt-20 md:pb-14">
        <div className="container-narrow text-center">
          <span className="eyebrow">{t.careers.hero.eyebrow}</span>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl text-primary text-balance leading-[1.05]">{t.careers.hero.title}</h1>
          <p className="mt-6 text-lg text-primary/70 max-w-2xl mx-auto">{rich(t.careers.hero.subtitle)}</p>
        </div>
      </section>

      {/* Why work with us + perks */}
      <section className="py-12 md:py-20">
        <div className="container-full">
          <div className="grid gap-10 lg:gap-16 lg:grid-cols-2 items-center">
            {/* Left: intro copy */}
            <div className="max-w-xl">
              <h2 className="font-serif text-3xl md:text-4xl text-primary text-balance">{t.careers.whyTitle}</h2>
              <p className="mt-4 text-primary/70 leading-relaxed">{rich(t.careers.whyBody)}</p>
            </div>
            {/* Right: perk cards, two rows of two */}
            <div className="grid gap-6 sm:grid-cols-2">
              {t.careers.perks.map((p, i) => {
                const Icon = PERK_ICONS[i] ?? Heart;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="rounded-3xl bg-card border border-border p-6"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" strokeWidth={1.8} />
                    </div>
                    <h3 className="font-sans font-bold text-xl text-primary">{p.title}</h3>
                    <p className="mt-2 text-sm text-primary/70 leading-relaxed">{rich(p.body)}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section className="py-12 md:py-20">
        <div className="container-wide max-w-4xl">
          <h2 className="font-serif text-3xl md:text-4xl text-primary text-center">{t.careers.positionsTitle}</h2>

          {positions.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-border bg-secondary/40 p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-7 h-7 text-primary" strokeWidth={1.6} />
              </div>
              <h3 className="font-serif text-2xl text-primary">{t.careers.positionsEmpty}</h3>
              <p className="mt-3 text-primary/70 max-w-xl mx-auto leading-relaxed">{rich(t.careers.positionsEmptyBody)}</p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {positions.map((pos) => (
                <div key={pos.title} className="rounded-2xl bg-card border border-border p-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-sans font-bold text-xl text-primary">{pos.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-primary/70">
                      <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent" />{pos.location}</span>
                      <span className="inline-flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-accent" />{pos.type}</span>
                    </div>
                  </div>
                  <a href="#apply" className="btn-outline text-sm py-2.5 px-5">{t.careers.fields.submit}</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Spontaneous application form */}
      <section id="apply" className="py-16 md:py-24 bg-secondary/40 scroll-mt-24">
        <div className="container-wide max-w-3xl">
          <ApplicationForm />
        </div>
      </section>

      {/* Meet the team — full bios in an accordion (targets of the "ver más" links) */}
      <TeamAccordion />
    </Layout>
  );
};

export default Careers;
