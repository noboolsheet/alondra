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
        {/* Tres columnas a 390 px daban 116 px por cifra y la etiqueta se partía
            en dos líneas a 12 px. En móvil va como lista: la cifra a la
            izquierda en una columna de ancho fijo para que las tres se alineen,
            la etiqueta al lado y ya legible a 14 px. A partir de `sm` vuelve a
            ser la fila de tres centrada. */}
        <div className="flex flex-col divide-y divide-border sm:grid sm:grid-cols-3 sm:gap-8 md:gap-12 sm:items-start sm:divide-y-0">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex items-baseline gap-4 py-4 first:pt-0 last:pb-0 sm:block sm:px-2 sm:py-0 sm:text-center"
            >
              <div className="min-w-[4.5rem] font-serif text-4xl sm:min-w-0 sm:text-5xl md:text-6xl text-primary leading-none">
                <CountUp raw={s.v} />
              </div>
              <div className="text-sm text-primary/70 leading-snug sm:mt-2 sm:text-balance">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
