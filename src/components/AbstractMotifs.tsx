/**
 * Abstract ornament for the empty margins.
 *
 * Every motif here is drawn from geometry the app actually computes, rather
 * than invented shapes: the real Vimshottari period lengths, the 27 nakshatras
 * and their padas, the North Indian chart lattice, the lunar cycle. Decoration
 * that encodes something true about the subject ages better than decoration
 * that only fills space, and someone who knows the tradition will recognise it.
 *
 * All of it is quiet by construction — low opacity, hairline strokes, no fills
 * competing with the text, no motion. It hides below `lg`, where there are no
 * side gutters to fill and it would crowd the content instead.
 */

const INK = '#8A7155';

/** Polar helper. 0° points up, angles run clockwise, like a chart wheel. */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

/** Arc path between two angles at a given radius. */
function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/**
 * The Vimshottari cycle, to scale.
 *
 * These are the real period lengths the Dasha engine runs on — 120 years
 * divided between nine planets — so the uneven segments are the actual shape
 * of the system, not a decorative rhythm. Saturn's long sweep and the Sun's
 * short one are why a chart's chapters are the lengths they are.
 */
const VIMSHOTTARI: [string, number][] = [
  ['Ketu', 7],
  ['Venus', 20],
  ['Sun', 6],
  ['Moon', 10],
  ['Mars', 7],
  ['Rahu', 18],
  ['Jupiter', 16],
  ['Saturn', 19],
  ['Mercury', 17],
];

export function DashaArcs({ className = '' }: { className?: string }) {
  let cursor = 0;

  // All nine on one ring. Spread across several radii they read as arbitrary
  // arcs; on a single ring the uneven division is legible as what it is — one
  // cycle, cut into nine chapters of very different lengths.
  const segments = VIMSHOTTARI.map(([name, years]) => {
    const from = (cursor / 120) * 360;
    cursor += years;
    const to = (cursor / 120) * 360;
    // A hairline gap so adjacent periods read as separate chapters.
    return { name, from: from + 1.8, to: to - 1.8 };
  });

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
    >
      {segments.map((s) => (
        <path
          key={s.name}
          d={arc(50, 50, 44, s.from, s.to)}
          stroke={INK}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
      <circle cx="50" cy="50" r="30" stroke={INK} strokeWidth="0.35" strokeDasharray="1.5 3.5" />
      <circle cx="50" cy="50" r="15" stroke={INK} strokeWidth="0.35" />
      <circle cx="50" cy="50" r="2" fill={INK} />
    </svg>
  );
}

/**
 * The 27 nakshatras as ticks around the ecliptic, every third one longer to
 * mark the three cycles the padas run through.
 */
export function NakshatraRing({ className = '' }: { className?: string }) {
  const ticks = Array.from({ length: 27 }, (_, i) => {
    const deg = (i / 27) * 360;
    const long = i % 3 === 0;
    const [x1, y1] = polar(50, 50, long ? 32 : 37, deg);
    const [x2, y2] = polar(50, 50, 45, deg);
    return { i, x1, y1, x2, y2, long };
  });

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
    >
      <circle cx="50" cy="50" r="45" stroke={INK} strokeWidth="0.4" />
      <circle cx="50" cy="50" r="32" stroke={INK} strokeWidth="0.4" strokeDasharray="2 4" />
      {ticks.map((t) => (
        <line
          key={t.i}
          x1={t.x1.toFixed(2)}
          y1={t.y1.toFixed(2)}
          x2={t.x2.toFixed(2)}
          y2={t.y2.toFixed(2)}
          stroke={INK}
          strokeWidth={t.long ? 0.9 : 0.5}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/**
 * The North Indian kundali: a square, the diamond through its side midpoints,
 * and both diagonals — the twelve houses every reading is laid out in.
 */
export function KundaliLattice({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
      stroke={INK}
      strokeWidth="0.5"
    >
      <rect x="2" y="2" width="96" height="96" />
      <path d="M2 2 L98 98 M98 2 L2 98" />
      <path d="M50 2 L98 50 L50 98 L2 50 Z" />
    </svg>
  );
}

/**
 * A lunar cycle read top to bottom, for tall margins.
 *
 * The terminator is an ellipse whose width is the cosine of the phase, which
 * is what actually governs the shape of a real moon: the lit edge is a circle
 * seen at an angle, not an arc of fixed curvature. The sweep flips at half
 * phase, so the shape goes crescent, half, gibbous the way the month does.
 */
export function LunarColumn({ className = '' }: { className?: string }) {
  const count = 7;
  const r = 7;

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${r * 2 + 4} ${count * (r * 2 + 10)}`}
      fill="none"
      className={`pointer-events-none select-none ${className}`}
    >
      {Array.from({ length: count }, (_, i) => {
        const cy = i * (r * 2 + 10) + r + 2;
        const cx = r + 2;
        // 0 -> new, 1 -> full.
        const phase = (i + 0.5) / count;
        const width = Math.abs(Math.cos(phase * Math.PI)) * r;
        // Crescent subtracts a lune from the lit half, gibbous adds one.
        const sweep = phase < 0.5 ? 0 : 1;
        const top = `${cx} ${cy - r}`;
        const bottom = `${cx} ${cy + r}`;

        return (
          <g key={i}>
            <path
              d={`M ${top} A ${r} ${r} 0 0 1 ${bottom} A ${width.toFixed(2)} ${r} 0 0 ${sweep} ${top} Z`}
              fill={INK}
              fillOpacity="0.5"
            />
            <circle cx={cx} cy={cy} r={r} stroke={INK} strokeWidth="0.6" />
          </g>
        );
      })}
    </svg>
  );
}
