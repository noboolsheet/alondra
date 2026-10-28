import { PageLink } from "@/components/PageLink";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { rich } from "@/lib/richtext";
import logoUrl from "@/assets/logo-alondra.png";

export const Footer = () => {
  const { t } = useLang();

  const legalLinks = [
    { label: t.legal.links.privacy, page: "privacy" as const },
    { label: t.legal.links.cookies, page: "cookies" as const },
    { label: t.legal.links.notice, page: "legal" as const },
  ];

  return (
    <footer className="on-brand-dark mt-24 bg-primary text-primary-foreground">
      <div className="container-full py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          {/* Brand block */}
          <div className="lg:-mt-8 lg:self-start max-w-[16rem]">
            <img src={logoUrl} alt="Alondra Music Academy" width={320} height={320} loading="lazy" className="w-32 h-32 md:w-36 md:h-36 rounded-full" />
            <p className="mt-5 text-sm text-primary-foreground/70 leading-relaxed">{rich(t.footer.tagline, "font-semibold text-primary-foreground")}</p>
            {/* Contact */}
            <div className="mt-6 flex flex-col gap-2 text-sm text-primary-foreground/70">
              <a data-track-loc="footer" href={`mailto:${t.contact.infoEmail}`} className="inline-flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Mail className="w-4 h-4" /> {t.contact.infoEmail}
              </a>
              <a data-track-loc="footer" href={`tel:${t.contact.infoPhone.replace(/\D/g, "")}`} className="inline-flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Phone className="w-4 h-4" /> {t.contact.infoPhone}
              </a>
            </div>
            {/* Socials */}
            <div className="mt-4 flex gap-3">
              <a href="https://www.instagram.com/alondra_music_academy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-11 h-11 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:text-primary hover:border-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/people/Alondra-Music-Academy/61590624003294/#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-11 h-11 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:text-primary hover:border-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                <Facebook className="w-4 h-4" />
              </a>
              <a data-track-loc="footer" href="https://wa.me/17868431028" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-11 h-11 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:text-primary hover:border-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                <WhatsAppIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns — grouped together on the right */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {t.footer.columns.map((col) => (
              <div key={col.title}>
                <h2 className="text-[11px] font-bold tracking-[0.25em] uppercase text-accent mb-4">{col.title}</h2>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <PageLink to={l.page} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                        {l.label}
                      </PageLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="text-[11px] font-bold tracking-[0.25em] uppercase text-accent mb-4">{t.legal.footerHeading}</h2>
              <ul className="space-y-2.5">
                {legalLinks.map((l) => (
                  <li key={l.page}>
                    <PageLink to={l.page} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                      {l.label}
                    </PageLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-xs text-primary-foreground/70">
            © {new Date().getFullYear()} Alondra Music Academy · {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
};
