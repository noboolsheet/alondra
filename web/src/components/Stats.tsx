import { useLang } from "@/i18n/LanguageContext";

/**
 * Las tres cifras del hero, en texto plano.
 *
 * Aquí había un contador que subía de 0 a la cifra al entrar en pantalla, y
 * tenía un fallo que no se veía en el navegador: `renderToString` no corre
 * efectos, así que el prerenderizado escribía el estado inicial del contador en
 * el HTML y `dist/index.html` decía **«0+ años de experiencia, 0+ estudiantes,
 * 0% profesores verificados»** en los tres idiomas. Lo leía quien no ejecuta
 * JavaScript (justo el público para el que existe el prerenderizado) y también
 * el visitante de verdad, desde el primer pintado hasta que hidrataba y la
 * sección entraba en pantalla.
 *
 * Las cifras van tal cual vienen del diccionario: son dato, no animación. Hay un
 * test que comprueba que el HTML prerenderizado las lleva dentro
 * (`src/test/prerender.test.tsx`).
 */
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
                {s.v}
              </div>
              <div className="text-sm text-primary/70 leading-snug sm:mt-2 sm:text-balance">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
