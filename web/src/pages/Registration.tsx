import { FileText, ShieldCheck, ArrowRight, Check, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { RegistrationWidget } from "@/components/RegistrationWidget";
import { useLang } from "@/i18n/LanguageContext";
import { rich } from "@/lib/richtext";

const Registration = () => {
  const { t } = useLang();

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-12 pb-10 md:pt-20 md:pb-14">
        <div className="container-narrow text-center">
          <span className="eyebrow">{t.registration.hero.eyebrow}</span>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl text-primary text-balance leading-[1.05]">{t.registration.hero.title}</h1>
          <p className="mt-6 text-lg text-primary/70 max-w-2xl mx-auto">{rich(t.registration.hero.subtitle)}</p>
          <div className="mt-8">
            <a href="#enroll" className="btn-cta">
              {t.registration.enrollCta}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* How enrollment works */}
      <section className="pb-14">
        <div className="container-full">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-primary">{t.registration.stepsTitle}</h2>
            <p className="mt-4 text-primary/70">{rich(t.registration.stepsSubtitle)}</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {t.registration.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-3xl border border-border bg-card shadow-soft p-8"
              >
                <div className="font-serif font-semibold italic text-accent text-4xl leading-none">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-4 font-serif text-2xl text-primary">{step.title}</h3>
                <p className="mt-2 text-sm text-primary/70 leading-relaxed">{rich(step.body)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enrollment agreement / contract */}
      <section className="pb-14">
        <div className="container-wide max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-border bg-secondary/40 p-8 md:p-12"
          >
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-primary">{t.registration.contract.title}</h2>
                <p className="mt-3 text-primary/70 leading-relaxed">{rich(t.registration.contract.body)}</p>
                <ul className="mt-5 space-y-3">
                  {t.registration.contract.points.map((p) => (
                    <li key={p.label} className="flex items-start gap-3">
                      <Check className="mt-1 h-4 w-4 flex-shrink-0 text-accent-ink" strokeWidth={2.5} />
                      <span className="text-primary/70 leading-relaxed">
                        <span className="font-semibold text-primary">{p.label}:</span> {rich(p.body)}
                      </span>
                    </li>
                  ))}
                </ul>
          </motion.div>
        </div>
      </section>

      {/* Pricing by lesson type */}
      <section className="pb-16">
        <div className="container-full">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-primary">{t.registration.pricingTitle}</h2>
            <p className="mt-4 text-primary/70">{rich(t.registration.pricingSubtitle)}</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {t.registration.formats.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-3xl border border-border bg-card shadow-soft p-8 flex flex-col"
              >
                <h3 className="font-serif text-2xl text-primary">{f.name}</h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-sm text-primary/70">{t.registration.priceFrom}</span>
                  <span className="font-serif text-5xl text-accent-ink">{f.price}</span>
                  <span className="text-sm text-primary/70">{t.registration.priceLabel}</span>
                </div>
                <p className="mt-4 text-sm text-primary/70 leading-relaxed">{rich(f.description)}</p>
                <ul className="mt-5 space-y-2.5">
                  {f.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-ink" strokeWidth={2.5} />
                      <span className="text-sm text-primary/70">{rich(pt)}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-primary/70 text-center">
            <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />
            <span>{rich(t.registration.note)}</span>
          </p>
        </div>
      </section>

      {/* Exclusive benefits */}
      <section className="pb-16">
        <div className="container-full">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-primary">{t.registration.benefits.title}</h2>
            <p className="mt-4 text-primary/70">{rich(t.registration.benefits.subtitle)}</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {t.registration.benefits.items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-4 rounded-3xl border border-accent/30 bg-accent/10 p-8"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-accent">
                  <Gift className="h-5 w-5 text-accent-foreground" strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="font-sans font-bold text-xl text-primary">{item.title}</h3>
                  <p className="mt-1.5 text-primary/70 leading-relaxed">{rich(item.body)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enrollment widget */}
      <section id="enroll" className="py-16 md:py-24 bg-secondary/40 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-2 sm:px-6">
          <RegistrationWidget />
        </div>
      </section>
    </Layout>
  );
};

export default Registration;
