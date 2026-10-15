import React, { useState } from 'react';
import { TarotCard, TarotReadingResult } from '../types';

interface TarotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAROT_DECK: TarotCard[] = [
  {
    id: 'ii-high-priestess',
    name: 'The High Priestess',
    number: 'II',
    arcana: 'Major',
    keywords: ['Intuition', 'Sacred Stillness', 'Unconscious Depths', 'Mystery'],
    description: 'Guardian of the temple veil, representing receptive wisdom and listening before speaking.',
    uprightMeaning: 'A call to trust your inner sensing. Answers are fermenting in the silence rather than the noise.',
    symbolism: 'Pillars of duality, pomegranate veil, lunar crescent at her feet.',
  },
  {
    id: 'x-wheel-of-fortune',
    name: 'The Wheel of Fortune',
    number: 'X',
    arcana: 'Major',
    keywords: ['Cycles', 'Inevitable Shifts', 'Karma', 'Cosmic Turning'],
    description: 'The revolving mandala of circumstance reminding us that no season of difficulty or triumph is static.',
    uprightMeaning: 'Accepting the natural rotation of events with centered serenity rather than frantic struggle.',
    symbolism: 'Sphinx of discernment, four fixed astrological beings, wheel of revolving letters.',
  },
  {
    id: 'xvii-the-star',
    name: 'The Star',
    number: 'XVII',
    arcana: 'Major',
    keywords: ['Hope', 'Replenishment', 'Serene Clarity', 'Inspiration'],
    description: 'The maiden pouring water onto both earth and pool under seven celestial beacons.',
    uprightMeaning: 'Healing after a heavy crucible. Clarity is returning softly without the need to force it.',
    symbolism: 'Central radiant eight-point star, sacred water vessels, fertile earth.',
  },
  {
    id: 'ix-the-hermit',
    name: 'The Hermit',
    number: 'IX',
    arcana: 'Major',
    keywords: ['Solitude', 'Inner Lantern', 'Self-Reliance', 'Guidance'],
    description: 'The solitary traveler on the mountain crest holding a lantern illuminated by a six-point star.',
    uprightMeaning: 'Withdraw from external council. The lantern illuminates only the next step, which is all you need.',
    symbolism: 'Golden lantern, staff of experience, quiet snow-capped peak.',
  },
  {
    id: 'i-the-magician',
    name: 'The Magician',
    number: 'I',
    arcana: 'Major',
    keywords: ['Conscious Will', 'Manifestation', 'Alignment', 'Resourcefulness'],
    description: 'Channeling celestial fire downward through the altar of the four classical elements.',
    uprightMeaning: 'You already possess the tools required. Align thought, speech, and action in one direction.',
    symbolism: 'Infinity lemniscate, wand pointed to heavens, table with cup, sword, wand, pentacle.',
  },
  {
    id: 'xix-the-sun',
    name: 'The Sun',
    number: 'XIX',
    arcana: 'Major',
    keywords: ['Vital Radiance', 'Joy', 'Authentic Expression', 'Clarity'],
    description: 'Radiant golden sun presiding over a joyous innocence and blooming sunflowers.',
    uprightMeaning: 'Emergence from shadows into the warmth of truth. Being seen as you truly are.',
    symbolism: 'Solar face, child on white horse, wall of garden protection.',
  },
  {
    id: 'iv-the-emperor',
    name: 'The Emperor',
    number: 'IV',
    arcana: 'Major',
    keywords: ['Structure', 'Sovereignty', 'Boundaries', 'Stability'],
    description: 'The master builder seated on a throne carved with ram heads, embodying constructive discipline.',
    uprightMeaning: 'Establish clear architecture in your daily life. Emotional calm follows healthy boundaries.',
    symbolism: 'Stone throne, globe and scepter, protective armor beneath royal robes.',
  },
  {
    id: 'xiv-temperance',
    name: 'Temperance',
    number: 'XIV',
    arcana: 'Major',
    keywords: ['Alchemy', 'Patience', 'Balance', 'Integration'],
    description: 'The winged guide blending water between two golden chalices without spilling a single drop.',
    uprightMeaning: 'Moderation and synthesized opposites. Do not rush to extremes; let the blend stabilize.',
    symbolism: 'Golden chalices, iris flowers, path leading to the rising sun.',
  }
];

