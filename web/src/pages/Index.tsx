import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { GoogleReviews } from "@/components/GoogleReviews";
import { Pedagogy } from "@/components/Pedagogy";
import { InstrumentsGrid } from "@/components/InstrumentsGrid";
import { StepUp } from "@/components/StepUp";
import { TeachersGrid } from "@/components/TeachersGrid";
import { CoverageMap } from "@/components/CoverageMap";
import { FAQ } from "@/components/FAQ";
import { CTABanner } from "@/components/CTABanner";
import { StickyCallBar } from "@/components/StickyCallBar";

/**
 * El orden de la portada responde a las dos preguntas del visitante.
 *
 * Un padre llega con dos: **quién entra en mi casa** y **cuánto cuesta**. El
 * profesorado estaba octavo de once, a unos 8.500 px del hero, detrás del
 * método, las disciplinas, los formatos y la beca; su miedo real quedaba para
 * el final y el único dorado del tramo alto era el del hero.
 *
 * Ahora las reseñas (palabras de una madre de verdad) entregan al equipo, y el
 * equipo trae su propio CTA: hay un punto de conversión al 35% de la página en
 * vez de al 62%. El método va **detrás** de quien lo imparte, que es el orden
 * en que se lee («quién» antes que «cómo»), y las disciplinas y los formatos se
 * quedan juntos: qué se aprende y cómo se entrega.
 *
 * `StepUp` baja al 8.º puesto **y en forma compacta**. Es la respuesta a la
 * objeción del precio y estaba interrumpiendo antes de que el visitante hubiera
 * conocido a nadie, con el efecto secundario de que una academia que acepta beca
 * aparecía antes que la promesa premium del hero. Una objeción se contesta
 * cuando ya existe el deseo, no antes. El bloque entero vive en `/pricing`.
 *
 * Disciplinas y formatos se fusionaron en `InstrumentsGrid`: eran dos rejillas
 * idénticas seguidas y, con StepUp, tres. La portada pasó de once secciones y
 * 16,5 pantallas de móvil a diez.
 *
 * `CoverageMap` cierra el bloque de servicio: para cuando pregunta «¿venís a mi
 * casa?» ya sabe quién vendría.
 */
const Index = () => {
  return (
    <Layout>
      <Hero />

      <Stats />

      <GoogleReviews />
      <TeachersGrid />
      <Pedagogy />
      <InstrumentsGrid />
      <CoverageMap />
      <StepUp compact />
      <FAQ />
      <CTABanner />

      <StickyCallBar />
    </Layout>
  );
};

export default Index;
