/**
 * Shared framer-motion variants and easing curves.
 *
 * Import these instead of writing inline `transition={{ … }}` configs so every
 * surface uses the same calm motion vocabulary.
 *
 * @example
 * ```tsx
 * import { fadeUp, easings } from "@/lib/motion"
 *
 * <motion.div
 *   initial={fadeUp.initial}
 *   animate={fadeUp.animate}
 *   transition={{ duration: 0.45, ease: easings.calm }}
 * >
 *   ...
 * </motion.div>
 * ```
 */

import type { Transition } from "framer-motion"

/**
 * Easing curves. `calm` is our default — a soft ease-out-cubic that suits the
 * editorial pace of the app. Avoid `linear` and the default `easeInOut` in
 * product surfaces; they feel cheap on Fraunces.
 */
export const easings = {
  calm: [0.22, 1, 0.36, 1] as const,
  enter: [0.16, 1, 0.3, 1] as const,
  exit: [0.7, 0, 0.84, 0] as const,
}

/** Default transition for any single-element entrance. */
export const calmTransition: Transition = {
  duration: 0.45,
  ease: easings.calm,
}

/** Subtle fade + lift — the workhorse for cards, headings, list items. */
export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

/** Vertical slide for full sections / dialogs. */
export const slideIn = {
  initial: { opacity: 0, y: 24, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -16, scale: 0.985 },
}

/** Horizontal slide for tab/page transitions. */
export const slideHorizontal = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
}

/**
 * Stagger child entrances by `delayPer` seconds per index.
 * Pair with a parent `motion.div` using `variants` + `initial="hidden"` etc.,
 * or compute `transition.delay` per item manually.
 */
export function staggerDelay(index: number, delayPer = 0.08, base = 0.05): number {
  return base + index * delayPer
}

/** Parent variants for a `motion.ul` / `motion.div` with staggered children. */
export const staggerParent = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

/** Child variants meant to be used with `staggerParent`. */
export const staggerChild = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: calmTransition },
}