export const TarotModal: React.FC<TarotModalProps> = ({ isOpen, onClose }) => {
  const [question, setQuestion] = useState('What does this current life phase ask me to notice?');
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);
  const [isReading, setIsReading] = useState(false);
  const [readingResult, setReadingResult] = useState<TarotReadingResult | null>(null);

  if (!isOpen) return null;

  const handleDrawCards = () => {
    // Pick 3 unique random cards from deck
    const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
    const drawn = shuffled.slice(0, 3);
    setSelectedCards(drawn);
    setRevealed([false, false, false]);
    setReadingResult(null);
  };

  const handleRevealCard = (idx: number) => {
    const nextRevealed = [...revealed];
    nextRevealed[idx] = true;
    setRevealed(nextRevealed);
  };

  const handleSynthesize = async () => {
    setIsReading(true);
    try {
      const res = await fetch('/api/tarot-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          cards: selectedCards,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch reading');
      const data = await res.json();
      setReadingResult({ ...data, cards: selectedCards });
    } catch (err) {
      console.error(err);
      setReadingResult({
        theme: 'The Surrender to Natural Cycles & Inward Restoration',
        rootInterpretation: `At the root of your inquiry sits ${selectedCards[0]?.name}. You have been accumulating quiet impressions and unspoken truths that have not yet found their verbal expression. The seeds of your current question were planted in a moment of solitary realization.`,
        crucibleInterpretation: `In the present moment sits ${selectedCards[1]?.name}. Circumstances outside your direct command are asking for your flexibility. The discomfort you feel is the friction of trying to steer a current that simply wishes to carry you past an old shoreline.`,
        horizonInterpretation: `Guiding your path ahead is ${selectedCards[2]?.name}. After the storm, calm waters always return. This card is a quiet reassurance that clarity is not something you have to fabricate by force; it will emerge naturally as the dust settles.`,
        syntheticGuidance: 'Your spread suggests that the anxiety around "solving" your situation is actually preventing you from receiving the natural resolution already unfolding. Honor the stillness at your core.',
        meditationMantra: 'I do not have to fight the tide to arrive where I am meant to be.',
        cards: selectedCards,
      });
    } finally {
      setIsReading(false);
    }
  };

  const allRevealed = revealed.every(Boolean) && selectedCards.length === 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#181410]/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#FAF6F0] rounded-3xl p-6 sm:p-10 border border-[#DECDBB] shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8DDCD]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base text-[#8B6E46]">🂠</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A7051] font-semibold font-sans">
                ARCHETYPAL TAROT
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#221C16] font-normal">
              Tarot Reflection Room
            </h2>
            <p className="text-xs text-[#6B5A47] mt-0.5">
              Three-card mirror for contemplative inquiry and symbolic perspective.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#887561] hover:text-[#1E1A16] p-2 rounded-full hover:bg-[#EFE5D7] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Question Input */}
        <div className="my-6">
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6F5F4E] mb-1.5">
            Your Question or Contemplation
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is my hesitation trying to protect?"
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl bg-white border border-[#D8C7B4] text-[#241F1A] focus:outline-none focus:border-[#8E724F]"
            />
            <button
              type="button"
              onClick={handleDrawCards}
              className="px-5 py-2.5 rounded-xl bg-[#1C1814] text-[#FAF7F2] text-xs font-medium tracking-wide hover:bg-[#342D26] cursor-pointer whitespace-nowrap"
            >
              Draw 3 Cards →
            </button>
          </div>
        </div>

        {/* Card Display Spread */}
        {selectedCards.length > 0 && (
          <div className="my-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['The Root (Foundation)', 'The Crucible (Tension)', 'The Horizon (Guidance)'].map((role, idx) => {
                const card = selectedCards[idx];
                const isFlipped = revealed[idx];

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8B704E] mb-2 font-sans">
                      {role}
                    </span>

                    {/* Card Container */}
                    <div
                      onClick={() => handleRevealCard(idx)}
                      className={`w-44 h-64 rounded-2xl p-4 cursor-pointer transition-all duration-500 transform relative select-none flex flex-col justify-between border shadow-md ${
                        isFlipped
                          ? 'bg-[#F9F5EE] border-[#BFA78E]'
                          : 'bg-gradient-to-br from-[#2D2620] via-[#1E1915] to-[#120F0D] border-[#8C7456] hover:scale-105'
                      }`}
                    >
                      {!isFlipped ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-2">
                          <div className="w-12 h-12 rounded-full border border-[#C5AA87]/50 flex items-center justify-center mb-2">
                            <span className="text-base text-[#D4B892] font-serif">✦</span>
                          </div>
                          <span className="text-[10px] text-[#A6937D] uppercase tracking-widest font-sans">
                            Tap to Reveal
                          </span>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col justify-between text-left animate-fade-in">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-serif text-[#866D4E]">
                                {card.number}
                              </span>
                              <span className="text-[9px] uppercase tracking-wider text-[#A89684]">
                                {card.arcana}
                              </span>
                            </div>
                            <h4 className="text-sm font-serif font-medium text-[#201A15] mt-1">
                              {card.name}
                            </h4>
                          </div>

                          {/* Symbol center illustration placeholder */}
                          <div className="my-2 py-3 border-y border-[#EADBCA] flex flex-col items-center justify-center text-center">
                            <span className="text-2xl text-[#8E724F] font-serif mb-1">
                              {idx === 0 ? '☽' : idx === 1 ? '☉' : '✦'}
                            </span>
                            <span className="text-[9px] text-[#786754] italic font-serif leading-tight">
                              {card.keywords.slice(0, 2).join(' &bull; ')}
                            </span>
                          </div>

                          <p className="text-[10px] text-[#55483B] leading-snug line-clamp-3">
                            {card.uprightMeaning}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Synthesize Button when all revealed */}
            {allRevealed && !readingResult && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  disabled={isReading}
                  onClick={handleSynthesize}
                  className="px-6 py-3 rounded-full bg-[#1C1814] text-[#FAF7F2] text-xs font-medium tracking-wide hover:bg-[#342D26] cursor-pointer shadow-md inline-flex items-center gap-2"
                >
                  {isReading ? (
                    <>
                      <span className="animate-spin text-xs">✦</span>
                      <span>Consulting Archetypes...</span>
                    </>
                  ) : (
                    <>
                      <span>Synthesize 3-Card Reading</span>
                      <span className="font-serif">→</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reading Synthesis Output */}
        {readingResult && (
          <div className="mt-6 p-6 rounded-2xl bg-[#F5EDE1]/80 border border-[#DDCFBE] space-y-4 text-left animate-fade-in">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#866D50] font-semibold block mb-1">
                OVERARCHING THEME
              </span>
              <h3 className="text-lg font-serif italic text-[#251E17]">
                &ldquo;{readingResult.theme}&rdquo;
              </h3>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#DFD0BD]">
              <div>
                <span className="text-xs font-semibold text-[#29221B] block">
                  1. The Root ({readingResult.cards[0]?.name})
                </span>
                <p className="text-xs text-[#524436] leading-relaxed">
                  {readingResult.rootInterpretation}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#29221B] block">
                  2. The Crucible ({readingResult.cards[1]?.name})
                </span>
                <p className="text-xs text-[#524436] leading-relaxed">
                  {readingResult.crucibleInterpretation}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#29221B] block">
                  3. The Horizon ({readingResult.cards[2]?.name})
                </span>
                <p className="text-xs text-[#524436] leading-relaxed">
                  {readingResult.horizonInterpretation}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/70 border border-[#DECDBB]">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#866D50] block mb-1">
                CONTEMPLATIVE MANTRA
              </span>
              <p className="font-serif italic text-sm text-[#272018]">
                &ldquo;{readingResult.meditationMantra}&rdquo;
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-[#1C1814] text-[#FAF7F2] text-xs font-medium tracking-wide hover:bg-[#342D26] cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
