/**
 * "Why PATTERNS is different" — the positioning section.
 *
 * Sits between the feeling prompt and the feature cards, where someone who has
 * scrolled past the hero is deciding whether this is another horoscope app.
 * Each point is a real product decision, not a slogan: no predictions, real
 * sidereal maths, feeling-first entry.
 */

const POINTS = [
  {
    mark: '⌀',
    title: 'No predictions. Ever.',
    body:
      'We will never tell you what is going to happen, and never score a relationship out of a hundred. The chart is a mirror to think with, not a forecast to obey.',
  },
  {
    mark: '☉',
    title: 'Your actual sky.',
    body:
      'Every reading is built from real sidereal positions — your Lagna, Moon nakshatra and running Dasha — calculated for your exact birth time and place. Never a sun-sign template.',
  },
  {
    mark: '☽',
    title: 'Feeling first.',
    body:
      'Most apps start with your sign and push content at you daily. PATTERNS starts with the moment you are actually in, and works back into the chart from there.',
  },
];

export default function WhyDifferent() {
  return (
    <section className="w-full border-t border-[#E7DCCB] bg-[#F2EDE4]/60">
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-20 md:py-24">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.28em] text-[#937C63] font-semibold mb-3">
            WHY PATTERNS IS DIFFERENT
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-[#1F1B16] font-normal max-w-2xl leading-tight">
            Astrology as a mirror<span className="font-serif italic text-[#8B6E46]">,</span> not a fortune.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {POINTS.map((p) => (
            <div
              key={p.title}
              className="p-6 md:p-7 rounded-2xl bg-[#FAF7F2]/90 border border-[#E3D7C7] shadow-xs flex flex-col"
            >
              <span className="font-serif text-2xl text-[#8B6E46] mb-3" aria-hidden="true">
                {p.mark}
              </span>
              <h3 className="text-base font-semibold text-[#241F1A] mb-2">{p.title}</h3>
              <p className="text-sm text-[#5C5042] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
