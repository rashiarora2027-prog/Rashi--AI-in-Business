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
      <div className="max-w-7xl mx-auto px-6 relative flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left corner: Botanical Ficus Leaves */}
        <div className="hidden md:block absolute -left-8 -bottom-4 z-10">
          <BotanicalLeafIllustration />
        </div>

        {/* Center: Credibility Banner */}
        <div className="w-full max-w-3xl mx-auto text-center z-20 py-6 px-8 rounded-2xl bg-[#EFE9DF]/80 border border-[#DFD1BE] backdrop-blur-sm shadow-xs">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-base text-[#866D52]">📖</span>
            <span className="text-xs md:text-sm font-serif font-medium text-[#29221B] tracking-wide">
              Runs on the wisdom of 1,000+ classic texts
            </span>
          </div>

          {/* Core Sanskrit Classical Canons */}
          <p className="text-[11px] md:text-xs text-[#5E5140] tracking-wide font-sans mb-3 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
            <span className="font-medium text-[#382E23]">Brihat Parashara Hora Shastra</span>
            <span className="text-[#B3A08A]">|</span>
            <span className="font-medium text-[#382E23]">Jataka Parijata</span>
            <span className="text-[#B3A08A]">|</span>
            <span className="font-medium text-[#382E23]">Saravali</span>
            <span className="text-[#B3A08A]">|</span>
            <span className="font-medium text-[#382E23]">Phaladeepika</span>
            <span className="text-[#846E56] italic font-serif">and more</span>
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
        <div className="hidden lg:block absolute -right-4 -bottom-2 z-10">
          <div className="flex flex-col items-end">
            <span className="text-[10px] tracking-[0.2em] font-sans text-[#8C765C] uppercase font-semibold mb-2 mr-3">
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
