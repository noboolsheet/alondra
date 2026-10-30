import { ArrowRight } from "lucide-react";
import { PageLink } from "@/components/PageLink";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useLang } from "@/i18n/LanguageContext";
import { useTrack } from "@/lib/analytics";

/**
 * La llamada de descubrimiento. Un solo sitio para los cuatro botones del sitio.
 *
 * **El destino depende del tamaño, y es a propósito.** En móvil abre WhatsApp:
 * el visitante ya tiene la app, escribir le cuesta un toque y rellenar un
 * formulario a pulgar es la vía por la que se cae. En escritorio lleva a
 * `/contact`, donde decide entre escribir por WhatsApp o rellenar el formulario,
 * que es el que emite `generate_lead`. Cuando todos los botones iban a WhatsApp,
 * ese evento dejaba de dispararse y las conversiones se quedaban sin la mitad
 * del embudo.
 *
 * El icono acompaña al destino, no a la marca: glifo de WhatsApp donde abre
 * WhatsApp, flecha donde navega dentro del sitio. Un glifo de WhatsApp sobre un
 * enlace interno prometería una cosa y entregaría otra.
 *
 * Se pintan los dos y se esconde uno por CSS, no por JavaScript: las quince
 * rutas se prerenderizan, y decidir esto con `useIsMobile` dejaría en el HTML la
 * variante equivocada hasta que hidratara, con su parpadeo. Así el rastreador ve
 * siempre el enlace interno.
 */
export const CallCta = ({
  className = "",
  trackLoc,
  dataCta,
}: {
  className?: string;
  /** Origen para GA4: `hero`, `teachers`, `cta_banner`, `sticky_mobile`. */
  trackLoc: string;
  /** Marca que vigila `StickyCallBar` para apartarse cuando hay una llamada a la vista. */
  dataCta?: string;
}) => {
  const { t } = useLang();
  const track = useTrack();
  const wa = `https://wa.me/${t.contact.infoPhone.replace(/\D/g, "")}`;

  return (
    <>
      <a
        data-track-loc={trackLoc}
        data-cta={dataCta}
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn-cta sm:hidden ${className}`}
      >
        {t.hero.ctaPrimary}
        <WhatsAppIcon className="w-4 h-4" />
      </a>
      <PageLink
        to="contact"
        data-cta={dataCta}
        className={`btn-cta hidden sm:inline-flex ${className}`}
        onClick={() => track("cta_click", { location: trackLoc, label: "discovery_call" })}
      >
        {t.hero.ctaPrimary}
        <ArrowRight className="w-4 h-4" />
      </PageLink>
    </>
  );
};
