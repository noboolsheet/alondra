import { BadgeCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageLink } from "@/components/PageLink";
import { CallCta } from "@/components/CallCta";
import { useLang } from "@/i18n/LanguageContext";
import { reveal, fadeUp, portraitIn } from "@/lib/motion";
import { rich } from "@/lib/richtext";

/**
 * Quién enseñará a tu hijo.
 *
 * La portada mostraba únicamente a la directora, y eso es el riesgo estratégico
 * que la Fase 4 señala como el principal: si la web sólo enseña a Ilena, cada
 * lead nuevo llega pidiéndola a ella — y su horario está completo, así que esa
 * demanda ya no se puede servir. Por eso ahora el bloque se lee en dos tiempos:
 * Ilena es quien **elige** al profesor, y debajo está el equipo que **enseña**.
 *
 * No dice en ningún sitio que Ilena no dé clases, porque sí las da. Lo que hace
 * es mover la confianza del nombre propio al criterio con el que selecciona.
 */
export const TeachersGrid = () => {
  const { t } = useLang();
  const director = t.teachers.director;
  const team = t.teachers.team;

  return (
    <section className="py-20 md:py-28">
      <div className="container-full">
        <motion.div {...reveal(fadeUp)} className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-primary text-balance">{t.teachers.title}</h2>
          <p className="mt-4 text-primary/70 max-w-[68ch] mx-auto">{rich(t.teachers.subtitle)}</p>
        </motion.div>

        <div className="grid gap-6 lg:gap-10 lg:grid-cols-2 items-center max-w-4xl mx-auto">
          {/* Director portrait */}
          <motion.div {...reveal(portraitIn)} className="relative max-w-sm w-full mx-auto lg:ml-auto lg:mr-0">
            <img
              src={director.photo}
              alt={director.name}
              loading="lazy"
              width={1086}
              height={1448}
              className="aspect-[3/4] w-full object-cover object-center rounded-3xl shadow-lift"
            />
            <div className="on-brand-dark absolute top-4 left-4 inline-flex items-center gap-1.5 bg-primary-foreground text-primary text-[11px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-soft">
              <BadgeCheck className="w-3.5 h-3.5 text-accent" />
              {t.teachers.verified}
            </div>
          </motion.div>

          {/* Description beside the photo */}
          <motion.div {...reveal(fadeUp)}>
            <h3 className="font-serif text-3xl md:text-4xl text-primary">{director.name}</h3>
            <p className="mt-2 text-accent-ink font-semibold">{director.role}</p>
            <p className="mt-5 text-primary/70 leading-relaxed">{rich(director.summary)}</p>
            <PageLink
              to="teachers"
              hash={director.slug}
              className="mt-6 inline-flex items-center gap-1.5 py-2 text-accent-ink font-semibold hover:gap-2.5 transition-all"
            >
              {t.teachers.moreLink.replace("{name}", director.name.split(" ")[0])}
              <ArrowRight className="w-4 h-4" />
            </PageLink>
          </motion.div>
        </div>

        {/* El equipo que da las clases. Tarjetas compactas: aquí basta con la cara,
            el nombre y el instrumento — la biografía completa vive a un clic. */}
        <motion.h3
          {...reveal(fadeUp)}
          className="mt-14 md:mt-20 mb-8 text-center font-serif text-2xl md:text-3xl text-primary"
        >
          {t.teachers.teamTitle}
        </motion.h3>

        <ul className="grid gap-4 grid-cols-3 lg:grid-cols-5 max-w-5xl mx-auto list-none p-0">
          {team.map((m, i) => (
            <motion.li
              key={m.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col text-center"
            >
              <PageLink to="teachers" hash={m.slug} className="group focus-visible:outline-none">
                {/* 1254x1254 es la proporción con la que se **pinta** (1:1, la
                    que impone `aspect-square`), no la del fichero: dos de los
                    retratos son 3:4 en origen. Es a propósito. Declarar aquí la
                    proporción real del fichero haría al navegador reservar una
                    caja 3:4 que luego el CSS recorta a cuadrada, y eso sí
                    movería el layout. No lo "arregles" para que cuadre con el
                    original. */}
                <img
                  src={m.photo}
                  alt={m.name}
                  loading="lazy"
                  width={1254}
                  height={1254}
                  className="aspect-square w-full object-cover object-center rounded-2xl shadow-soft transition-shadow group-hover:shadow-lift group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background"
                />
                <span className="mt-3 block font-serif text-base md:text-lg text-primary group-hover:text-accent-ink transition-colors">
                  {m.name}
                </span>
              </PageLink>
              <span className="mt-1 text-xs text-primary/60 leading-snug">{m.role}</span>
            </motion.li>
          ))}
        </ul>

        {/* Si no conecta con su profesor. Va aqui, debajo de las caras, porque es
            exactamente donde un padre se pregunta «¿y si no se llevan bien?».
            Sustituye al mecanismo que daba la competencia (la primera clase
            gratis) sin regalar una clase, que es lo que la academia no hace. */}
        {/* La promesa de reasignación vivía aquí y ahora es una pregunta del
            FAQ («¿y si mi hijo no conecta con su profesor?»), que es donde el
            dueño la quiere. Sigue además completa en /music-teachers. */}

        {/* El pico emocional de la portada esta aqui, debajo de las caras y de la
            promesa de reasignacion, y hasta ahora no habia nada que pulsar: el
            siguiente CTA estaba a unos siete mil pixeles. */}
        <motion.div {...reveal(fadeUp)} className="mt-10 md:mt-16 flex justify-center">
          <CallCta trackLoc="teachers" dataCta="call" />
        </motion.div>
      </div>
    </section>
  );
};
