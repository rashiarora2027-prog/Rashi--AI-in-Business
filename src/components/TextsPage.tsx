/**
 * A real page for the classical texts, reached at #/texts and #/texts/<slug>.
 *
 * Hash routing rather than a router dependency: the links are shareable, they
 * survive a reload on a static host, and nothing new ships to the browser.
 */

import { CLASSICAL_TEXTS, getTextBySlug } from '../data/classicalTexts.ts';
import { DashaArcs, KundaliLattice } from './AbstractMotifs';

type Props = {
  /** Slug of a single text, or null for the index. */
  slug: string | null;
  onHome: () => void;
};

export default function TextsPage({ slug, onHome }: Props) {
  const text = slug ? getTextBySlug(slug) : undefined;

  // Unknown slug: say so rather than rendering an empty shell.
  if (slug && !text) {
    return (
      <div className="w-full max-w-[820px] mx-auto px-6 md:px-12 py-24 text-center">
        <h1 className="text-2xl font-serif text-[#1F1B16] mb-3">That text isn’t in the library.</h1>
        <p className="text-sm text-[#5C5042] mb-6">
          The link may be mistyped, or the page may have moved.
        </p>
        <a href="#/texts" className="text-sm text-[#866D52] underline underline-offset-4 decoration-[#CBBBA8]">
          See all four texts →
        </a>
      </div>
    );
  }

  return (
    <div className="relative isolate w-full max-w-[820px] mx-auto px-6 md:px-12 py-14 md:py-20">
      {/* A reading column this narrow leaves very wide margins. These sit well
          outside the measure so they never crowd the text. */}
      <KundaliLattice
        aria-hidden="true"
        className="hidden xl:block fixed left-[4%] top-[22%] w-[210px] opacity-[0.09] -z-10"
      />
      <DashaArcs
        aria-hidden="true"
        className="hidden xl:block fixed right-[4%] bottom-[12%] w-[250px] opacity-[0.11] -z-10"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] font-sans text-[#8A7B68] mb-10">
        <button
          type="button"
          onClick={onHome}
          className="hover:text-[#1F1B16] cursor-pointer underline underline-offset-4 decoration-[#DECDBB]"
        >
          Home
        </button>
        <span className="text-[#C4B3A0]">/</span>
        {text ? (
          <>
            <a
              href="#/texts"
              className="hover:text-[#1F1B16] underline underline-offset-4 decoration-[#DECDBB]"
            >
              Classical texts
            </a>
            <span className="text-[#C4B3A0]">/</span>
            <span className="text-[#5C5042]">{text.title}</span>
          </>
        ) : (
          <span className="text-[#5C5042]">Classical texts</span>
        )}
      </nav>

      {!text ? (
        /* ---------- Index ---------- */
        <>
          <span className="text-[11px] uppercase tracking-[0.28em] text-[#937C63] font-semibold block mb-3">
            THE LIBRARY
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-[#1F1B16] font-normal leading-tight mb-5">
            The books behind the readings.
          </h1>
          <p className="text-base text-[#4C4337] leading-relaxed mb-12 max-w-2xl">
            PATTERNS does not invent its interpretive language. It borrows from a
            canon that has been argued over for centuries — and since that canon is
            doing real work in every reading, it should be visible rather than
            implied.
          </p>

          <ul className="flex flex-col gap-4">
            {CLASSICAL_TEXTS.map((t) => (
              <li key={t.slug}>
                <a
                  href={`#/texts/${t.slug}`}
                  className="group block p-6 rounded-2xl bg-[#FAF7F2]/90 border border-[#E3D7C7] transition-all hover:border-[#C4AE92] hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                    <span className="text-lg font-serif text-[#1F1B16]">{t.title}</span>
                    <span className="text-xs text-[#937C63]">{t.sanskrit}</span>
                  </div>
                  <p className="text-sm text-[#5C5042] leading-relaxed mb-2">{t.summary}</p>
                  <span className="text-[11px] text-[#8A7B68]">{t.attributed}</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        /* ---------- One text ---------- */
        <article>
          <header className="mb-10 pb-8 border-b border-[#E8DDCD]">
            <span className="text-[11px] uppercase tracking-[0.28em] text-[#937C63] font-semibold block mb-3">
              CLASSICAL SOURCE
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-[#1F1B16] font-normal leading-tight mb-2">
              {text.title}
            </h1>
            <p className="text-xl font-sans text-[#866D52] mb-4">{text.sanskrit}</p>
            <p className="text-base text-[#5C5042] italic font-serif mb-5">
              “{text.translation}”
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-[11px] text-[#8A7B68] font-sans">
              <span>{text.attributed}</span>
              <span className="hidden sm:inline text-[#C4B3A0]">•</span>
              <span>{text.period}</span>
            </div>
          </header>

          <div className="space-y-5 mb-12">
            {text.about.map((para, i) => (
              <p key={i} className="text-base text-[#453B2F] leading-[1.75]">
                {para}
              </p>
            ))}
          </div>

          <section className="p-6 md:p-7 rounded-2xl bg-[#F2EDE4]/70 border border-[#DFD1BE] mb-12">
            <h2 className="text-sm font-semibold text-[#241F1A] mb-4 tracking-wide">
              What PATTERNS actually takes from it
            </h2>
            <ul className="space-y-3">
              {text.usedFor.map((use, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#5C5042] leading-relaxed">
                  <span className="text-[#8B6E46] font-serif mt-px shrink-0">✶</span>
                  <span>{use}</span>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-xs text-[#8A7B68] leading-relaxed border-t border-[#E8DDCD] pt-6">
            A note on dates: authorship and dating across this canon are genuinely
            disputed, and the surviving manuscripts are later than the traditions
            they record. Where a period is given above it is the scholarly
            convention, not a settled fact.
          </p>

          <div className="mt-10">
            <a
              href="#/texts"
              className="text-sm text-[#866D52] hover:text-[#251E17] underline underline-offset-4 decoration-[#CBBBA8]"
            >
              ← All four texts
            </a>
          </div>
        </article>
      )}
    </div>
  );
}
