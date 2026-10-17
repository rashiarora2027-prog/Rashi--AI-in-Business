/**
 * The classical texts, stacked.
 *
 * These used to be four names crammed into one pipe-separated line in the
 * footer, which read as a credential rather than something you could follow.
 * Each is now a row you can open.
 */

import { CLASSICAL_TEXTS } from '../data/classicalTexts.ts';
import { NakshatraRing } from './AbstractMotifs';

export default function ClassicalTextsSection() {
  return (
    <section className="relative w-full border-t border-[#E7DCCB] overflow-hidden">
      {/* The 27 nakshatras, ticked off around the ecliptic. The list is capped
          at 1100px, so these gutters are wide and were sitting empty. */}
      <NakshatraRing className="hidden lg:block absolute -left-24 xl:left-[1%] top-[18%] w-[260px] xl:w-[300px] opacity-[0.13]" />
      <NakshatraRing className="hidden xl:block absolute -right-28 bottom-[8%] w-[340px] opacity-[0.10]" />

      <div className="relative w-full max-w-[1100px] mx-auto px-6 md:px-12 py-20 md:py-24">
        <div className="flex flex-col items-center text-center mb-10">
          <span className="text-[11px] uppercase tracking-[0.28em] text-[#937C63] font-semibold mb-3">
            WHERE THE READING COMES FROM
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-[#1F1B16] font-normal mb-3.5">
            Four books<span className="font-serif italic text-[#8B6E46]">,</span> openly cited.
          </h2>
          <p className="text-sm sm:text-base text-[#5C5042] max-w-xl leading-relaxed">
            Every interpretation here borrows its vocabulary from the classical Vedic
            canon. You should be able to see which books, and read what each one
            actually is.
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {CLASSICAL_TEXTS.map((text, i) => (
            <li key={text.slug}>
              <a
                href={`#/texts/${text.slug}`}
                className="group flex items-start gap-5 p-5 md:p-6 rounded-2xl bg-[#FAF7F2]/90 border border-[#E3D7C7] shadow-xs transition-all hover:border-[#C4AE92] hover:bg-[#FBF8F3] hover:shadow-sm"
              >
                <span className="shrink-0 w-9 h-9 rounded-full border border-[#DECDBB] flex items-center justify-center font-serif text-sm text-[#8B6E46] mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span className="flex-1 min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                    <span className="text-base md:text-lg font-serif text-[#1F1B16]">
                      {text.title}
                    </span>
                    <span className="text-xs text-[#937C63] font-sans">{text.sanskrit}</span>
                  </span>
                  <span className="block text-sm text-[#5C5042] leading-relaxed">
                    {text.summary}
                  </span>
                  <span className="block text-[11px] text-[#8A7B68] mt-2 font-sans">
                    {text.attributed}
                  </span>
                </span>

                <span className="shrink-0 self-center text-[#B3A08A] font-serif text-lg transition-transform group-hover:translate-x-0.5 group-hover:text-[#8B6E46]">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
