/**
 * The North Indian kundali — the chart itself, finally drawn.
 *
 * The Birth Chart view listed placements as text and never drew anything. For
 * a Vedic astrology product that is a strange omission: the diamond chart is
 * the one image anyone in India recognises instantly, and it is what makes the
 * difference between "an app that generated some text about me" and "my
 * chart". It is also, bluntly, the thing worth looking at on screen.
 *
 * North Indian rather than South Indian on purpose. In the North Indian form
 * the HOUSES are fixed and the signs rotate into them, so house 1 is always
 * the diamond at the top and the eye always knows where to look. In the South
 * Indian form the signs are fixed and the houses move, which is easier to draw
 * and harder to read for anyone who hasn't grown up with it.
 *
 * Houses are whole-sign (the standard in Vedic practice): a planet is in the
 * house its sign occupies, counted from the Lagna. No house-division system is
 * being silently chosen for the user.
 *
 * The lines draw themselves in before the planets land. That sequencing is the
 * point — it reads as a chart being cast rather than a picture appearing.
 */

import { motion, useReducedMotion } from 'motion/react';
import type { CelestialPosition } from '../utils/astronomy';

const INK = '#8B6E46';
const LINE = '#C9B499';
const TEXT = '#3A3229';

/**
 * Where each house sits, and where its contents are anchored.
 *
 * Coordinates are in a 0–100 square. House 1 is the top-centre diamond and the
 * rest run anti-clockwise, which is the convention.
 */
const HOUSES: { house: number; cx: number; cy: number }[] = [
  { house: 1, cx: 50, cy: 26 },
  { house: 2, cx: 26, cy: 11 },
  { house: 3, cx: 11, cy: 26 },
  { house: 4, cx: 26, cy: 50 },
  { house: 5, cx: 11, cy: 74 },
  { house: 6, cx: 26, cy: 89 },
  { house: 7, cx: 50, cy: 74 },
  { house: 8, cx: 74, cy: 89 },
  { house: 9, cx: 89, cy: 74 },
  { house: 10, cx: 74, cy: 50 },
  { house: 11, cx: 89, cy: 26 },
  { house: 12, cx: 74, cy: 11 },
];

/**
 * The nine grahas, and only those.
 *
 * The ephemeris also returns Uranus, Neptune and Pluto, and the first version
 * of this chart duly drew them — which is wrong. Vedic astrology is built on
 * nine bodies; the outer planets were discovered millennia after the system
 * was codified and have no rulerships, no dasha periods and no classical
 * meaning. Drawing them on a kundali is like adding a rest to a raga.
 *
 * The keys match the names the calculator produces, nodes included: it returns
 * "North Node (Rahu)" rather than "Rahu".
 */
const ABBR: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  'North Node (Rahu)': 'Ra',
  'South Node (Ketu)': 'Ke',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

export type KundaliChartProps = {
  ascendant: CelestialPosition;
  planets: Record<string, CelestialPosition>;
  sun?: CelestialPosition;
  moon?: CelestialPosition;
  className?: string;
  size?: number;
};

/** Whole-sign house number for a body, counted from the Lagna. */
function houseOf(signIndex: number, ascIndex: number): number {
  return ((signIndex - ascIndex + 12) % 12) + 1;
}

