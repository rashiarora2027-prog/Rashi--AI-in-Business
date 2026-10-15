import React from 'react';

interface InfoModalProps {
  type: 'explore' | 'about' | 'pricing' | 'faqs' | null;
  onClose: () => void;
  onStartNow: () => void;
}

export const InfoModals: React.FC<InfoModalProps> = ({ type, onClose, onStartNow }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#181410]/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FAF6F0] rounded-3xl p-6 sm:p-10 border border-[#DECDBB] shadow-2xl my-8 max-h-[90vh] overflow-y-auto text-left">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8DDCD]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A7051] font-semibold font-sans block mb-1">
              {type === 'explore' && 'COSMIC TOPOGRAPHY'}
              {type === 'about' && 'OUR PHILOSOPHY'}
              {type === 'pricing' && 'TRANSPARENT MEMBERSHIPS'}
              {type === 'faqs' && 'FREQUENTLY INQUIRED'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#221C16] font-normal">
              {type === 'explore' && 'Explore the System'}
              {type === 'about' && 'Centuries of Astrological Wisdom'}
              {type === 'pricing' && 'Invest in Self-Awareness'}
              {type === 'faqs' && 'Questions & Understanding'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#887561] hover:text-[#1E1A16] p-2 rounded-full hover:bg-[#EFE5D7] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content by Type */}
        <div className="my-6 space-y-4 text-xs sm:text-sm text-[#4E4234] leading-relaxed">
          {type === 'explore' && (
            <div className="space-y-4">
              <p>
                Patterns is an interactive bridge between your subjective internal state and objective cosmological cycles.
                Instead of telling you what will happen, we explore the energetic terrain through four dimensions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white/70 border border-[#DFD1BE]">
                  <span className="font-semibold text-[#251E17] block mb-1">1. Planetary Transits (Gochara)</span>
                  <p className="text-xs text-[#5E5040]">Real-time movements of the planets through the 12 zodiacal houses, mirroring daily and seasonal shifts in collective feeling.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/70 border border-[#DFD1BE]">
                  <span className="font-semibold text-[#251E17] block mb-1">2. Lunar Mansions (Nakshatras)</span>
                  <p className="text-xs text-[#5E5040]">27 celestial segments that capture fine emotional textures far deeper than broad sun signs alone.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/70 border border-[#DFD1BE]">
                  <span className="font-semibold text-[#251E17] block mb-1">3. Life Seasons (Dashas)</span>
                  <p className="text-xs text-[#5E5040]">Vedic planetary periods that explain why certain multi-year periods feel like intense learning while others bring effortless bloom.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/70 border border-[#DFD1BE]">
                  <span className="font-semibold text-[#251E17] block mb-1">4. Relational Synastry</span>
                  <p className="text-xs text-[#5E5040]">Multi-layered compatibility honoring each individual’s pace, communication cadence, and boundary requirements.</p>
                </div>
              </div>
            </div>
          )}

          {type === 'about' && (
            <div className="space-y-4">
              <p className="font-serif italic text-base text-[#282119]">
                &ldquo;Astrology is not destiny; it is the poetic language of natural cycles.&rdquo;
              </p>
              <p>
                We built Patterns to rescue astrology from deterministic clickbait and fatalistic superstition.
                Our interpretive foundation is rooted in classic Sanskrit compendiums compiled across millennia:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#44382B]">
                <li><strong>Brihat Parashara Hora Shastra</strong> — The foundational textbook of Vedic astronomy and psychological archetypes.</li>
                <li><strong>Jataka Parijata</strong> — 15th-century masterpiece on planetary dignities and character discernment.</li>
                <li><strong>Saravali</strong> — Kalyana Varma’s celebrated poetry on human emotions and interpersonal chemistry.</li>
                <li><strong>Phaladeepika</strong> — Practical insights on navigating life transitions with composure.</li>
              </ul>
              <p className="pt-2 text-xs text-[#6B5A47]">
                These classic texts are our conceptual compass. We present astrology as a reflective mirror for self-discovery,
                emotional literacy, and conscious decision-making.
              </p>
            </div>
          )}

          {type === 'pricing' && (
            <div className="space-y-6">
              <p className="text-xs text-[#695847]">
                Clear, honest memberships. No predatory subscription traps, no sensationalist fortune-telling.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-white/70 border border-[#DFD1BE] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8A7155]">Seeker</span>
                    <h3 className="text-xl font-serif text-[#221C16] my-1">Free</h3>
                    <p className="text-[11px] text-[#635342]">Daily feeling reflections, birth chart overview, and basic transit radar.</p>
                  </div>
                  <button
                    onClick={() => { onClose(); onStartNow(); }}
                    className="mt-4 w-full py-1.5 rounded-full border border-[#C5B39E] text-xs font-medium hover:bg-[#F3EBE0]"
                  >
                    Current Plan
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#EFE4D3] border border-[#A8885B] flex flex-col justify-between shadow-xs relative">
                  <div className="absolute -top-2.5 right-3 bg-[#1C1814] text-[#FAF7F2] text-[9px] uppercase px-2 py-0.5 rounded-full tracking-wider">
                    Most Popular
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8A7155]">In Rhythm</span>
                    <h3 className="text-xl font-serif text-[#221C16] my-1">$12<span className="text-xs font-sans font-normal text-[#6B5A47]"> / mo</span></h3>
                    <p className="text-[11px] text-[#554737]">Unlimited &ldquo;Why Am I Feeling This?&rdquo;, full synastry compatibility, Tarot spreads & patterns archive.</p>
                  </div>
                  <button
                    onClick={() => { onClose(); onStartNow(); }}
                    className="mt-4 w-full py-1.5 rounded-full bg-[#1C1814] text-[#FAF7F2] text-xs font-medium hover:bg-[#342D26]"
                  >
                    Start 14-Day Journey
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 border border-[#DFD1BE] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8A7155]">Patron</span>
                    <h3 className="text-xl font-serif text-[#221C16] my-1">$140<span className="text-xs font-sans font-normal text-[#6B5A47]"> / yr</span></h3>
                    <p className="text-[11px] text-[#635342]">Annual companion dialogues, personalized Mahadasha roadmap & priority classic insights.</p>
                  </div>
                  <button
                    onClick={() => { onClose(); onStartNow(); }}
                    className="mt-4 w-full py-1.5 rounded-full border border-[#C5B39E] text-xs font-medium hover:bg-[#F3EBE0]"
                  >
                    Select Patron
                  </button>
                </div>
              </div>
            </div>
          )}

          {type === 'faqs' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-white/70 border border-[#DFD1BE]">
                <h4 className="font-semibold text-xs text-[#241E17] mb-1">Is Patterns claiming to predict my future?</h4>
                <p className="text-xs text-[#5A4D3E]">
                  Never. We firmly reject deterministic or fatalistic predictions. Planetary transits are treated like meteorological seasons: winter doesn’t force you to wear a coat, but knowing it is winter helps you dress accordingly.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/70 border border-[#DFD1BE]">
                <h4 className="font-semibold text-xs text-[#241E17] mb-1">Why don’t you provide a compatibility percentage (e.g. 87%)?</h4>
                <p className="text-xs text-[#5A4D3E]">
                  Because human intimacy cannot be reduced to a single score. Two people can share passionate magnetic attraction while needing conscious practice in communication. We break down relationships into six qualitative dimensions.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/70 border border-[#DFD1BE]">
                <h4 className="font-semibold text-xs text-[#241E17] mb-1">What if I don’t know my exact birth time?</h4>
                <p className="text-xs text-[#5A4D3E]">
                  You can still use Patterns. While exact time determines your rising sign (Lagna), planetary transits and Moon signs provide profound reflections even with approximate timing.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-[#E8DDCD]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1C1814] text-[#FAF7F2] text-xs font-medium tracking-wide hover:bg-[#342D26] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
