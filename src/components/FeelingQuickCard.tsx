import React, { useState } from 'react';
import { QuickFeeling } from '../types';

interface FeelingQuickCardProps {
  onSelectFeeling: (feeling: QuickFeeling, customNote?: string) => void;
  onOpenDirect: () => void;
}

const FEELING_OPTIONS: QuickFeeling[] = [
  'Curious',
  'Stuck',
  'Anxious',
  'Excited',
  'Overwhelmed',
  'Just exploring',
];

export const FeelingQuickCard: React.FC<FeelingQuickCardProps> = ({
  onSelectFeeling,
  onOpenDirect,
}) => {
  const [selected, setSelected] = useState<QuickFeeling | null>(null);
  const [customText, setCustomText] = useState('');
  const [isInputExpanded, setIsInputExpanded] = useState(false);

  const handlePillClick = (feeling: QuickFeeling) => {
    setSelected(feeling);
    onSelectFeeling(feeling);
  };

  const handleGo = () => {
    if (customText.trim()) {
      onSelectFeeling(selected || 'Curious', customText.trim());
    } else if (selected) {
      onSelectFeeling(selected);
    } else {
      onOpenDirect();
    }
  };

  return (
    <div className="flex flex-col items-start w-full max-w-[360px] mx-auto lg:mx-0">
      {/* Floating Card */}
      <div className="w-full bg-[#FAF7F2]/90 backdrop-blur-md rounded-2xl p-6 border border-[#E3D7C7] shadow-sm relative overflow-hidden transition-all hover:border-[#D0C0AC]">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-serif text-[#221D18] font-normal tracking-tight">
            How are you feeling today?
          </h3>
          <button
            type="button"
            onClick={handleGo}
            className="cursor-pointer w-8 h-8 rounded-full bg-[#1C1814] text-[#F8F5EE] flex items-center justify-center transition-all duration-200 hover:scale-105 hover:bg-[#342D26]"
            aria-label="Explore feeling"
          >
            <span className="text-sm font-serif">→</span>
          </button>
        </div>

        {/* 6 Feeling Pills */}
        <div className="grid grid-cols-2 gap-2.5">
          {FEELING_OPTIONS.map((opt) => {
            const isChosen = selected === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handlePillClick(opt)}
                className={`cursor-pointer py-2 px-3 rounded-full text-xs font-medium transition-all duration-200 text-center border ${
                  isChosen
                    ? 'bg-[#EBDDC9] border-[#A8885B] text-[#221D18] shadow-xs'
                    : 'bg-[#F2ECE1]/80 hover:bg-[#EAE2D3] border-[#E0D3C2] text-[#473E34]'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Expandable freeform input toggle */}
        <div className="mt-3.5 pt-3 border-t border-[#E8DDCD]/70">
          {!isInputExpanded ? (
            <button
              type="button"
              onClick={() => setIsInputExpanded(true)}
              className="text-[11px] text-[#7A6956] hover:text-[#2E2822] cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <span>Or describe in your own words...</span>
              <span className="text-xs">✍</span>
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g. Feeling disconnected for weeks..."
                className="w-full text-xs px-3 py-2 rounded-lg bg-white/70 border border-[#DACBB8] text-[#2E2822] placeholder:text-[#9A8A78] focus:outline-none focus:border-[#A88755]"
                onKeyDown={(e) => e.key === 'Enter' && handleGo()}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGo}
                  className="text-[11px] text-[#2B231B] font-medium underline underline-offset-2 hover:text-black cursor-pointer"
                >
                  Synthesize Insight →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quote directly below the card */}
      <div className="mt-5 text-left w-full pl-1">
        <blockquote className="font-serif italic text-sm md:text-[15px] text-[#4F4335] leading-relaxed">
          &ldquo;The universe has a way of showing you what you need to see.&rdquo;
        </blockquote>
        <div className="w-12 h-[1px] bg-[#BFA88F] mt-2.5" />
      </div>

      {/* Handwritten cursive script annotation */}
      <div className="mt-3.5 self-end mr-2">
        <span className="font-script text-xl md:text-2xl text-[#846F54] -rotate-3 block select-none">
          greater clearer calmer you
        </span>
      </div>
    </div>
  );
};
