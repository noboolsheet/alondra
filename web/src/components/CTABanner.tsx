import { PageLink } from "@/components/PageLink";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { PageKey } from "@/i18n/routes";
import { useLang } from "@/i18n/LanguageContext";
import { useTrack } from "@/lib/analytics";
import { reveal, scaleIn } from "@/lib/motion";
import { rich } from "@/lib/richtext";

/**
 * El cierre de cada página, y el único dorado que debe haber en pantalla.
 *
 * `secondary` existe para la página de precios, que terminaba con dos llamadas
 * en dorado: la de descubrimiento y la de inscribirse. No competían de verdad
 * (la propia página de inscripción pregunta «¿ya hiciste tu llamada?», o sea
 * que va después), pero presentadas igual obligaban a elegir. Ahora van en el
 * mismo bloque y en orden: el dorado sigue siendo la llamada, y debajo una
 * frase que cualifica al secundario para que sólo lo pulse quien ya pasó por
 * ella. Si se añade un tercer destino aquí, vuelve el problema.
 */
type Secondary = {
  to: PageKey;
  label: string;
  /** La pregunta que filtra: quien no pueda responderla que sí, no es su botón. */
  qualifier: string;
  /** Valor de `location` en el evento, para poder comparar el reparto en GA4. */
  trackLocation: string;
};

export const CTABanner = ({ secondary }: { secondary?: Secondary }) => {
  const { t } = useLang();
  const track = useTrack();
  return (
    <section className="pt-16 pb-10">
      <div className="container-full">
        <motion.div
          {...reveal(scaleIn)}
          className="on-brand-dark relative overflow-hidden rounded-[2rem] bg-gradient-hero p-10 md:p-16 text-center dark:ring-1 dark:ring-accent/25"
        >
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_85%_0%,hsl(37_100%_60%/0.16),transparent_70%),radial-gradient(50%_50%_at_10%_100%,hsl(37_100%_60%/0.09),transparent_70%)]" />
          <div className="relative">
            <h2 className="font-serif text-3xl md:text-5xl text-primary-foreground text-balance max-w-2xl mx-auto leading-[1.1]">
              {t.ctaBanner.title}
            </h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">{rich(t.ctaBanner.body, "font-semibold text-primary-foreground")}</p>
            <div className="mt-8 flex justify-center">
              <a
                data-track-loc="cta_banner"
                href={`https://wa.me/${t.contact.infoPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta text-base"
              >
                {t.hero.ctaPrimary}
                <WhatsAppIcon className="w-4 h-4" />
              </a>
            </div>

            {secondary && (
              <div className="mt-10 pt-8 border-t border-primary-foreground/15">
                <p className="text-sm text-primary-foreground/70">{secondary.qualifier}</p>
                <div className="mt-4 flex justify-center">
                  <PageLink
                    to={secondary.to}
                    className="btn-outline-invert"
                    onClick={() => track("cta_click", { location: secondary.trackLocation, label: "enroll" })}
                  >
                    {secondary.label}
                    <ArrowRight className="w-4 h-4" />
                  </PageLink>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