export default function KundaliChart({
  ascendant,
  planets,
  sun,
  moon,
  className = '',
  size = 340,
}: KundaliChartProps) {
  const reduced = useReducedMotion();
  const ascIndex = ascendant.signIndex;

  // Gather every body once, keyed by name, so Sun and Moon arriving separately
  // from the planets map cannot be placed twice.
  const bodies = new Map<string, CelestialPosition>();
  if (sun) bodies.set('Sun', sun);
  if (moon) bodies.set('Moon', moon);
  for (const [key, pos] of Object.entries(planets || {})) {
    if (!pos || typeof pos.signIndex !== 'number') continue;
    const name = pos.name || key;
    // Anything outside the nine grahas is dropped rather than abbreviated to
    // its first two letters, which is how Uranus arrived on a kundali as "Ur".
    if (!(name in ABBR)) continue;
    if (!bodies.has(name)) bodies.set(name, pos);
  }

  const occupants: Record<number, { label: string; retro: boolean; deg: number }[]> = {};
  for (const [name, pos] of bodies) {
    const h = houseOf(pos.signIndex, ascIndex);
    (occupants[h] ||= []).push({
      label: ABBR[name] || name.slice(0, 2),
      retro: Boolean(pos.isRetrograde),
      deg: Math.floor(pos.degreeInSign ?? 0),
    });
  }

  // The lines of the figure, in the order they are drawn.
  const strokes = [
    'M0 0 H100 V100 H0 Z',      // the outer square
    'M0 0 L100 100',             // one diagonal
    'M100 0 L0 100',             // the other
    'M50 0 L100 50 L50 100 L0 50 Z', // the inner diamond
  ];

  const DRAW = reduced
    ? { pathLength: 1, opacity: 1 }
    : { pathLength: [0, 1], opacity: [0, 1] };

  return (
    <div className={className}>
      <svg
        viewBox="-6 -6 112 112"
        width={size}
        height={size}
        className="max-w-full h-auto"
        role="img"
        aria-label={`North Indian birth chart. Ascendant in ${ascendant.sign}.`}
      >
        {strokes.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke={LINE}
            strokeWidth="0.7"
            strokeLinejoin="round"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={DRAW}
            transition={{
              duration: reduced ? 0 : 0.85,
              ease: [0.16, 1, 0.3, 1],
              delay: reduced ? 0 : i * 0.16,
            }}
          />
        ))}

        {HOUSES.map(({ house, cx, cy }, i) => {
          // Which sign sits in this house, given the Lagna.
          const signNumber = ((ascIndex + house - 1) % 12) + 1;
          const here = occupants[house] || [];
          // Stacks are centred on the house, not hung downward from it. A
          // house holding three planets was previously running its third one
          // out through the floor of the triangle.
          const ROW = 5.2;
          const stackTop = -((here.length - 1) / 2) * ROW;
          // Appear only once the figure is drawn.
          const base = reduced ? 0 : 0.95;

          return (
            <g key={house}>
              <motion.text
                x={cx}
                y={cy + (here.length ? stackTop - 4.6 : 0)}
                textAnchor="middle"
                fontSize="4.2"
                fill={LINE}
                fontFamily="ui-sans-serif, system-ui"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: base + i * 0.015 }}
              >
                {signNumber}
              </motion.text>

              {here.map((o, j) => (
                <motion.text
                  key={o.label}
                  x={cx}
                  y={cy + stackTop + j * ROW + 1.4}
                  textAnchor="middle"
                  fontSize="4.6"
                  fill={house === 1 ? INK : TEXT}
                  fontFamily="ui-sans-serif, system-ui"
                  fontWeight={house === 1 ? 600 : 500}
                  // Only opacity is animated. Motion treats `y` on an SVG
                  // node as a transform, not as the attribute, so animating it
                  // here added a second offset on top of the y above and threw
                  // every planet out of its house.
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                    delay: base + 0.1 + i * 0.03 + j * 0.05,
                  }}
                >
                  {o.label}
                  {o.retro ? '℞' : ''}
                </motion.text>
              ))}
            </g>
          );
        })}

        {/* The Lagna marker. Asc belongs in house 1 by definition, so it is
            drawn as a label on the house rather than as another body. */}
        <motion.text
          x="50"
          y="14"
          textAnchor="middle"
          fontSize="3.4"
          fill={INK}
          fontFamily="ui-sans-serif, system-ui"
          letterSpacing="0.4"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: reduced ? 0 : 1.25 }}
        >
          ASC
        </motion.text>
      </svg>

      <p className="text-[10px] text-[#8A7B68] text-center mt-2 leading-relaxed">
        North Indian chart · whole-sign houses · numbers are signs, 1 = Aries
        <br />
        Lagna {ascendant.sign} {ascendant.formattedDegree}
      </p>
    </div>
  );
}
