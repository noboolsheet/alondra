import { ShieldCheck, Clock, ArrowRight, Check, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PageLink } from "@/components/PageLink";
import { StepUp } from "@/components/StepUp";
import { CTABanner } from "@/components/CTABanner";
import { useLang } from "@/i18n/LanguageContext";
import { rich } from "@/lib/richtext";

/**
 * Precios, y sólo precios.
 *
 * Esta página compartía sitio con la inscripción, y el orden estaba invertido:
 * los pasos y el contrato iban antes del precio, y el widget de My Music Staff
 * cargaba un iframe de terceros para alguien que sólo venía a comparar. El
 * precio es material de evaluación; el cierre vive en /enrollment y se llega
 * desde el final de esta página.
 */
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

          {/* Cuánto dura una clase. Esto sólo existía escondido en la FAQ, y es
              parte de lo que se compra: un precio por clase no se puede comparar
              sin saber cuánto dura la clase. */}
          <div className="mt-10 mx-auto max-w-3xl rounded-3xl border border-border bg-secondary/40 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/20">
                <Clock className="h-5 w-5 text-primary" strokeWidth={1.8} />
              </span>
              <div>
                <h3 className="font-sans font-bold text-lg text-primary">{t.registration.lessonLengthTitle}</h3>
                <p className="mt-1.5 text-sm text-primary/70 leading-relaxed">{rich(t.registration.lessonLength)}</p>
              </div>
            </div>
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

      {/* Step Up For Students. Va aquí, no encima del h1 como antes: es un
          argumento de financiación y sólo pesa cuando ya se ha visto el precio. */}
      <StepUp />

      {/* La salida al cierre. En dorado a petición del cliente: en secundario no
          se veía. Convive con la llamada de descubrimiento del CTABanner, así que
          si `cta_click` muestra que se comen el uno al otro, aquí es donde mirar. */}
      <section className="pb-16 md:pb-24">
        <div className="container-narrow text-center">
          <PageLink to="enroll" className="btn-cta inline-flex">
            {t.registration.enrollCta}
            <ArrowRight className="w-4 h-4" />
          </PageLink>
        </div>
      </section>

      <CTABanner />
    </Layout>
  );
};

export default Registration;
