import React, { useState } from 'react';

export interface MoonPhaseData {
  id: string;
  name: string;
  sanskrit: string;
  illumination: string;
  symbol: string;
  theme: string;
  meaning: string;
  reflectionPrompt: string;
  actionGuidance: string;
}

export const MOON_PHASES_DATA: MoonPhaseData[] = [
  {
    id: 'new-moon',
    name: 'New Moon',
    sanskrit: 'Amavasya',
    illumination: '0% Illumination',
    symbol: '🌑',
    theme: 'Stillness & Sacred Seeds',
    meaning: 'The lunar disc is cloaked in darkness. This is the cosmic reset point—an invitation to quiet external noise and listen to what whispers in the dark.',
    reflectionPrompt: 'What desire is seeking permission to exist before anyone else approves of it?',
    actionGuidance: 'Rest without guilt. Set intentions in private; protect fragile seeds from early scrutiny.'
  },
  {
    id: 'waxing-crescent',
    name: 'Waxing Crescent',
    sanskrit: 'Shukla Pratipada',
    illumination: '23% Illumination',
    symbol: '🌒',
    theme: 'First Light & Delicate Courage',
    meaning: 'A fine silver crescent reappears. The seed has broken its shell beneath the soil. Momentum is gentle but unmistakable.',
    reflectionPrompt: 'Where can I take one modest, reversible step toward my quiet intention?',
    actionGuidance: 'Focus on devotion rather than dramatic results. Commit to the daily ritual.'
  },
  {
    id: 'first-quarter',
    name: 'First Quarter',
    sanskrit: 'Shukla Ashtami',
    illumination: '50% Illumination',
    symbol: '🌓',
    theme: 'Threshold & Discernment',
    meaning: 'Light and shadow are held in exact balance. This phase often brings an early test of resolve or an unexpected logistical friction.',
    reflectionPrompt: 'Am I hesitating out of genuine wisdom or simply the familiar comfort of hesitation?',
    actionGuidance: 'Make the overdue decision. Energy favors constructive action over continued rumination.'
  },
  {
    id: 'waxing-gibbous',
    name: 'Waxing Gibbous (Current)',
    sanskrit: 'Shukla Ekadashi',
    illumination: '84% Illumination',
    symbol: '🌔',
    theme: 'Gestation & Patient Refining',
    meaning: 'The moon swells toward fullness. The structure of what you are creating is visible now; resist the urge to rush the final polish.',
    reflectionPrompt: 'What would happen if I trusted the natural timing of my maturation?',
    actionGuidance: 'Prune distractions. Deepen your craftsmanship and protect your physical vitality.'
  },
  {
    id: 'full-moon',
    name: 'Full Moon',
    sanskrit: 'Purnima',
    illumination: '100% Illumination',
    symbol: '🌕',
    theme: 'Culmination & Pure Radiance',
    meaning: 'The emotional tide peaks under complete solar reflection. Intuitions and tensions that were buried now rise to consciousness.',
    reflectionPrompt: 'What truth is now too luminous to ignore or diminish?',
    actionGuidance: 'Celebrate progress. Avoid reactive confrontations; allow emotional waves to peak and crest.'
  },
  {
    id: 'waning-gibbous',
    name: 'Waning Gibbous',
    sanskrit: 'Krishna Pratipada',
    illumination: '78% Illumination',
    symbol: '🌖',
    theme: 'Gratitude & Distribution',
    meaning: 'Light gently recedes. The harvest is collected; wisdom turns outward to share, mentor, and express heartfelt appreciation.',
    reflectionPrompt: 'Who in my life deserves unprompted gratitude for holding space for me?',
    actionGuidance: 'Share what you have learned. Teach, synthesize, and record insights in your journal.'
  },
  {
    id: 'last-quarter',
    name: 'Last Quarter',
    sanskrit: 'Krishna Ashtami',
    illumination: '50% Illumination',
    symbol: '🌗',
    theme: 'Release & Conscious Forgiveness',
    meaning: 'The clearing threshold. What has served its season must now be composted to make room for the next emergence.',
    reflectionPrompt: 'What expectation or resentment am I ready to lay down as too heavy to carry?',
    actionGuidance: 'Cleanse physical and digital spaces. Complete lingering loose ends; decline new burdens.'
  },
  {
    id: 'waning-crescent',
    name: 'Waning Crescent',
    sanskrit: 'Balsamic / Shunya',
    illumination: '14% Illumination',
    symbol: '🌘',
    theme: 'Surrender & Restorative Silence',
    meaning: 'The final whisper before the void. The nervous system longs for restorative solitude, dreamwork, and deep somatic replenishment.',
    reflectionPrompt: 'Where is doing nothing the most productive choice I could possibly make?',
    actionGuidance: 'Sleep extra hours. Soak in warm water, fast from commentary, and surrender control.'
  }
];

