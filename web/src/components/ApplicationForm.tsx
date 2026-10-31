import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageLink } from "@/components/PageLink";
import { useLang } from "@/i18n/LanguageContext";
import { useTrack } from "@/lib/analytics";
import { rich } from "@/lib/richtext";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB — keep in sync with the server
const ALLOWED_EXT = /\.(pdf|doc|docx)$/i;

export const ApplicationForm = () => {
  const { t } = useLang();
  const [data, setData] = useState({ name: "", email: "", phone: "", role: "", message: "" });
  const [company, setCompany] = useState(""); // honeypot — real users never fill this
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const track = useTrack();
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.name.trim()) e.name = t.errors.required;
    if (!data.email.trim()) e.email = t.errors.required;
    // Recortado, por lo mismo que en ContactForm: un espacio pegado delante del
    // correo no es un correo inválido, y el servidor valida sobre el recortado.
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) e.email = t.errors.email;
    if (!data.phone.trim()) e.phone = t.errors.required;
    else if (!/^[\d\s+\-()]{7,}$/.test(data.phone)) e.phone = t.errors.phone;
    if (!data.role.trim()) e.role = t.errors.required;
    if (!data.message.trim()) e.message = t.errors.required;
    // CV file is optional
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFile = (f?: File | null) => {
    if (!f) return;
    if (!ALLOWED_EXT.test(f.name) || f.size > MAX_FILE_BYTES) {
      setSubmitError(t.careers.fileError);
      return;
    }
    setSubmitError("");
    setFile(f);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const reset = () => {
    setSent(false);
    setData({ name: "", email: "", phone: "", role: "", message: "" });
    setCompany("");
    setFile(null);
    setAccepted(false);
    setErrors({});
    setSubmitError("");
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setSending(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, k === "email" ? v.trim() : v));
      fd.append("company", company);
      if (file) fd.append("cv", file);
      const res = await fetch("/api/send-application", { method: "POST", body: fd });
      // El 429 es el tope de envíos, no un fallo: lleva su propio mensaje.
      if (!res.ok) throw new Error(res.status === 429 ? "too_many" : "failed");
      setSent(true);
      track("application_submit", { form: "careers" });
    } catch (err) {
      const tope = err instanceof Error && err.message === "too_many";
      setSubmitError(tope ? t.careers.errorTooMany : t.careers.errorSend);
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

  return (
    <div className="rounded-3xl bg-card border border-border shadow-soft p-6 sm:p-10">
      {/* `initial={false}`: el formulario se pinta ya visible (su `initial` acababa
          en el HTML prerenderizado como `opacity:0`, ver `src/lib/motion.ts`). El
          paso a la pantalla de éxito sigue animándose, que es el único cambio de
          estado que el visitante ve aquí. */}
      <AnimatePresence mode="wait" initial={false}>
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
            <h3 className="font-serif text-3xl text-primary">{t.careers.successTitle}</h3>
            <p className="mt-3 text-primary/70 max-w-sm mx-auto">{rich(t.careers.successBody)}</p>
            <button
              onClick={reset}
              className="mt-6 text-sm font-semibold text-primary underline underline-offset-4 hover:text-accent-ink transition-colors"
            >
              {t.careers.successAgain}
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
              <h3 className="font-serif text-3xl text-primary">{t.careers.formTitle}</h3>
              <p className="mt-2 text-sm text-primary/70">{rich(t.careers.formSubtitle)}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {field("name", t.careers.fields.name)}
              {field("email", t.careers.fields.email, "email")}
              {field("phone", t.careers.fields.phone, "tel")}
              {field("role", t.careers.fields.role)}
            </div>

            {/* CV upload — click to browse or drag & drop */}
            <div>
              <label className="block text-xs font-semibold tracking-wide uppercase text-primary/70 mb-2">{t.careers.fields.link}</label>
              {file ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-background px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-primary truncate">{file.name}</span>
                    <span className="text-xs text-primary/70 flex-shrink-0">{Math.max(1, Math.round(file.size / 1024))} KB</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    aria-label={t.careers.fields.cvRemove}
                    className="p-1 rounded-full text-primary/60 hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFile(e.dataTransfer.files?.[0]);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors",
                    dragOver ? "border-accent bg-accent/5" : "border-primary/25 bg-background hover:border-primary/40",
                  )}
                >
                  <Upload className="w-6 h-6 text-accent" />
                  <span className="text-sm text-primary/70">{t.careers.fields.cvHint}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </label>
              )}
            </div>

            {field("message", t.careers.fields.message, "text", true)}

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
              <span>{t.careers.fields.terms}</span>
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

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!accepted || sending}
                className="btn-cta w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
              >
                {sending ? t.careers.sending : t.careers.fields.submit}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
