/**
 * Motion primitives.
 *
 * One file so that timing and easing are decided once rather than guessed at
 * each call site. Motion that varies slightly between sections reads as
 * sloppiness even when nobody can say why, so the numbers live here.
 *
 * The house curve is expo-out: fast departure, long settle. It is what makes
 * an interface feel considered rather than springy, and it matches the
 * typography — unhurried, deliberate.
 *
 * Everything here collapses to a plain, instant render when the visitor has
 * asked for reduced motion. That is not a courtesy toggle: vestibular
 * disorders make drifting parallax genuinely unpleasant, and an app about
 * self-knowledge that ignores the request would be saying something unpleasant
 * about itself.
 */

import { motion, useReducedMotion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

/** Fast out, long settle. Used by every reveal in the app. */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  quick: 0.35,
  base: 0.7,
  slow: 1.1,
} as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before starting. Use sparingly; prefer Stagger. */
  delay?: number;
  /** How far it travels, in pixels. Kept small on purpose — see note below. */
  distance?: number;
  /** Direction of travel. */
  from?: 'below' | 'above' | 'left' | 'right' | 'none';
  /** Play every time it scrolls into view rather than only the first time. */
  repeat?: boolean;
  as?: 'div' | 'section' | 'span' | 'li';
};

/**
 * Reveals its children as they scroll into view.
 *
 * The travel distance is deliberately 20px rather than the 60-80px that is
 * common. Long travel draws attention to the animation; short travel draws
 * attention to the content arriving. The second is what we want.
 *
 * `amount: 0.25` fires when a quarter of the element is visible, so tall
 * sections do not sit blank until their bottom edge clears the fold.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 20,
  from = 'below',
  repeat = false,
  as = 'div',
}: RevealProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  const offset =
    from === 'below'
      ? { y: distance }
      : from === 'above'
        ? { y: -distance }
        : from === 'left'
          ? { x: -distance }
          : from === 'right'
            ? { x: distance }
            : {};

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: !repeat, amount: 0.25 }}
      transition={{ duration: DURATION.base, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/**
 * Parent for a run of children that should arrive one after another.
 *
 * 70ms is the interval that reads as "considered" rather than "slow" or
 * "simultaneous". Below ~40ms the eye sees one event; above ~120ms the last
 * item feels forgotten about.
 */
export function Stagger({
  children,
  className,
  interval = 0.07,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  interval?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: interval, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** A child of Stagger. Carries no timing of its own — the parent decides. */
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
};

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

/**
 * Headline reveal, one line at a time.
 *
 * Lines rather than words or letters. Letter-by-letter animation on a serif
 * display face looks like a ransom note and delays comprehension of the one
 * sentence that has to land immediately.
 */
export function LineReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <span className={className}>
        {lines.map((l, i) => (
          <span key={i} className={lineClassName}>
            {l}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={className}>
      {lines.map((line, i) => (
        // The clipping wrapper is what makes this read as type being set
        // rather than text fading in: the line rises from behind a hard edge.
        <span key={i} className="block overflow-hidden">
          <motion.span
            className={lineClassName}
            style={{ display: 'block' }}
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Fades and lifts once on mount, for things above the fold. */
export function Entrance({
  children,
  className,
  delay = 0,
  distance = 18,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
