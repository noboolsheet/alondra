import { Layout } from "@/components/Layout";
import { ContactForm } from "@/components/ContactForm";
import { CoverageMap } from "@/components/CoverageMap";
import { useLang } from "@/i18n/LanguageContext";
import { rich } from "@/lib/richtext";

const Contact = () => {
  const { t } = useLang();

  return (
    <Layout>
      <section className="pt-12 pb-10 md:pt-20 md:pb-16">
        <div className="container-narrow text-center">
          <span className="eyebrow">{t.contact.hero.eyebrow}</span>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl text-primary text-balance leading-[1.05]">{t.contact.hero.title}</h1>
          <p className="mt-6 text-lg text-primary/70 max-w-2xl mx-auto">{rich(t.contact.hero.subtitle)}</p>
        </div>
      </section>

      <CoverageMap />

      {/* Form + Info */}
      {/* El formulario, a solas. Al lado vivia un recuadro «contacto directo» con
          el correo, el telefono y el horario, que es exactamente lo que ya dice
          el recuadro de cobertura tres bloques mas arriba en esta misma pagina.
          Repetirlo no daba una via mas: daba la misma dos veces. */}
      <section className="py-16 md:py-24">
        <div className="container-wide max-w-3xl">
          <ContactForm />
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
