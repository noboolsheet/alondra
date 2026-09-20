import { Link } from "react-router-dom";
import { PageLink } from "@/components/PageLink";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { reveal, scaleIn } from "@/lib/motion";
import { rich } from "@/lib/richtext";

export const CTABanner = () => {
  const { t } = useLang();
  return (
    <section className="py-16">
      <div className="container-full">
        <motion.div
          {...reveal(scaleIn)}
          className="on-brand-dark relative overflow-hidden rounded-[2rem] bg-gradient-hero p-10 md:p-16 text-center"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative">
            <Sparkles className="w-8 h-8 text-accent mx-auto mb-4" />
            <h2 className="font-serif text-3xl md:text-5xl text-primary-foreground text-balance max-w-2xl mx-auto leading-[1.1]">
              {t.ctaBanner.title}
            </h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">{rich(t.ctaBanner.body, "font-semibold text-primary-foreground")}</p>
            <div className="mt-8 flex justify-center">
              <PageLink to="contact" className="btn-cta text-base">
                {t.ctaBanner.button}
                <ArrowRight className="w-4 h-4" />
              </PageLink>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
