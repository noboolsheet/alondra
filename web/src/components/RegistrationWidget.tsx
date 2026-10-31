import { Calendar, Loader2, RotateCw } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { useLang } from "@/i18n/LanguageContext";
import { useIframeStatus } from "@/hooks/use-iframe-status";
import { rich } from "@/lib/richtext";

// The My Music Staff v4 widget uses document.write(), which would wipe and reload
// the whole SPA if injected directly. We load it from a standalone HTML page
// (public/mms-widget.html) inside an iframe, so the widget runs in its own
// document exactly like a normal embed would.

/**
 * Nombre acordado con `public/mms-widget.html`, que es quien manda el aviso.
 *
 * No se puede compartir una constante con un fichero HTML estático, así que la
 * pareja se mantiene a mano: si cambias esta cadena, cámbiala allí.
 *
 * Por qué hace falta: esa página es nuestra y carga siempre, así que su `load`
 * llegaba aunque el script de My Music Staff estuviera bloqueado o caído. Eso
 * cancelaba el reloj y el recuadro se quedaba vacío, sin el mensaje alternativo
 * con los contactos. Ahora el formulario sólo se muestra cuando el propio
 * documento de dentro confirma que ha pintado algo.
 */
const CONFIRMACION = "alondra-mms";

export const RegistrationWidget = () => {
  const { t } = useLang();
  const { status, reloadKey, onLoad, onError, reload, containerRef } = useIframeStatus(10000, CONFIRMACION);
  const phoneDigits = t.contact.infoPhone.replace(/[^\d+]/g, "");

  return (
    <div className="relative rounded-3xl bg-card border border-border shadow-lift overflow-hidden">
      <div className="px-4 py-6 sm:p-8 md:p-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-accent/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-primary leading-none">{t.widget.title}</h3>
            <p className="text-xs text-primary/70 mt-1.5">My Music Staff</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-primary/70 leading-relaxed">{rich(t.widget.body)}</p>

        {/* My Music Staff widget, isolated in its own document. Skeleton covers the
            load; a timeout in useIframeStatus swaps to a contact fallback if it
            never loads (ad-block / CSP / slow third party). */}
        <div ref={containerRef} className="relative mt-6 -mx-4 sm:mx-0 h-[600px] sm:h-[700px]">
          {status !== "error" && (
            <iframe
              key={reloadKey}
              title="My Music Staff registration"
              src="/mms-widget.html"
              // Oculto hasta que confirme: así no se ve el recuadro a medio
              // pintar. `invisible` y no `hidden`: un iframe con `display:none`
              // no llega a pedirse con `loading="lazy"`, y entonces no podría
              // confirmar nunca.
              className={`h-full w-full border-0 bg-transparent ${status === "loaded" ? "" : "invisible"}`}
              loading="lazy"
              onLoad={onLoad}
              onError={onError}
            />
          )}

          {status === "loading" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-secondary/40"
              aria-live="polite"
            >
              <Loader2 className="h-6 w-6 text-accent-ink animate-spin motion-reduce:animate-none" />
              <p className="text-sm text-primary/70">{t.widget.loading}</p>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-secondary/40 px-6 text-center">
              <h4 className="font-serif text-xl text-primary">{t.widget.errorTitle}</h4>
              <p className="max-w-sm text-sm text-primary/70 leading-relaxed">{rich(t.widget.directHelp)}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a data-track-loc="widget"
                  href={`https://wa.me/${phoneDigits.replace(/^\+/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${t.contact.infoPhone}`}
                  className="btn-cta text-sm py-2.5 px-5"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  {t.contact.infoPhone}
                </a>
                <button type="button" onClick={reload} className="btn-outline text-sm py-2.5 px-5">
                  <RotateCw className="w-4 h-4" />
                  {t.widget.retry}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Persistent direct path — works even if the embed silently fails after load.
            Hidden in the error state, which already surfaces the same contact options. */}
        {status !== "error" && (
          <p className="mt-4 text-center text-sm text-primary/70">
            {rich(t.widget.directHelp)}{" "}
            <a data-track-loc="widget" href={`mailto:${t.contact.infoEmail}`} className="font-semibold text-accent-ink underline underline-offset-2">
              {t.contact.infoEmail}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};
