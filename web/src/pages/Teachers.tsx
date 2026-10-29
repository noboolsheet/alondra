import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Briefcase } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageLink } from "@/components/PageLink";
import { TeamAccordion } from "@/components/TeamAccordion";
import { CTABanner } from "@/components/CTABanner";
import { useLang } from "@/i18n/LanguageContext";
import { reveal, fadeUp } from "@/lib/motion";
import { rich } from "@/lib/richtext";

/**
 * Conoce a los profesores.
 *
 * Las biografías completas vivían al final de la página de empleo, y ahí
 * apuntaban todos los «ver más» de la portada y de la academia: un padre que
 * quería leer sobre su profesora aterrizaba en un anuncio de trabajo. Esta
 * página es su sitio, y es también la que sostiene el mensaje de que Ilena
 * selecciona al profesor: quien lo lee quiere ver a quién.
 *
 * Aquí no hay rejilla de retratos por delante del acordeón. Enseñaba las caras
 * para, al clicarlas, mandarte más abajo a las mismas caras; y repetía de Ilena
 * un resumen que es palabra por palabra el primer párrafo de su biografía. Las
 * fotos están ahora en el propio desplegable, visibles con todo cerrado.
 *
 * El proceso de verificación se queda en /about, que es la página de confianza
 * de la academia; aquí va el enlace, porque es justo donde se pregunta.
 */
const Teachers = () => {
  const { t } = useLang();

  const links = [
    { icon: ShieldCheck, to: "about" as const, data: t.teachers.vetting },
    { icon: Briefcase, to: "careers" as const, data: t.teachers.hiring },
  ];

  return (
    <Layout>
      <section className="pt-12 pb-10 md:pt-20 md:pb-16">
        <div className="container-narrow text-center">
          <span className="eyebrow">{t.teachers.hero.eyebrow}</span>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl text-primary text-balance leading-[1.05]">{t.teachers.hero.title}</h1>
          <p className="mt-6 text-lg text-primary/70 max-w-2xl mx-auto">{rich(t.teachers.hero.subtitle)}</p>
        </div>
      </section>

      <TeamAccordion />

      {/* Si no conecta con su profesor. Va justo debajo de las fichas, porque es
          exactamente donde un padre se pregunta «¿y si no se llevan bien?». */}
      <section className="pb-16 md:pb-20">
        <div className="container-narrow">
          <motion.p
            {...reveal(fadeUp)}
            className="mx-auto max-w-2xl text-center text-sm text-primary/70 leading-relaxed"
          >
            {rich(t.teachers.matchPromise)}
          </motion.p>
        </div>
      </section>

      {/* Las dos salidas de esta página: el proceso de verificación, que vive en
          la academia, y la candidatura para quien llega buscando trabajo. */}
      <section className="pb-20 md:pb-28">
        <div className="container-full">
          <motion.div {...reveal(fadeUp)} className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {links.map(({ icon: Icon, to, data }) => (
              <div key={to} className="flex flex-col rounded-3xl border border-border bg-card shadow-soft p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20">
                  <Icon className="h-6 w-6 text-primary" strokeWidth={1.8} />
                </span>
                <h2 className="mt-5 font-serif text-2xl text-primary text-balance">{data.title}</h2>
                <p className="mt-3 text-primary/70 leading-relaxed">{rich(data.body)}</p>
                <PageLink
                  to={to}
                  className="mt-auto pt-6 inline-flex items-center gap-1.5 text-accent-ink font-semibold hover:gap-2.5 transition-all self-start"
                >
                  {data.cta}
                  <ArrowRight className="w-4 h-4" />
                </PageLink>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <CTABanner />
    </Layout>
  );
};

export default Teachers;
