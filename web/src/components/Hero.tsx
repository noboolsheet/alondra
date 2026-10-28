import { Link } from "react-router-dom";
import { PageLink } from "@/components/PageLink";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useTrack } from "@/lib/analytics";
import { rich } from "@/lib/richtext";

export const Hero = () => {
  const { t } = useLang();
  const track = useTrack();

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Full-screen horizontal hero image (optimized from imagen-sources/hero-img.png) */}
      <img
        src="/images/hero-img.webp"
        alt=""
        aria-hidden="true"
        width={1920}
        height={1075}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Legibility scrims — theme-adaptive (light in light mode, dark in dark mode) */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-24 -left-20 w-96 h-96 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

      <div className="relative w-full py-20 md:py-28 pl-10 sm:pl-20 lg:pl-40 pr-6">
        <div className="max-w-2xl text-left">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] text-primary leading-[0.98] text-balance"
          >
            {t.hero.title1}{" "}
            <span className="font-serif font-normal italic text-accent-ink text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] block sm:inline mt-2 sm:mt-0">
              {t.hero.title2}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-primary/70 max-w-xl leading-relaxed"
          >
            {rich(t.hero.subtitle)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <PageLink to="programs" className="btn-outline">
              {t.hero.ctaSecondary}
              <ArrowUpRight className="w-4 h-4" />
            </PageLink>
            {/* Mobile: the discovery-call CTA opens WhatsApp directly (uses the
                contact phone number). Desktop keeps the routed contact page. */}
            <a data-track-loc="hero"
              href={`https://wa.me/${t.contact.infoPhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta sm:hidden"
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="w-4 h-4" />
            </a>
            <PageLink
              to="contact"
              className="btn-cta hidden sm:inline-flex"
              onClick={() => track("cta_click", { location: "hero", label: "discovery_call" })}
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="w-4 h-4" />
            </PageLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
