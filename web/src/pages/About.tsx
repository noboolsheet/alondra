import { motion } from "framer-motion";
import { ShieldCheck, FileCheck, BrainCircuit, GraduationCap, Fingerprint, Landmark, ArrowRight } from "lucide-react";
import { PageLink } from "@/components/PageLink";
import { Layout } from "@/components/Layout";
import { PhilosophyCarousel } from "@/components/PhilosophyCarousel";
import { CTABanner } from "@/components/CTABanner";
import { useLang } from "@/i18n/LanguageContext";
import { reveal, fadeUp } from "@/lib/motion";
import { rich } from "@/lib/richtext";

const STEP_ICONS = [FileCheck, BrainCircuit, GraduationCap, ShieldCheck];
const COMPLIANCE_ICONS = [Fingerprint, ShieldCheck, Landmark];

const About = () => {
  const { t } = useLang();

  return (
    <Layout>
      <section className="pt-12 pb-10 md:pt-20 md:pb-16">
        <div className="container-narrow text-center">
          <span className="eyebrow">{t.about.hero.eyebrow}</span>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl text-primary text-balance leading-[1.05]">{t.about.hero.title}</h1>
          <p className="mt-6 text-lg text-primary/70 max-w-2xl mx-auto">{rich(t.about.hero.subtitle)}</p>
        </div>
      </section>

      {/* Philosophy — auto-scrolling photo carousel with the text below */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <PhilosophyCarousel />
          <motion.div {...reveal(fadeUp)} className="mt-10 md:mt-14 max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl text-primary text-balance text-center">{t.about.mission.title}</h2>
            <div className="mt-8 space-y-8 text-center max-w-[68ch] mx-auto">
              {t.about.mission.blocks.map((b) => (
                <div key={b.heading}>
                  <h3 className="font-sans font-bold text-xl text-primary">{b.heading}</h3>
                  <p className="mt-2 text-lg text-primary/70 leading-relaxed text-pretty">{rich(b.body)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* El equipo vive en /teachers: aquí sólo la puerta. Antes esta página
          pintaba TeachersGrid y, justo debajo, una segunda rejilla con los mismos
          profesores y el mismo titular. */}
      <section className="pb-16 md:pb-24">
        <div className="container-wide max-w-3xl">
          <motion.div {...reveal(fadeUp)} className="rounded-3xl border border-border bg-secondary/40 p-8 md:p-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-primary text-balance">{t.about.teamLink.title}</h2>
            <p className="mt-4 text-primary/70 leading-relaxed max-w-[60ch] mx-auto">{rich(t.about.teamLink.body)}</p>
            <PageLink to="teachers" className="btn-cta mt-8 inline-flex">
              {t.about.teamLink.cta}
              <ArrowRight className="w-4 h-4" />
            </PageLink>
          </motion.div>
        </div>
      </section>

      {/* Verification */}
      <section className="py-20 md:py-28">
        <div className="container-wide">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="eyebrow">{t.about.verification.eyebrow}</span>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl text-primary text-balance">{t.about.verification.title}</h2>
            <p className="mt-4 text-primary/70">{rich(t.about.verification.subtitle)}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {t.about.verification.steps.map((s, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative rounded-3xl bg-card border border-border p-6 overflow-hidden hover:shadow-lift transition-shadow"
                >
                  <div className="absolute top-4 right-4 text-6xl font-serif text-primary/5">{i + 1}</div>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-accent-foreground" strokeWidth={1.8} />
                    </div>
                    <h3 className="font-sans font-bold text-xl text-primary">{s.title}</h3>
                    <p className="mt-2 text-sm text-primary/70 leading-relaxed">{rich(s.body)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Compliance & insurance — concrete, verifiable trust signals */}
          <motion.div {...reveal(fadeUp)} className="mt-12 md:mt-16">
            <h3 className="text-center font-serif text-2xl md:text-3xl text-primary text-balance">
              {t.about.verification.compliance.title}
            </h3>
            <div className="mt-8 grid gap-8 sm:grid-cols-3 rounded-3xl border border-border bg-card p-8 md:p-10 shadow-soft">
              {t.about.verification.compliance.items.map((item, i) => {
                const Icon = COMPLIANCE_ICONS[i];
                return (
                  <div key={item.label} className="flex flex-col gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20">
                      <Icon className="h-6 w-6 text-primary" strokeWidth={1.8} />
                    </span>
                    <div>
                      <h4 className="font-sans font-bold text-lg text-primary">{item.label}</h4>
                      <p className="mt-1.5 text-sm text-primary/70 leading-relaxed">{rich(item.body)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <CTABanner />
    </Layout>
  );
};

export default About;
