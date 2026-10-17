/**
 * Ambient celestial artwork behind the hero.
 *
 * Purely decorative and pointer-transparent — it fills the empty space a
 * single-column hero leaves without adding anything else to click. All
 * positions are fixed values rather than random, so the composition is the
 * same on every render instead of shimmering between reloads.
 */

/** Scattered stars: [leftPercent, topPercent, sizePx, opacity] */
const STARS: [number, number, number, number][] = [
  [6, 18, 9, 0.30], [12, 62, 7, 0.22], [19, 34, 6, 0.18], [27, 76, 8, 0.24],
  [33, 12, 7, 0.20], [41, 52, 6, 0.16], [52, 24, 9, 0.26], [58, 68, 7, 0.20],
  [66, 15, 6, 0.18], [73, 46, 8, 0.22], [81, 72, 7, 0.19], [88, 28, 9, 0.28],
  [94, 58, 6, 0.17], [45, 86, 7, 0.21], [15, 88, 6, 0.16],
];

/** A constellation drawn once, top-left, as a quiet anchor. */
const CONSTELLATION: [number, number][] = [
  [10, 22], [18, 30], [26, 24], [34, 36], [30, 50], [20, 46],
];

export default function CelestialBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
    >
      {/* Warm light pooling behind the wheel */}
      <div
        className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full opacity-[0.22]"
        style={{
          background:
            'radial-gradient(circle, rgba(201,180,153,0.55) 0%, rgba(201,180,153,0.18) 42%, rgba(246,242,235,0) 70%)',
        }}
      />

      {/* A second, cooler pool low-left for balance */}
      <div
        className="absolute left-[-14%] bottom-[-18%] w-[46vw] h-[46vw] max-w-[620px] max-h-[620px] rounded-full opacity-[0.16]"
        style={{
          background:
            'radial-gradient(circle, rgba(154,129,100,0.45) 0%, rgba(246,242,235,0) 68%)',
        }}
      />

      {/* Constellation */}
      <svg
        className="absolute left-[3%] top-[12%] w-[220px] h-[200px] opacity-[0.30] hidden md:block"
        viewBox="0 0 40 60"
        fill="none"
      >
        <polyline
          points={CONSTELLATION.map(([x, y]) => `${x},${y}`).join(' ')}
          stroke="#9A8164"
          strokeWidth="0.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {CONSTELLATION.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 0 || i === 3 ? 1.1 : 0.65} fill="#8A7155" />
        ))}
      </svg>

      {/* Concentric orbit rings, lower right */}
      <svg
        className="absolute right-[6%] bottom-[4%] w-[260px] h-[260px] opacity-[0.14] hidden lg:block"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="46" stroke="#8A7155" strokeWidth="0.4" strokeDasharray="2 3" />
        <circle cx="50" cy="50" r="32" stroke="#8A7155" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="18" stroke="#8A7155" strokeWidth="0.4" strokeDasharray="1 2" />
        <circle cx="50" cy="4" r="1.6" fill="#8A7155" />
        <circle cx="82" cy="50" r="1.2" fill="#8A7155" />
      </svg>

      {/* Star field */}
      {STARS.map(([left, top, size, opacity], i) => (
        <span
          key={i}
          className="absolute text-[#9A8164] font-serif leading-none"
          style={{ left: `${left}%`, top: `${top}%`, fontSize: `${size}px`, opacity }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}
