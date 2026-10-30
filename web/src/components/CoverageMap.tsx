import { MapPin, Clock, Phone, Mail, Loader2, ExternalLink } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useLang } from "@/i18n/LanguageContext";
import { useIframeStatus } from "@/hooks/use-iframe-status";
import { rich } from "@/lib/richtext";

export const CoverageMap = () => {
  const { t } = useLang();
  const { status, onLoad, onError, containerRef } = useIframeStatus();

  return (
    <section className="py-16 md:py-20 bg-secondary/40">
      <div className="container-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-stretch">
          {/* Details: activity zone, hours, contact */}
          <div className="lg:col-span-2">
            <span className="eyebrow">{t.coverage.eyebrow}</span>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl text-primary text-balance">{t.coverage.title}</h2>
            <p className="mt-4 text-primary/70 leading-relaxed">{rich(t.coverage.subtitle)}</p>

            <div className="mt-6 rounded-2xl bg-card border border-border p-5 space-y-5">
              {/* Cities */}
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="w-4 h-4 text-accent" />
                  <h3 className="font-serif text-xl">{t.coverage.citiesTitle}</h3>
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-2">
                  {t.coverage.cities.map((c) => (
                    <li key={c} className="inline-flex items-center gap-2 text-sm text-primary/80">
                      <MapPin className="w-3.5 h-3.5 text-accent/70 flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-primary/70 leading-relaxed">{rich(t.coverage.citiesNote)}</p>
              </div>

              {/* Hours */}
              <div className="pt-5 border-t border-border">
                <div className="flex items-center gap-2 text-primary">
                  <Clock className="w-4 h-4 text-accent" />
                  <h3 className="font-serif text-xl">{t.coverage.schedule}</h3>
                </div>
                <p className="mt-2 text-sm text-primary/70">{rich(t.coverage.scheduleBody)}</p>
                <div className="mt-4 grid gap-2 text-sm">
                  <div className="flex justify-between text-primary/80">
                    <span>{t.coverage.daysOpen}</span>
                    <span className="font-semibold text-primary">{t.coverage.hoursOpen}</span>
                  </div>
                  <div className="flex justify-between text-primary/80">
                    <span>{t.coverage.daysClosed}</span>
                    <span className="font-semibold text-primary/70">{t.coverage.hoursClosed}</span>
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div className="pt-5 border-t border-border">
                <div className="flex items-center gap-2 text-primary">
                  <Phone className="w-4 h-4 text-accent" />
                  <h3 className="font-serif text-xl">{t.coverage.contactsTitle}</h3>
                </div>
                <div className="mt-3 grid gap-2 text-sm">
                  <a data-track-loc="coverage" href={`tel:${t.contact.infoPhone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2.5 py-2 min-w-0 text-primary hover:text-accent-ink transition-colors">
                    <Phone className="w-4 h-4 flex-shrink-0 text-accent" />
                    <span className="break-words min-w-0">{t.contact.infoPhone}</span>
                  </a>
                  <a data-track-loc="coverage" href={`mailto:${t.contact.infoEmail}`} className="flex items-center gap-2.5 py-2 min-w-0 text-primary hover:text-accent-ink transition-colors">
                    <Mail className="w-4 h-4 flex-shrink-0 text-accent" />
                    <span className="break-all min-w-0">{t.contact.infoEmail}</span>
                  </a>
                  {/* El telefono de arriba marca; este escribe. Son dos vias
                      distintas al mismo numero y conviene que se vean las dos:
                      el icono dice cual es cual. */}
                  <a
                    data-track-loc="coverage"
                    href={`https://wa.me/${t.contact.infoPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 py-2 min-w-0 text-primary hover:text-accent-ink transition-colors"
                  >
                    <WhatsAppIcon className="w-4 h-4 flex-shrink-0 text-accent" />
                    <span className="min-w-0">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Real map — Miami, Florida */}
          <div className="lg:col-span-3">
            <div
              ref={containerRef}
              className="relative w-full rounded-3xl overflow-hidden border border-border shadow-soft aspect-[4/3] lg:aspect-auto lg:h-full min-h-[360px]"
            >
              {status !== "error" && (
                <iframe
                  title="Alondra Music Academy, Miami service area"
                  src="https://www.google.com/maps?q=Miami,Florida,USA&z=10&output=embed"
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  onLoad={onLoad}
                  onError={onError}
                />
              )}

              {status === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/40" aria-hidden="true">
                  <Loader2 className="h-6 w-6 text-accent-ink animate-spin motion-reduce:animate-none" />
                </div>
              )}

              {status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-secondary/40 px-6 text-center">
                  <MapPin className="h-7 w-7 text-accent" />
                  <p className="text-sm text-primary/70">{rich(t.coverage.mapUnavailable)}</p>
                  <a
                    href="https://www.google.com/maps?q=Miami,Florida,USA&z=10"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-sm py-2.5 px-5"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t.coverage.mapCta}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
