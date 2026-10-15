import React, { useState } from 'react';

interface PlanetInfo {
  name: string;
  sanskrit: string;
  symbol: string;
  theme: string;
  vedicRole: string;
  reflectionQuestion: string;
  currentTransit: string;
}

const PLANETS: PlanetInfo[] = [
  {
    name: 'Sun',
    sanskrit: 'Surya',
    symbol: '☉',
    theme: 'identity',
    vedicRole: 'Atmakaraka (The Soul’s Vital Force)',
    reflectionQuestion: 'Where am I holding back my natural radiance to keep the peace?',
    currentTransit: 'Moving through Virgo/Kanya, illuminating sacred routines and discernment.'
  },
  {
    name: 'Moon',
    sanskrit: 'Chandra',
    symbol: '☽',
    theme: 'emotions',
    vedicRole: 'Manas (The Experiencing Heart & Mind)',
    reflectionQuestion: 'What does my emotional body need to feel safe right now?',
    currentTransit: 'Waxing Gibbous, inviting quiet containment before the full illumination.'
  },
  {
    name: 'Mercury',
    sanskrit: 'Budha',
    symbol: '☿',
    theme: 'mind',
    vedicRole: 'Buddhi (Intellect & Discriminating Speech)',
    reflectionQuestion: 'Is my mental chatter serving insight or merely manufacturing urgency?',
    currentTransit: 'Direct motion, granting crisp clarity to overdue conversations.'
  },
  {
    name: 'Venus',
    sanskrit: 'Shukra',
    symbol: '♀',
    theme: 'love',
    vedicRole: 'Devotion, Aesthetic Grace & Self-Worth',
    reflectionQuestion: 'What relationship dynamic am I ready to elevate from transaction to truth?',
    currentTransit: 'Gracing Libra, encouraging harmonious boundaries and quiet luxury.'
  },
  {
    name: 'Mars',
    sanskrit: 'Mangala',
    symbol: '♂',
    theme: 'action',
    vedicRole: 'Tejas (Courage, Initiative & Boundary Defense)',
    reflectionQuestion: 'Where am I misplacing anger that is really just an unexpressed boundary?',
    currentTransit: 'Energizing purposeful willpower; cautioning against hasty friction.'
  },
  {
    name: 'Jupiter',
    sanskrit: 'Guru / Brihaspati',
    symbol: '♃',
    theme: 'growth',
    vedicRole: 'Dharma, Higher Wisdom & Spiritual Abundance',
    reflectionQuestion: 'What old belief system am I outgrowing as my awareness expands?',
    currentTransit: 'Transiting Taurus, teaching that true wealth is inner steadiness.'
  },
  {
    name: 'Saturn',
    sanskrit: 'Shani',
    symbol: '♄',
    theme: 'discipline',
    vedicRole: 'Karma, Sacred Endurance & Structural Truth',
    reflectionQuestion: 'What responsibility am I resisting that holds the key to my freedom?',
    currentTransit: 'Stationed in Aquarius, asking for architectural integrity in long-term commitments.'
  },
];

export const PlanetaryRow: React.FC = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetInfo | null>(null);

  return (
    <div className="relative pt-6">
      {/* Horizontal row of 7 planets */}
      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
        {PLANETS.map((planet) => {
          const isSelected = selectedPlanet?.name === planet.name;
          return (
            <button
              key={planet.name}
              type="button"
              onClick={() => setSelectedPlanet(isSelected ? null : planet)}
              className={`group flex flex-col items-center cursor-pointer transition-all duration-200 text-left focus:outline-none ${
                isSelected ? 'scale-105' : 'hover:scale-105'
              }`}
              title={`${planet.name} (${planet.theme})`}
            >
              {/* Planetary glyph circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 border ${
                  isSelected
                    ? 'bg-[#EBDDC8] border-[#A88755] shadow-xs'
                    : 'bg-[#F2ECE0]/70 border-[#D8C7B2]/70 group-hover:bg-[#EFE5D5] group-hover:border-[#C4AE91]'
                }`}
              >
                <span className="text-xl text-[#3A332B] font-serif select-none leading-none">
                  {planet.symbol}
                </span>
              </div>

              {/* Name & Theme */}
              <span className="text-[12px] font-medium text-[#2E2822] mt-1.5 font-sans">
                {planet.name}
              </span>
              <span className="text-[11px] text-[#7A6A58] italic font-serif leading-tight">
                {planet.theme}
              </span>
            </button>
          );
        })}
      </div>

      {/* Popover / Drawer for selected planet reflection */}
      {selectedPlanet && (
        <div className="mt-4 p-4 rounded-xl bg-[#FAF6F0] border border-[#DECFBE] shadow-md max-w-md animate-fade-in relative z-20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl text-[#7E6135] font-serif">{selectedPlanet.symbol}</span>
              <div>
                <h4 className="text-sm font-semibold text-[#241F1A]">
                  {selectedPlanet.name} <span className="font-serif italic font-normal text-[#8A7256]">({selectedPlanet.sanskrit})</span>
                </h4>
                <p className="text-[11px] text-[#695844] font-medium tracking-wide uppercase">
                  {selectedPlanet.vedicRole}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPlanet(null)}
              className="text-[#8F7D6B] hover:text-[#2E2822] text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-[#E8DDCE] text-xs space-y-2">
            <div>
              <span className="text-[10px] tracking-wider uppercase text-[#887053] font-semibold block">Current Cosmic Resonance:</span>
              <p className="text-[#3E372E] leading-relaxed mt-0.5">{selectedPlanet.currentTransit}</p>
            </div>
            <div>
              <span className="text-[10px] tracking-wider uppercase text-[#887053] font-semibold block">Reflective Contemplation:</span>
              <p className="text-[#4F4437] italic font-serif text-[13px] mt-0.5 leading-snug">
                “{selectedPlanet.reflectionQuestion}”
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
