import { PageLink } from "@/components/PageLink";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { rich } from "@/lib/richtext";
// El PNG original (1920 x 1920, 153 KB) se queda en el repo como fuente, pero lo
// que se sirve es el WebP a 384: se pinta a 144 px como mucho, asi que el PNG era
// 6,7 veces mas grande de lo necesario y el tercer fichero mas pesado del build.
import logoUrl from "@/assets/logo-alondra.webp";

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
          {/* 18rem, no 16: cinco iconos de 44 px con sus huecos miden 268, y a 256 el
              quinto se caía solo a una segunda fila. */}
          <div className="lg:-mt-8 lg:self-start max-w-[18rem]">
            <img src={logoUrl} alt="Alondra Music Academy" width={384} height={384} loading="lazy" className="w-32 h-32 md:w-36 md:h-36 rounded-full" />
            <p className="mt-5 text-sm text-primary-foreground/70 leading-relaxed">{rich(t.footer.tagline, "font-semibold text-primary-foreground")}</p>
            {/* Contacto y redes, en una sola fila de iconos.
                El correo y el telefono iban debajo como dos lineas de texto con
                la direccion entera, que es lo mas largo del pie y repite lo que
                ya dice el recuadro de contactos. Aqui basta el icono: la
                etiqueta accesible lleva el dato para quien no lo ve. */}
            <div className="mt-5 flex gap-3">
              <a href="https://www.instagram.com/alondra_music_academy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-11 h-11 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:text-primary hover:border-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/people/Alondra-Music-Academy/61590624003294/#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-11 h-11 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:text-primary hover:border-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
            <div className="mt-3 flex gap-3">
              <a data-track-loc="footer" href="https://wa.me/17868431028" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-11 h-11 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:text-primary hover:border-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <a data-track-loc="footer" href={`mailto:${t.contact.infoEmail}`} aria-label={t.contact.infoEmail} className="w-11 h-11 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:text-primary hover:border-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                <Mail className="w-4 h-4" />
              </a>
              <a data-track-loc="footer" href={`tel:${t.contact.infoPhone.replace(/\D/g, "")}`} aria-label={t.contact.infoPhone} className="w-11 h-11 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:text-primary hover:border-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns — grouped together on the right */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {t.footer.columns.map((col) => (
              <div key={col.title}>
                <h2 className="text-[11px] font-bold tracking-[0.25em] uppercase text-accent mb-4">{col.title}</h2>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <PageLink to={l.page} className="block py-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                        {l.label}
                      </PageLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="text-[11px] font-bold tracking-[0.25em] uppercase text-accent mb-4">{t.legal.footerHeading}</h2>
              <ul className="space-y-2">
                {legalLinks.map((l) => (
                  <li key={l.page}>
                    <PageLink to={l.page} className="block py-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
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
