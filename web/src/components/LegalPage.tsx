import { Layout } from "@/components/Layout";
import { useLang } from "@/i18n/LanguageContext";
import { rich } from "@/lib/richtext";

interface LegalData {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
}

export const LegalPage = ({ data }: { data: LegalData }) => {
  const { t } = useLang();

  return (
    <Layout>
      <article className="pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="container-narrow">
          <span className="eyebrow">{t.legal.eyebrow}</span>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl text-primary text-balance leading-[1.05]">{data.title}</h1>
          <p className="mt-3 text-sm text-primary/70">{t.legal.updated}</p>

          <p className="mt-8 text-lg text-primary/70 leading-relaxed">{rich(data.intro)}</p>

          <div className="mt-10 space-y-8">
            {data.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-serif text-2xl text-primary">{section.heading}</h2>
                <p className="mt-2 text-primary/70 leading-relaxed">{rich(section.body)}</p>
              </section>
            ))}
          </div>
        </div>
      </article>
    </Layout>
  );
};
