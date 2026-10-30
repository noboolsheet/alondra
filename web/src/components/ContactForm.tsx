import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { PageLink } from "@/components/PageLink";
import { useLang } from "@/i18n/LanguageContext";
import { useTrack } from "@/lib/analytics";
import { rich } from "@/lib/richtext";

/**
 * Los campos salen de la Fase 18, no del gusto de nadie.
 *
 * Cada uno existe porque evita una ida y vuelta por WhatsApp antes de poder
 * calificar al lead: el código postal decide cobertura y desplazamiento (por eso
 * sustituye a «ciudad», que no basta), la edad y el instrumento deciden profesor,
 * y el canal preferido es consentimiento — no se mueve a una familia a WhatsApp
 * sin que lo elija.
 *
 * `source` es el único modo de atribuir un lead que llega por Nextdoor o por
 * recomendación, donde no hay UTM que seguir: es el complemento humano de los
 * eventos de GA4, y viaja con el evento `generate_lead`.
 *
 * La casilla de promoción va SEPARADA de la de términos a propósito: enviar el
 * formulario autoriza a responder esa consulta por ese canal y nada más.
 */
const EMPTY = {
  name: "", student: "", age: "", email: "", phone: "", zip: "",
  instrument: "", channel: "", source: "", availability: "", message: "",
};

/** Obligatorios. El resto ayudan, pero no valen una fricción extra. */
const REQUIRED = ["name", "email", "phone", "zip", "instrument", "channel", "source"] as const;

export const ContactForm = () => {
  const { t } = useLang();
  const [data, setData] = useState(EMPTY);
  const [company, setCompany] = useState(""); // honeypot — real users never fill this
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const track = useTrack();
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [promo, setPromo] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    for (const key of REQUIRED) if (!data[key].trim()) e[key] = t.errors.required;
    if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = t.errors.email;
    if (data.phone.trim() && !/^[\d\s+\-()]{7,}$/.test(data.phone)) e.phone = t.errors.phone;
    if (data.zip.trim() && !/^\d{5}(-\d{4})?$/.test(data.zip.trim())) e.zip = t.errors.zip;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setSending(true);
    try {
      const res = await fetch("/api/send-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, promo, company }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSent(true);
      // En la respuesta OK, nunca en el clic del boton: si se mide el clic se
      // cuentan como leads los envios que fallaron.
      track("generate_lead", { form: "contact", source: data.source, instrument: data.instrument });
    } catch {
      setSubmitError(t.contact.errorSend);
    } finally {
      setSending(false);
    }
  };

  const field = (name: keyof typeof data, label: string, type = "text", textarea = false) => (
    <div>
      <label htmlFor={name} className="block text-xs font-semibold tracking-wide uppercase text-primary/70 mb-2">{label}</label>
      {textarea ? (
        <textarea
          id={name}
          rows={4}
          value={data[name]}
          onChange={(e) => setData({ ...data, [name]: e.target.value })}
          className="w-full rounded-xl border border-primary/20 bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-accent/40 transition-all"
        />
      ) : (
        <input
          id={name}
          type={type}
          value={data[name]}
          onChange={(e) => setData({ ...data, [name]: e.target.value })}
          className="w-full rounded-xl border border-primary/20 bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-accent/40 transition-all"
        />
      )}
      {errors[name] && <p className="mt-1.5 text-xs text-destructive">{errors[name]}</p>}
    </div>
  );

  /** Desplegable nativo: en móvil abre el selector del sistema, que para una
      familia rellenando esto desde el teléfono es mucho menos trabajo. */
  const select = (name: keyof typeof data, label: string, options: string[]) => (
    <div>
      <label htmlFor={name} className="block text-xs font-semibold tracking-wide uppercase text-primary/70 mb-2">{label}</label>
      <select
        id={name}
        value={data[name]}
        onChange={(e) => setData({ ...data, [name]: e.target.value })}
        className="w-full rounded-xl border border-primary/20 bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-accent/40 transition-all"
      >
        <option value="">{t.contact.fields.choose}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {errors[name] && <p className="mt-1.5 text-xs text-destructive">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="rounded-3xl bg-card border border-border shadow-soft p-6 sm:p-10">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-serif text-3xl text-primary">{t.contact.successTitle}</h3>
            <p className="mt-3 text-primary/70 max-w-sm mx-auto">{rich(t.contact.successBody)}</p>
            <div className="mt-6 rounded-2xl bg-secondary/50 p-5 text-left max-w-sm mx-auto space-y-1.5 text-sm">
              <p><span className="text-primary/70">{t.contact.fields.name}:</span> <span className="text-primary font-medium">{data.name}</span></p>
              <p><span className="text-primary/70">{t.contact.fields.email}:</span> <span className="text-primary font-medium">{data.email}</span></p>
              <p><span className="text-primary/70">{t.contact.fields.instrument}:</span> <span className="text-primary font-medium">{data.instrument}</span></p>
              <p><span className="text-primary/70">{t.contact.fields.channel}:</span> <span className="text-primary font-medium">{data.channel}</span></p>
            </div>
            <button
              onClick={() => {
                setSent(false);
                setSubmitError("");
                setCompany("");
                setAccepted(false);
                setPromo(false);
                setData(EMPTY);
              }}
              className="mt-6 text-sm font-semibold text-primary underline underline-offset-4 hover:text-accent-ink transition-colors"
            >
              {t.contact.successAgain}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={submit}
            className="space-y-5"
            noValidate
          >
            <div>
              <h3 className="font-serif text-3xl text-primary">{t.contact.formTitle}</h3>
              <p className="mt-2 text-sm text-primary/70">{rich(t.contact.formSubtitle)}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {field("name", t.contact.fields.name)}
              {field("student", t.contact.fields.student)}
              {field("age", t.contact.fields.age)}
              {field("zip", t.contact.fields.zip)}
              {field("email", t.contact.fields.email, "email")}
              {field("phone", t.contact.fields.phone, "tel")}
              {select("instrument", t.contact.fields.instrument, t.programs.disciplines.map((d) => d.name))}
              {select("channel", t.contact.fields.channel, t.contact.channelOptions)}
              {select("source", t.contact.fields.source, t.contact.sourceOptions)}
              {field("availability", t.contact.fields.availability)}
            </div>
            {field("message", t.contact.fields.message, "text", true)}
            {/* Honeypot — hidden from real users, catches bots */}
            <input
              type="text"
              name="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] w-px h-px opacity-0"
            />
            {/* Terms acceptance — gates the submit button */}
            <label className="flex items-start gap-3 text-sm text-primary/70 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 accent-accent cursor-pointer"
              />
              <span>{t.contact.fields.terms}</span>
            </label>
            {/* Fuera del <label>: dentro, pulsar el enlace activaría también el
                label y marcaría la casilla de paso. */}
            <p className="-mt-2 pl-7 text-sm">
              <PageLink
                to="privacy"
                className="text-accent-ink underline underline-offset-4 hover:no-underline"
              >
                {t.legal.links.privacy}
              </PageLink>
            </p>
            {/* Separada de los terminos a proposito: enviar el formulario
                autoriza a responder esa consulta, no a mandar promociones. */}
            <label className="flex items-start gap-3 text-sm text-primary/70 cursor-pointer">
              <input
                type="checkbox"
                checked={promo}
                onChange={(e) => setPromo(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 accent-accent cursor-pointer"
              />
              <span>{t.contact.fields.promo}</span>
            </label>
            {submitError && <p className="text-sm text-destructive">{submitError}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!accepted || sending}
                className="btn-cta w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
              >
                {sending ? t.contact.sending : t.contact.fields.submit}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
