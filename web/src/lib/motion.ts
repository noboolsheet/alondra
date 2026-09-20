import type { Variants } from "framer-motion";

/**
 * Shared motion vocabulary. One easing system, a few purposeful variants —
 * so each section gets motion that FITS it (list stagger, portrait settle,
 * confident CTA) instead of one uniform fade. Reduced motion is handled
 * globally via <MotionConfig reducedMotion="user"> + the CSS media query.
 */

// Confident, decisive deceleration (ease-out-expo). No bounce, no elastic.
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const enter = { duration: 0.6, ease: EASE_OUT_EXPO };
const viewportOnce = { once: true, margin: "-60px" };

// Reusable prop bundle for a scroll-triggered reveal.
export const reveal = (variants: Variants) => ({
  variants,
  initial: "hidden" as const,
  whileInView: "show" as const,
  viewport: viewportOnce,
});

// Single text / element rising into place.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: enter },
};

// Confident scale-in for closing CTAs and hero-ish moments.
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

// Portrait "settling": eases up while a slight zoom relaxes — feels like a photo developing.
export const portraitIn: Variants = {
  hidden: { opacity: 0, scale: 1.05, y: 18 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.85, ease: EASE_OUT_EXPO } },
};

// Parent that orchestrates a sibling stagger (legitimate list rhythm).
export const staggerParent = (stagger = 0.09, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

export const staggerUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: enter },
};

export const staggerPop: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

// Slide in from a side (dir: 1 = from the right, -1 = from the left).
export const staggerSide = (dir: -1 | 1): Variants => ({
  hidden: { opacity: 0, x: 26 * dir },
  show: { opacity: 1, x: 0, transition: enter },
});
