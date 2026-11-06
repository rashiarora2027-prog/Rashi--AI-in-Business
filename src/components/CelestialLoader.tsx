/**
 * The waiting state for every reading in the app.
 *
 * A reading takes a few seconds to generate, and those seconds are the most
 * reliably watched screen in the product — a visitor has just handed over
 * something personal and is waiting to see what comes back. A generic spinner
 * spends that attention on nothing.
 *
 * So: three bodies on real orbits at different periods, around a sun that
 * breathes. The periods are deliberately not multiples of each other, so the
 * bodies never line up twice the same way and the figure does not visibly
 * loop. That is the difference between something you watch and something you
 * notice repeating.
 *
 * The lines of text below change as it runs. They name what is actually
 * happening — the chart is genuinely being computed and read — rather than
 * inventing drama. Nothing here claims more than the app does.
 */

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const INK = '#8B6E46';
const FAINT = '#D8C6B1';

type Body = {
  /** Orbit radius. */
  r: number;
  /** Seconds for one full revolution. */
  period: number;
  /** Dot radius. */
  size: number;
  color: string;
  /** Where it starts, in degrees, so they do not all begin at noon. */
  offset: number;
};

const BODIES: Body[] = [
  { r: 20, period: 6.1, size: 2.2, color: '#B08E5E', offset: 0 },
  { r: 32, period: 9.7, size: 2.8, color: '#8B6E46', offset: 140 },
  { r: 44, period: 15.3, size: 2.0, color: '#C2A98A', offset: 265 },
];

/** What the server is actually doing, in order. */
const PHASES = [
  'Calculating your sidereal placements…',
  'Locating the Moon’s nakshatra and pada…',
  'Reading your running Vimshottari period…',
  'Looking for the pattern underneath…',
];

export default function CelestialLoader({
  phases = PHASES,
  className = '',
}: {
  phases?: string[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Slow enough to be read, not so slow the last line never appears.
    const id = setInterval(() => {
      setPhase((p) => (p + 1 < phases.length ? p + 1 : p));
    }, 2200);
    return () => clearInterval(id);
  }, [phases.length]);

  return (
    <div
      className={`py-12 flex flex-col items-center justify-center text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg width="156" height="156" viewBox="0 0 120 120" aria-hidden="true" className="max-w-full">
        {/* Orbit paths, drawn faintly so the bodies have something to travel on. */}
        {BODIES.map((b, i) => (
          <circle
            key={`orbit-${i}`}
            cx="60"
            cy="60"
            r={b.r}
            fill="none"
            stroke={FAINT}
            strokeWidth="0.6"
            strokeDasharray="2 4"
            opacity="0.85"
          />
        ))}

        {/* The sun. It breathes rather than pulses — a slow scale, no opacity
            flicker, which would read as a loading error. */}
        <motion.circle
          cx="60"
          cy="60"
          r="7"
          fill={INK}
          animate={reduced ? {} : { scale: [1, 1.12, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '60px 60px', transformBox: 'fill-box' }}
        />

        {BODIES.map((b, i) => (
          <motion.g
            key={`body-${i}`}
            animate={reduced ? {} : { rotate: 360 }}
            transition={{ duration: b.period, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '60px 60px', transformBox: 'view-box' }}
            transform={`rotate(${b.offset} 60 60)`}
          >
            <circle cx={60 + b.r} cy="60" r={b.size} fill={b.color} />
          </motion.g>
        ))}
      </svg>

      <motion.p
        key={phase}
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="font-serif italic text-sm text-[#4E4132] mt-4 px-6"
      >
        {phases[phase]}
      </motion.p>

      <p className="text-[11px] text-[#8B7863] mt-1.5">
        Referencing principles from Brihat Parashara Hora Shastra &amp; Saravali
      </p>
    </div>
  );
}