interface LunarRhythmIndicatorProps {
  onPhaseSelect?: (phase: MoonPhaseData) => void;
}

export const LunarRhythmIndicator: React.FC<LunarRhythmIndicatorProps> = ({ onPhaseSelect }) => {
  // Current active moon phase (default to Waxing Gibbous: index 3)
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(3);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const currentPhase = MOON_PHASES_DATA[selectedPhaseIndex];

  const handleSelect = (idx: number) => {
    setSelectedPhaseIndex(idx);
    setIsExpanded(true);
    onPhaseSelect?.(MOON_PHASES_DATA[idx]);
  };

  return (
    <div className="w-full max-w-[440px] mx-auto mb-3 select-none">
      {/* Top compact indicator capsule */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="group cursor-pointer rounded-2xl bg-[#FAF6F0]/95 hover:bg-[#FAF6F0] border border-[#DECFBD] hover:border-[#BFA482] shadow-xs px-3.5 py-2.5 transition-all duration-300 flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          {/* Moon Icon with soft glow */}
          <div className="w-7 h-7 rounded-full bg-[#EFE6D8] border border-[#D5C2AA] flex items-center justify-center text-sm shadow-inner group-hover:scale-105 transition-transform">
            <span>{currentPhase.symbol}</span>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-[#8B6E46]">
                LUNAR RHYTHM
              </span>
              <span className="text-[9px] text-[#A6937C]">&bull;</span>
              <span className="text-[10px] text-[#705E4A] font-medium">
                {currentPhase.name.replace(' (Current)', '')}
              </span>
            </div>
            <p className="text-[11px] font-serif italic text-[#3A3127] line-clamp-1">
              &ldquo;{currentPhase.theme}&rdquo;
            </p>
          </div>
        </div>

        {/* Right Toggle */}
        <div className="flex items-center gap-2 text-[#887259]">
          <span className="text-[10px] font-mono font-medium text-[#7A664E] hidden sm:inline">
            {currentPhase.illumination.split(' ')[0]}
          </span>
          <span className={`text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {/* Expanded Interactive 8-Phase Ribbon & Deep Meaning */}
      {isExpanded && (
        <div className="mt-2 p-4 rounded-2xl bg-[#FAF6F0]/95 backdrop-blur-md border border-[#DECFBD] shadow-lg animate-fade-in text-left">
          
          {/* Phase scrubber ribbon */}
          <div className="flex items-center justify-between gap-1 pb-3 mb-3 border-b border-[#EADC run-in]">
            {MOON_PHASES_DATA.map((phase, idx) => {
              const isSelected = idx === selectedPhaseIndex;
              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  className={`flex flex-col items-center p-1.5 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EBDDC8] shadow-xs scale-110 border border-[#BFA27E]'
                      : 'hover:bg-[#F2E8D9] text-[#786754]'
                  }`}
                  title={`${phase.name} (${phase.sanskrit})`}
                >
                  <span className="text-base sm:text-lg leading-none">{phase.symbol}</span>
                  <span className={`text-[8px] font-sans mt-1 ${isSelected ? 'font-semibold text-[#251E17]' : 'text-[#8E7C67]'}`}>
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Phase Details */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <h4 className="text-sm font-serif font-medium text-[#201A15]">
                  {currentPhase.name} <span className="italic text-xs font-normal text-[#866D4E]">({currentPhase.sanskrit})</span>
                </h4>
                <p className="text-[10px] uppercase tracking-wider text-[#8A7153] font-semibold">
                  {currentPhase.theme} &bull; {currentPhase.illumination}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#4F4336] leading-relaxed mt-1">
              {currentPhase.meaning}
            </p>

            <div className="mt-3 pt-2.5 border-t border-[#EADBCA] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/70 border border-[#E3D4C2]">
                <span className="text-[9px] uppercase tracking-wider text-[#8B6E46] font-semibold block mb-0.5">
                  Journal Reflection:
                </span>
                <p className="font-serif italic text-[11px] text-[#332A20] leading-snug">
                  &ldquo;{currentPhase.reflectionPrompt}&rdquo;
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/70 border border-[#E3D4C2]">
                <span className="text-[9px] uppercase tracking-wider text-[#8B6E46] font-semibold block mb-0.5">
                  Somatic Guidance:
                </span>
                <p className="text-[11px] text-[#44382B] leading-snug">
                  {currentPhase.actionGuidance}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
