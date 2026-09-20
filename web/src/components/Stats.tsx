import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";

// Splits values like "12+", "500+", "100%" into prefix / number / suffix.
const parseStat = (raw: string) => {
  const m = raw.match(/^(\D*)([\d.,]+)(\D*)$/);
  if (!m) return { prefix: "", value: null as number | null, suffix: raw };
  return { prefix: m[1], value: parseFloat(m[2].replace(/,/g, "")), suffix: m[3] };
};

// Counts up from 0 to the target when scrolled into view.
const CountUp = ({ raw, duration = 1.8 }: { raw: string; duration?: number }) => {
  const { prefix, value, suffix } = parseStat(raw);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === null || !inView) return;
    // Reduced motion: show the final figure immediately, no count-up.
    if (prefersReduced) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, prefersReduced]);

  if (value === null) return <span ref={ref}>{raw}</span>;

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};

export const Stats = () => {
  const { t } = useLang();

  const stats = [
    { v: t.hero.stat1, l: t.hero.stat1Label },
    { v: t.hero.stat2, l: t.hero.stat2Label },
    { v: t.hero.stat3, l: t.hero.stat3Label },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="container-wide">
        <div className="grid grid-cols-3 gap-x-2 sm:gap-8 md:gap-12 items-start">
          {stats.map((s, i) => (
            <div key={i} className="px-0.5 sm:px-2 text-center">
              <div className="font-serif text-4xl sm:text-5xl md:text-6xl text-primary leading-none">
                <CountUp raw={s.v} />
              </div>
              <div className="mt-2 text-[11px] sm:text-sm text-primary/70 leading-snug text-balance">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
