import { useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { PageLink } from "@/components/PageLink";
import { Layout } from "@/components/Layout";
import { useLang } from "@/i18n/LanguageContext";
import { PageKey } from "@/i18n/routes";

/**
 * Error state, deliberately styled apart from the rest of the site.
 *
 * A 404 that reuses the normal page furniture reads as a real page that simply
 * has little content on it, and the visitor blames themselves or their browser.
 * Hence the warning colour, the plain statement that the link is broken, the
 * literal URL they asked for, and a way out to the pages they probably wanted.
 */
const NotFound = () => {
  const { t } = useLang();
  const { pathname } = useLocation();

  const elsewhere: { page: PageKey; label: string }[] = [
    { page: "programs", label: t.nav.programs },
    { page: "registration", label: t.nav.registration },
    { page: "contact", label: t.nav.contact },
  ];

  return (
    <Layout>
      <section className="min-h-[60vh] flex items-center justify-center py-16">
        <div className="w-full max-w-xl px-6">
          <div className="rounded-3xl border-2 border-dashed border-destructive/30 bg-destructive/5 p-8 md:p-12 text-center">
            <div className="flex justify-center">
              <span className="flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-sm font-semibold text-destructive">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                404
              </span>
            </div>

            <h1 className="mt-6 font-serif text-3xl md:text-4xl text-primary">{t.notFound.title}</h1>
            <p className="mt-4 text-primary/70 leading-relaxed">{t.notFound.body}</p>

            <p className="mt-6 text-sm text-primary/60">
              {t.notFound.requested}{" "}
              <code className="inline-block max-w-full break-all rounded-md bg-primary/10 px-2 py-1 font-mono text-[0.85em] text-primary/80">
                {pathname}
              </code>
            </p>

            <PageLink to="home" className="btn-cta mt-8">
              {t.notFound.back}
            </PageLink>

            <div className="mt-8 border-t border-primary/10 pt-6">
              <p className="text-sm text-primary/60">{t.notFound.elsewhere}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2">
                {elsewhere.map((l) => (
                  <PageLink
                    key={l.page}
                    to={l.page}
                    className="text-sm font-medium text-accent-ink underline underline-offset-4 hover:text-primary transition-colors"
                  >
                    {l.label}
                  </PageLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
