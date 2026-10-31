import type { Variants } from "framer-motion";

/**
 * Shared motion vocabulary. One easing system, a few purposeful variants —
 * so each section gets motion that FITS it (list stagger, portrait settle,
 * confident CTA) instead of one uniform fade. Reduced motion is handled
 * globally via <MotionConfig reducedMotion="user"> + the CSS media query.
 *
 * ── Por qué ningún estado `hidden` lleva `opacity: 0` ────────────────────────
 *
 * El estado inicial de una animación de entrada se renderiza **también en el
 * build**: `renderToString` pinta el `initial`, así que cada `hidden` acababa
 * escrito como `style="opacity:0"` dentro del HTML prerenderizado. En la portada
 * eran 48 elementos, y uno de ellos era el `<main>` entero: el fichero llevaba
 * el contenido completo y declarado invisible. Para quien no ejecuta JavaScript
 * (el público para el que existe el prerenderizado) o para quien lo tiene
 * activado pero el bundle no llega, eso es una página en blanco con el texto
 * dentro, que es peor que no prerenderizar: parece contenido oculto.
 *
 * El movimiento no tiene ese problema: `translateY(24px)` o `scale(0.9)` dejan el
 * contenido perfectamente legible sin JavaScript, y con JavaScript la entrada se
 * sigue viendo. Así que las entradas son **movimiento, sin fundido**. Lo que se
 * pierde es el fundido de opacidad; lo que se gana es que el contenido no pueda
 * quedar invisible.
 *
 * La alternativa (mantener el fundido y poner el `hidden` sólo en el cliente)
 * se descartó: el HTML pinta el contenido visible, y al hidratar lo haría
 * desaparecer para volver a desvanecerlo dentro. Un parpadeo de toda la página
 * para recuperar un efecto.
 *
 * Los fundidos que NO son de entrada (el cambio de reseña del carrusel, el
 * formulario que pasa a su pantalla de éxito, el icono del menú) se quedan: en
 * esos sitios el fundido va entre dos estados que el visitante ya ha visto, y lo
 * único que se les ha quitado es la animación del primer montaje, con
 * `initial={false}` en su `AnimatePresence`.
 *
 * Hay un test que vigila esto: `src/test/prerender.test.tsx` comprueba que el
 * HTML de las rutas prerenderizadas no lleva ni un `opacity:0`.
 */

// Confident, decisive deceleration (ease-out-expo). No bounce, no elastic.
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const enter = { duration: 0.6, ease: EASE_OUT_EXPO };

/**
 * Cuándo cuenta un elemento como «a la vista», y por qué el margen es asimétrico.
 *
 * Por abajo, `-60px`: un bloque que entra por el borde inferior no empieza a
 * animar hasta estar 60 px dentro, que es el comportamiento de siempre.
 *
 * Por arriba, mucho margen, y esto arregla un fallo: un `IntersectionObserver`
 * sólo avisa cuando el estado de intersección CAMBIA, y un salto instantáneo
 * (un enlace con `#`, `scrollIntoView`, la restauración de scroll del navegador)
 * lleva un elemento de «debajo de la ventana» a «encima de la ventana» sin pasar
 * por «a la vista»: nunca llega el aviso y su entrada no se dispara jamás. Con
 * las animaciones de opacidad eso dejaba contenido invisible para siempre; ahora
 * sólo lo deja 24 px descolocado, pero descolocado se queda. Medido: ir a
 * `/music-lessons#instrument-piano` dejaba un párrafo así.
 *
 * Ampliar la raíz hacia arriba hace que lo que ya quedó por encima cuente como
 * visto: se asienta solo, fuera de pantalla, sin que nadie vea el salto. El
 * valor cubre 100 ventanas hacia arriba, muy por encima de la página más larga.
 */
export const viewportOnce = { once: true, margin: "10000% 0px -60px 0px" };

// Reusable prop bundle for a scroll-triggered reveal.
export const reveal = (variants: Variants) => ({
  variants,
  initial: "hidden" as const,
  whileInView: "show" as const,
  viewport: viewportOnce,
});

// Single text / element rising into place.
export const fadeUp: Variants = {
  hidden: { y: 24 },
  show: { opacity: 1, y: 0, transition: enter },
};

// Confident scale-in for closing CTAs and hero-ish moments.
export const scaleIn: Variants = {
  hidden: { scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

// Portrait "settling": eases up while a slight zoom relaxes — feels like a photo developing.
export const portraitIn: Variants = {
  hidden: { scale: 1.05, y: 18 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.85, ease: EASE_OUT_EXPO } },
};

// Parent that orchestrates a sibling stagger (legitimate list rhythm).
export const staggerParent = (stagger = 0.09, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

export const staggerUp: Variants = {
  hidden: { y: 22 },
  show: { opacity: 1, y: 0, transition: enter },
};

export const staggerPop: Variants = {
  hidden: { scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

// Slide in from a side (dir: 1 = from the right, -1 = from the left).
export const staggerSide = (dir: -1 | 1): Variants => ({
  hidden: { x: 26 * dir },
  show: { opacity: 1, x: 0, transition: enter },
});
