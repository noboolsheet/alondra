import { ArrowRight, BadgeDollarSign, FileCheck2, Languages, Home } from "lucide-react";
import { motion } from "framer-motion";
import { PageLink } from "@/components/PageLink";
import { useLang } from "@/i18n/LanguageContext";
import { reveal, fadeUp, staggerParent, staggerPop } from "@/lib/motion";
import { rich } from "@/lib/richtext";

const ICONS = [BadgeDollarSign, FileCheck2, Languages, Home];

/**
 * Step Up For Students.
 *
 * Es la respuesta más barata que existe a la objeción que de verdad frena a las
 * familias: el precio. Para una familia que ya tiene la beca, la conversación
 * deja de ser «cuánto cuesta».
 *
 * **La academia no interviene en el trámite.** Esta sección decía que
 * acompañábamos con el papeleo y lo ponía como el diferenciador principal;
 * Ilena confirmó el 29 de octubre que no conoce el proceso y que no ayuda a
 * abrir la beca. Era una afirmación que no se podía sostener, y de las caras:
 * una familia que llega esperando esa ayuda descubre que no existe justo en la
 * llamada en la que habría que estar generando confianza. Así que el punto
 * cambió de signo y ahora dice explícitamente quién lleva el trámite, que
 * además evita esa llamada.
 *
 * Lo que queda es verdad y sigue siendo útil: proveedor directo (los fondos van
 * a la academia, la familia no adelanta dinero), atención en tres idiomas y
 * clases a domicilio. El ángulo tampoco es «aceptamos Step Up» a secas, que la
 * Fase 5 avisa de que no es exclusivo: es la combinación.
 *
 * La nota del final no es letra pequeña defensiva: quién califica lo decide Step
 * Up, no la academia, y prometer lo contrario sería justo el tipo de afirmación
 * que la disciplina de claims no permite.
 */
/**
 * `compact` es la forma de la portada.
 *
 * Entero ocupaba 1,84 pantallas de móvil para contestar una objeción de precio
 * que llega antes de que el visitante sepa lo que cuesta una clase, y el bloque
 * completo ya vive en `/pricing`, que es donde esa conversación tiene sentido.
 * En la portada queda el titular, la frase y el enlace: quien tiene la beca
 * reconoce el nombre y sigue; quien no, no paga cuatro tarjetas por enterarse.
 * `/pricing` sigue montando la versión larga, y hay un test que comprueba que
 * esa página cierra con un solo dorado.
 */
export const StepUp = ({ compact = false }: { compact?: boolean }) => {
  const { t } = useLang();

  if (compact) {
    return (
      <section className="py-12 md:py-16 bg-secondary/40">
        <div className="container-wide">
          <motion.div {...reveal(fadeUp)} className="max-w-[62ch] mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl text-primary text-balance leading-[1.15]">
              {t.stepUp.title}
            </h2>
            <p className="mt-3 text-primary/70 leading-relaxed">{rich(t.stepUp.body)}</p>
            {/* La etiqueta no puede ser `noteLinkLabel`: eso dice
                «stepupforstudents.org» y este enlace va a /pricing. Una etiqueta
                con un dominio ajeno sobre un destino interno promete una cosa y
                entrega otra. */}
            <PageLink
              to="registration"
              className="mt-4 inline-flex items-center gap-1.5 py-2 font-semibold text-accent-ink transition-all hover:gap-2.5"
            >
              {t.stepUp.compactCta}
              <ArrowRight className="w-4 h-4" />
            </PageLink>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 bg-secondary/40">
      <div className="container-wide">
        <motion.div {...reveal(fadeUp)} className="max-w-2xl">
          <span className="eyebrow">{t.stepUp.eyebrow}</span>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl text-primary text-balance leading-[1.1]">
            {t.stepUp.title}
          </h2>
          <p className="mt-6 text-lg text-primary/70 leading-relaxed">{rich(t.stepUp.body)}</p>
        </motion.div>

        <motion.ul
          {...reveal(staggerParent())}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 list-none p-0"
        >
          {t.stepUp.points.map((point, i) => {
            const Icon = ICONS[i];
            return (
              <motion.li
                key={point.title}
                variants={staggerPop}
                className="rounded-2xl bg-card border border-border p-6"
              >
                <Icon className="w-6 h-6 text-accent-ink" strokeWidth={1.8} />
                <h3 className="mt-4 font-serif text-xl text-primary">{point.title}</h3>
                <p className="mt-2 text-sm text-primary/70 leading-relaxed">{point.body}</p>
              </motion.li>
            );
          })}
        </motion.ul>

        {/* La nota mandaba al visitante «a su web» sin decir a cuál. Ahora lo dice.
            El enlace a contacto se queda como enlace de texto a propósito: esta
            sección se monta también en /pricing, que cierra con un único dorado
            (ver la cabecera de CTABanner), y hay un test que lo guarda. */}
        <motion.div {...reveal(fadeUp)} className="mt-8 max-w-[62ch]">
          <p className="text-sm text-primary/70">
            {t.stepUp.note}{" "}
            <a
              href="https://www.stepupforstudents.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent-ink underline underline-offset-2"
            >
              {t.stepUp.noteLinkLabel}
            </a>
          </p>
          <PageLink
            to="contact"
            data-cta="call"
            className="mt-4 inline-flex items-center gap-1.5 py-2 font-semibold text-accent-ink transition-all hover:gap-2.5"
          >
            {t.ctaBanner.button}
            <ArrowRight className="w-4 h-4" />
          </PageLink>
        </motion.div>
      </div>
    </section>
  );
};
