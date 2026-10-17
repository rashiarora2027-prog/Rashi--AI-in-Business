import React from 'react';
import { BotanicalLeafIllustration } from './BotanicalLeafIllustration';
import { BookStackIllustration } from './BookStackIllustration';

interface CredibilityBannerProps {
  onLearnMore?: () => void;
}

export const CredibilityBanner: React.FC<CredibilityBannerProps> = ({ onLearnMore }) => {
  return (
    <footer className="relative w-full pt-10 pb-12 mt-12 overflow-hidden border-t border-[#E8DDCD]/80">
      {/* Background subtle curved arch container matching the bottom of reference image */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,180px)_minmax(0,1fr)_minmax(0,260px)] items-center gap-8 lg:gap-10">
        
        {/* Left corner: Botanical Ficus Leaves */}
        <div className="hidden lg:flex justify-start">
          <BotanicalLeafIllustration />
        </div>

        {/* Center: Credibility Banner */}
        <div className="w-full text-center py-6 px-6 md:px-8 rounded-2xl bg-[#EFE9DF]/80 border border-[#DFD1BE] backdrop-blur-sm shadow-xs">
          {/* Eyebrow. The four texts now have a section and a page of their own,
              so this is a pointer rather than a cramped list of names. */}
          <div className="flex items-center justify-center gap-2 mb-2.5">
            <span className="text-base text-[#866D52]">📖</span>
            <span className="text-xs md:text-sm font-serif font-medium text-[#29221B] tracking-wide">
              Grounded in four classical Vedic texts
            </span>
          </div>

          <p className="text-[11px] md:text-xs text-[#5E5140] tracking-wide font-sans mb-3">
            <a
              href="#/texts"
              className="font-medium text-[#382E23] underline underline-offset-4 decoration-[#CBBBA8] hover:text-[#1F1B16]"
            >
              See which books, and what each one is →
            </a>
          </p>

          <p className="text-[11px] text-[#786754] max-w-lg mx-auto leading-relaxed">
            Astrology is presented here as a centuries-old reflective framework for self-inquiry and discernment, 
            drawing upon foundational interpretive principles rather than deterministic prediction.
          </p>

          {onLearnMore && (
            <button
              onClick={onLearnMore}
              className="mt-3 text-[11px] text-[#866D52] hover:text-[#251E17] font-medium underline underline-offset-4 decoration-[#CBBBA8] cursor-pointer"
            >
              Read our astrological philosophy & classic sources →
            </button>
          )}
        </div>

        {/* Right Corner: The Stack of Antique Books on travertine with singing bowl */}
        <div className="hidden lg:block">
          <div className="flex flex-col items-center">
            <span className="text-[10px] tracking-[0.2em] font-sans text-[#8C765C] uppercase font-semibold mb-2 text-center">
              INSIGHTS FOR A MORE INTENTIONAL YOU
            </span>
            <BookStackIllustration />
          </div>
        </div>
      </div>

      {/* Mobile visible book attribution */}
      <div className="lg:hidden mt-6 flex flex-col items-center text-center px-4">
        <span className="text-[10px] tracking-[0.2em] font-sans text-[#8C765C] uppercase font-semibold mb-3">
          INSIGHTS FOR A MORE INTENTIONAL YOU
        </span>
        <BookStackIllustration />
      </div>
    </footer>
  );
};
