import React from 'react';

interface FeatureCardProps {
  onOpenBirthChart: () => void;
  onOpenImStuck: () => void;
  onOpenCompatibility: () => void;
  onOpenTarot: () => void;
  onOpenPatterns: () => void;
  onOpenCompanions: () => void;
}

export const FeatureCardsRow: React.FC<FeatureCardProps> = ({
  onOpenBirthChart,
  onOpenImStuck,
  onOpenCompatibility,
  onOpenTarot,
  onOpenPatterns,
  onOpenCompanions,
}) => {
  return (
    <section className="w-full pt-6 pb-6">
      {/* Editorial Section Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#867158] font-semibold block mb-1">
            A DEEPER UNDERSTANDING
          </span>
          <h2 className="text-2xl md:text-3xl font-serif text-[#1F1B16] font-normal">
            More than a horoscope.
          </h2>
        </div>

        {/* Quick link to Companions & Patterns */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPatterns}
            className="text-xs text-[#5E5140] hover:text-[#1F1B16] font-medium tracking-wide flex items-center gap-1.5 cursor-pointer underline underline-offset-4 decoration-[#CBBBA8]"
          >
            <span>View My Patterns</span>
            <span className="font-serif">→</span>
          </button>
          <span className="text-[#C2B29F]">&bull;</span>
          <button
            onClick={onOpenCompanions}
            className="text-xs text-[#5E5140] hover:text-[#1F1B16] font-medium tracking-wide flex items-center gap-1.5 cursor-pointer underline underline-offset-4 decoration-[#CBBBA8]"
          >
            <span>AI Companions</span>
            <span className="font-serif">→</span>
          </button>
        </div>
      </div>

      {/* Grid of the 4 Main Cards from Reference Image (+ 1 fifth bonus for Patterns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Birth Chart */}
        <div
          onClick={onOpenBirthChart}
          className="group relative cursor-pointer rounded-2xl p-6 bg-[#FAF7F2]/80 backdrop-blur-md border border-[#E4D7C8] hover:border-[#BFA88F] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[175px]"
        >
          <div>
            {/* 8-point gold compass star icon */}
            <div className="w-9 h-9 text-[#856C47] mb-4">
              <svg viewBox="0 0 32 32" className="w-8 h-8 fill-current">
                <path d="M16 0 L18 12 L30 14 L18 16 L16 28 L14 16 L2 14 L14 12 Z" />
                <circle cx="16" cy="14" r="2" fill="#FAF7F2" />
              </svg>
            </div>
            <h3 className="text-lg font-serif text-[#221D17] font-medium mb-1.5">
              Birth Chart
            </h3>
            <p className="text-xs text-[#635545] leading-relaxed">
              Understand your core personality and life themes.
            </p>
          </div>

          <div className="self-end mt-4">
            <div className="w-7 h-7 rounded-full border border-[#D5C5B2] flex items-center justify-center text-[#554737] group-hover:bg-[#1E1A16] group-hover:text-white group-hover:border-[#1E1A16] transition-colors">
              <span className="text-xs font-serif leading-none">→</span>
            </div>
          </div>
        </div>

        {/* 2. I'm Stuck */}
        <div
          onClick={onOpenImStuck}
          className="group relative cursor-pointer rounded-2xl p-6 bg-[#FAF7F2]/80 backdrop-blur-md border border-[#E4D7C8] hover:border-[#BFA88F] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[175px]"
        >
          <div>
            {/* Crescent moon icon */}
            <div className="w-9 h-9 text-[#856C47] mb-4 flex items-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current stroke-[1.4]">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <h3 className="text-lg font-serif text-[#221D17] font-medium mb-1.5">
              I’m Stuck
            </h3>
            <p className="text-xs text-[#635545] leading-relaxed">
              Simple yes/no questions to find clarity.
            </p>
          </div>

          <div className="self-end mt-4">
            <div className="w-7 h-7 rounded-full border border-[#D5C5B2] flex items-center justify-center text-[#554737] group-hover:bg-[#1E1A16] group-hover:text-white group-hover:border-[#1E1A16] transition-colors">
              <span className="text-xs font-serif leading-none">→</span>
            </div>
          </div>
        </div>

        {/* 3. Compatibility */}
        <div
          onClick={onOpenCompatibility}
          className="group relative cursor-pointer rounded-2xl p-6 bg-[#FAF7F2]/80 backdrop-blur-md border border-[#E4D7C8] hover:border-[#BFA88F] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[175px]"
        >
          <div>
            {/* Interlocking double circles */}
            <div className="w-9 h-9 text-[#856C47] mb-4 flex items-center">
              <svg viewBox="0 0 32 20" className="w-8 h-6 fill-none stroke-current stroke-[1.4]">
                <circle cx="9" cy="10" r="7" />
                <circle cx="23" cy="10" r="7" />
              </svg>
            </div>
            <h3 className="text-lg font-serif text-[#221D17] font-medium mb-1.5">
              Compatibility
            </h3>
            <p className="text-xs text-[#635545] leading-relaxed">
              Explore your connection dynamics.
            </p>
          </div>

          <div className="self-end mt-4">
            <div className="w-7 h-7 rounded-full border border-[#D5C5B2] flex items-center justify-center text-[#554737] group-hover:bg-[#1E1A16] group-hover:text-white group-hover:border-[#1E1A16] transition-colors">
              <span className="text-xs font-serif leading-none">→</span>
            </div>
          </div>
        </div>

        {/* 4. Tarot */}
        <div
          onClick={onOpenTarot}
          className="group relative cursor-pointer rounded-2xl p-6 bg-[#FAF7F2]/80 backdrop-blur-md border border-[#E4D7C8] hover:border-[#BFA88F] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[175px]"
        >
          <div>
            {/* Tarot card icon with eye */}
            <div className="w-9 h-9 text-[#856C47] mb-4 flex items-center">
              <svg viewBox="0 0 24 30" className="w-7 h-8 fill-none stroke-current stroke-[1.3]">
                <rect x="2" y="2" width="20" height="26" rx="2" />
                <path d="M6 15 C8 11, 16 11, 18 15 C16 19, 8 19, 6 15 Z" />
                <circle cx="12" cy="15" r="2" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-lg font-serif text-[#221D17] font-medium mb-1.5">
              Tarot
            </h3>
            <p className="text-xs text-[#635545] leading-relaxed">
              Get a new perspective for what&apos;s on your mind.
            </p>
          </div>

          <div className="self-end mt-4">
            <div className="w-7 h-7 rounded-full border border-[#D5C5B2] flex items-center justify-center text-[#554737] group-hover:bg-[#1E1A16] group-hover:text-white group-hover:border-[#1E1A16] transition-colors">
              <span className="text-xs font-serif leading-none">→</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
