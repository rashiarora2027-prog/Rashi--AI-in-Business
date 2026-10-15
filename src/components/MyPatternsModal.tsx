import React, { useState } from 'react';
import { SavedPattern, UserProfile } from '../types';

interface MyPatternsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patterns: SavedPattern[];
  userProfile: UserProfile;
}

const DEFAULT_PATTERNS: SavedPattern[] = [
  {
    id: 'p-1',
    timestamp: 'Sep 21, 2026',
    type: 'feeling',
    headline: 'Feeling disconnected & needing quiet',
    summary: 'Saturnian boundary transit: You are naturally retreating from superficial noise to regenerate internal marrow.',
    relevantPlanets: ['Saturn (Shani)', 'Moon (Chandra)'],
    notes: 'Reclaiming personal evenings without obligation.'
  },
  {
    id: 'p-2',
    timestamp: 'Sep 14, 2026',
    type: 'stuck',
    headline: 'Crossroad: Creative project transition',
    summary: 'The Paradox of External Permission: Instinct was already settled, but waiting for external safety sign-off.',
    relevantPlanets: ['Mercury (Budha)', 'Jupiter (Guru)'],
    notes: 'Took 48-hour quiet moratorium on advice.'
  },
  {
    id: 'p-3',
    timestamp: 'Sep 02, 2026',
    type: 'tarot',
    headline: 'Inquiry on Patience & Growth',
    summary: 'The Wheel of Fortune: Cycles of gestation cannot be accelerated by sheer willpower.',
    relevantPlanets: ['The Star', 'The High Priestess'],
    notes: 'Mantra: "I do not have to fight the tide to arrive where I am meant to be."'
  }
];

export const MyPatternsModal: React.FC<MyPatternsModalProps> = ({
  isOpen,
  onClose,
  patterns,
  userProfile,
}) => {
  const [filter, setFilter] = useState<'all' | 'feeling' | 'stuck' | 'tarot'>('all');
  const allPatterns = patterns.length > 0 ? patterns : DEFAULT_PATTERNS;

  const filtered = filter === 'all' ? allPatterns : allPatterns.filter(p => p.type === filter);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#181410]/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#FAF6F0] rounded-3xl p-6 sm:p-10 border border-[#DECDBB] shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8DDCD]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base text-[#8B6E46]">✦</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A7051] font-semibold font-sans">
                TEMPORAL ARCHIVE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#221C16] font-normal">
              Your Recurring Patterns
            </h2>
            <p className="text-xs text-[#6B5A47] mt-0.5">
              Reflections and cyclical themes tracked over time for {userProfile.name}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#887561] hover:text-[#1E1A16] p-2 rounded-full hover:bg-[#EFE5D7] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cyclical Pattern Synthesis Card */}
        <div className="my-6 p-5 rounded-2xl bg-[#F3ECE0] border border-[#DCCEBE] text-left">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#866D50] block mb-2">
            SYNTHESIS ACROSS YOUR ENTRIES
          </span>
          <h3 className="text-base font-serif text-[#251E17] font-medium mb-1.5">
            Primary Archetypal Pattern: The Call for Solitary Grounding
          </h3>
          <p className="text-xs text-[#524436] leading-relaxed">
            Your recent entries across feelings, decisions, and Tarot draws converge around a single theme:
            <strong> learning to trust your internal cadence over external expectations</strong>. 
            When Saturn transits your sensitive sectors, your body signals fatigue whenever you commit out of guilt rather than genuine resonance.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#E8DDCD] pb-2 text-xs">
          {[
            { id: 'all', label: 'All Entries' },
            { id: 'feeling', label: 'Feelings & Transits' },
            { id: 'stuck', label: 'Crossroads & Decisions' },
            { id: 'tarot', label: 'Tarot Mirrors' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-3 py-1.5 rounded-full cursor-pointer transition-all ${
                filter === tab.id
                  ? 'bg-[#1C1814] text-[#FAF7F2] font-medium'
                  : 'text-[#6B5A47] hover:text-black hover:bg-[#EFE6D9]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timeline List */}
        <div className="space-y-4 text-left">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-white/70 border border-[#DFD1BE] hover:border-[#BFA88F] shadow-xs transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-sans uppercase tracking-wider text-[#8A7155] font-semibold">
                  {item.type} &bull; {item.timestamp}
                </span>
                <div className="flex items-center gap-1.5">
                  {item.relevantPlanets.map((planet, pIdx) => (
                    <span
                      key={pIdx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#F4EDE2] text-[#473A2B] font-serif"
                    >
                      {planet}
                    </span>
                  ))}
                </div>
              </div>

              <h4 className="text-sm font-serif font-medium text-[#221C16] mb-1">
                {item.headline}
              </h4>
              <p className="text-xs text-[#524436] leading-relaxed mb-2">
                {item.summary}
              </p>

              {item.notes && (
                <div className="pt-2 border-t border-[#EDE1D1] text-[11px] text-[#7A6956] italic font-serif">
                  Reflection note: {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-6 border-t border-[#E8DDCD] mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1C1814] text-[#FAF7F2] text-xs font-medium tracking-wide hover:bg-[#342D26] cursor-pointer"
          >
            Close & Return
          </button>
        </div>
      </div>
    </div>
  );
};
