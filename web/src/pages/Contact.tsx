import { Mail, Phone, Clock } from "lucide-react";
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
      <section className="py-16 md:py-24">
        <div className="container-wide grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="on-brand-dark rounded-3xl bg-gradient-hero p-8 text-primary-foreground">
              <h2 className="font-serif text-2xl">{t.contact.infoTitle}</h2>
              <div className="mt-6 space-y-4">
                <a data-track-loc="contact_page" href={`mailto:${t.contact.infoEmail}`} className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-foreground/70">Email</div>
                    <div className="text-primary-foreground mt-0.5 break-all group-hover:text-accent transition-colors">{t.contact.infoEmail}</div>
                  </div>
                </a>
                <a data-track-loc="contact_page" href={`tel:${t.contact.infoPhone.replace(/\D/g, "")}`} className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-foreground/70">Phone</div>
                    <div className="text-primary-foreground mt-0.5 break-words group-hover:text-accent transition-colors">{t.contact.infoPhone}</div>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-foreground/70">{t.contact.infoHours}</div>
                    <div className="text-primary-foreground mt-0.5">{t.contact.infoHoursValue}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
