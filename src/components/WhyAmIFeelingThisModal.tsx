import React, { useState, useEffect } from 'react';
import { UserProfile, FeelingInsightResult, SavedPattern, QuickFeeling } from '../types';
import DetailedReportModal from './DetailedReportModal';

interface WhyAmIFeelingThisModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  initialFeelingText?: string;
  initialQuickState?: QuickFeeling;
  onSavePattern: (pattern: SavedPattern) => void;
}

export const WhyAmIFeelingThisModal: React.FC<WhyAmIFeelingThisModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  initialFeelingText = '',
  initialQuickState,
  onSavePattern,
}) => {
  const [inputText, setInputText] = useState(initialFeelingText);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FeelingInsightResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);

  useEffect(() => {
    if (initialFeelingText) {
      setInputText(initialFeelingText);
      handleAnalyze(initialFeelingText);
    } else if (initialQuickState) {
      const prompt = `I am feeling ${initialQuickState.toLowerCase()} today and wondering what cosmic rhythms might be illuminating this state.`;
      setInputText(prompt);
      handleAnalyze(prompt);
    }
  }, [initialFeelingText, initialQuickState]);

  if (!isOpen) return null;

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = textToAnalyze || inputText;
    if (!text.trim()) return;

    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/feeling-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeling: text,
          quickState: initialQuickState,
          birthDetails: {
            date: userProfile.birthDate,
            time: userProfile.birthTime,
            location: userProfile.birthLocation,
          },
          name: userProfile.name,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch insight');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      // Fallback
      setResult({
        summary: `What you are experiencing—"${text}"—is an intelligible reflection of your current cosmic landscape rather than an arbitrary mood.`,
        cosmicContext: 'In classical Vedic texts like Brihat Parashara Hora Shastra, transits of Saturn and lunar shifts mark necessary periods of withdrawal so inner roots may recalibrate.',
        planetaryInfluences: [
          {
            planet: 'Saturn (Shani)',
            symbol: '♄',
            archetype: 'The Architect of Boundaries',
            description: 'Traditionally connected to introspection, maturation, and clarifying true priorities.'
          },
          {
            planet: 'Moon (Chandra)',
            symbol: '☽',
            archetype: 'The Tidal Heart',
            description: 'Reflecting your emotional rhythm and the need for replenishing solitude.'
          }
        ],
        affectedAreas: [
          {
            area: 'Social Boundaries',
            impact: 'A natural drop in tolerance for superficial conversation.',
            guidance: 'Honor the quiet without framing it as abandonment.'
          },
          {
            area: 'Creative Pace',
            impact: 'Gestation taking precedence over visible output.',
            guidance: 'Do not rush the bud before its bloom.'
          }
        ],
        whyItFeelsDifferent: 'Unlike transient fatigue, this cycle carries the weight of discernment. You are gently shedding outworn narratives of who you are expected to be.',
        timelineOfChange: 'As the lunar waxing cycle finishes and planetary aspects soften over the next 10–14 days, the dense interiority will naturally lift into actionable clarity.',
        reflectionThemes: [
          'What expectations am I carrying that belong to someone else?',
          'Where is stillness serving me better than explanation?',
          'What if this feeling is not a problem to solve, but a guest to hear?'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    const pattern: SavedPattern = {
      id: `feeling-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: 'feeling',
      headline: inputText.slice(0, 45) + (inputText.length > 45 ? '...' : ''),
      summary: result.summary,
      relevantPlanets: result.planetaryInfluences.map((p) => p.planet),
      notes: result.timelineOfChange,
    };
    onSavePattern(pattern);
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1A1612]/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#FAF6F0] rounded-3xl p-6 sm:p-10 border border-[#DECDBB] shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8DDCD]/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base text-[#8B704E]">☽</span>
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#8B704E] font-semibold font-sans">
                WHY AM I FEELING THIS?
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#221C16] font-normal">
              Astrological &amp; Archetypal Insight
            </h2>
            <p className="text-xs text-[#6B5B49] mt-0.5">
              Reflections for {userProfile.name} &bull; {userProfile.birthDate ? `Birth: ${userProfile.birthDate}` : 'General Transit Climate'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#887561] hover:text-[#1E1A16] p-2 rounded-full hover:bg-[#EFE5D7] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Input Field */}
        <div className="mt-6 mb-8">
          <label className="block text-xs font-serif italic text-[#473B2E] mb-2 text-base">
            &ldquo;Describe how you have been feeling lately...&rdquo;
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. I have been feeling disconnected from everyone for the last few weeks, second-guessing my career direction, and craving intense solitude..."
              className="w-full text-xs sm:text-sm p-4 rounded-2xl bg-white/80 border border-[#D8C7B3] text-[#241F1A] placeholder:text-[#A89885] focus:outline-none focus:border-[#967448] leading-relaxed shadow-xs"
            />
            <div className="flex justify-between items-center mt-2.5">
              <span className="text-[11px] text-[#86745F] italic font-serif">
                Astrology as self-discovery &bull; Non-deterministic reflection
              </span>
              <button
                type="button"
                disabled={loading || !inputText.trim()}
                onClick={() => handleAnalyze()}
                className="px-5 py-2 rounded-full bg-[#1C1814] text-[#F9F7F1] text-xs font-medium tracking-wide hover:bg-[#342D26] disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {loading ? (
                  <>
                    <span className="animate-spin text-xs">✦</span>
                    <span>Consulting Ephemeris...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Insight</span>
                    <span className="font-serif">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State Animation */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#D8C6B1] border-t-[#8B6E46] animate-spin flex items-center justify-center">
              <span className="text-xs text-[#8B6E46] font-serif">☉</span>
            </div>
            <p className="font-serif italic text-sm text-[#4E4132]">
              Mapping your subjective experience against classical planetary transits...
            </p>
            <p className="text-[11px] text-[#8B7863]">
              Referencing principles from Brihat Parashara Hora Shastra &amp; Saravali
            </p>
          </div>
        )}

        {/* Results Presentation */}
        {!loading && result && (
          <div className="space-y-6 pt-2 animate-fade-in text-left">
            {/* 1. Tender Validation Summary */}
            <div className="p-5 rounded-2xl bg-[#F4EDE2]/80 border border-[#DFD0BE]">
              <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-[#866D50] block mb-1">
                VALIDATION &amp; CONTEXT
              </span>
              <p className="text-sm sm:text-base font-serif text-[#29221B] leading-relaxed italic">
                &ldquo;{result.summary}&rdquo;
              </p>
              <p className="text-xs text-[#5C4F3F] mt-3 leading-relaxed">
                {result.cosmicContext}
              </p>
            </div>

            {/* 2. Planetary Influences */}
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#866D50] font-semibold block mb-3">
                PLANETARY FORCES IN RESONANCE
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {result.planetaryInfluences.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/70 border border-[#E0D2C1] shadow-xs flex items-start gap-3"
                  >
                    <span className="text-2xl text-[#8E714B] font-serif leading-none mt-0.5">
                      {p.symbol}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-[#251F19] font-sans">
                        {p.planet}
                      </h4>
                      <p className="text-[11px] text-[#8A7155] italic font-serif mb-1">
                        {p.archetype}
                      </p>
                      <p className="text-xs text-[#524637] leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Affected Life Spheres */}
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#866D50] font-semibold block mb-3">
                AREAS OF LIFE MOST AFFECTED
              </span>
              <div className="space-y-2.5">
                {result.affectedAreas.map((area, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F6EFE5]/70 border border-[#DFD1BF] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#282119] block">
                        {area.area}
                      </span>
                      <span className="text-xs text-[#594C3E]">
                        {area.impact}
                      </span>
                    </div>
                    <div className="sm:text-right sm:max-w-xs pl-3 border-l sm:border-l-0 border-[#DCCBB8]">
                      <span className="text-[10px] uppercase tracking-wider text-[#8A7155] block font-medium">
                        Gentle Practice:
                      </span>
                      <span className="text-xs text-[#44382B] italic font-serif">
                        {area.guidance}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Why It Feels Different & When It Changes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/60 border border-[#DECDBB]">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8B6E47] block mb-1">
                  WHY THIS PHASE FEELS DISTINCT
                </span>
                <p className="text-xs text-[#4D4133] leading-relaxed">
                  {result.whyItFeelsDifferent}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/60 border border-[#DECDBB]">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8B6E47] block mb-1">
                  TIMELINE OF EVOLUTION
                </span>
                <p className="text-xs text-[#4D4133] leading-relaxed">
                  {result.timelineOfChange}
                </p>
              </div>
            </div>

            {/* 5. Reflective Self-Inquiry Prompts */}
            <div className="p-5 rounded-2xl bg-[#F0E6D8]/60 border border-[#DAC8B4]">
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#846848] block mb-2">
                THEMES TO REFLECT UPON
              </span>
              <ul className="space-y-2">
                {result.reflectionThemes.map((theme, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-[#3A3025]">
                    <span className="text-[#846848] font-serif text-sm">✦</span>
                    <span className="font-serif italic leading-relaxed">{theme}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The hook.
                Deliberately not a cliffhanger. Withholding something ominous
                and charging to reveal it would be prediction dressed as a
                teaser, which is the one thing this product promises not to do
                — on the homepage, three times over. So the free reading stays
                whole and this offers depth on the same chart rather than the
                missing half of it. Saying so plainly is also what makes it
                worth buying: nobody resents paying for more of something that
                was already honest. */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#F6F2EB] border border-[#DECDBB]">
              <h4 className="font-serif text-lg sm:text-xl text-[#1F1B16] mb-2">
                The whole chart<span className="font-serif italic text-[#8B6E46]">,</span> not just this moment.
              </h4>
              <p className="text-xs sm:text-[13px] text-[#5C5042] leading-relaxed mb-4">
                What you have just read is complete in itself. The detailed reading goes further
                into the same chart — your Lagna, Moon and Sun one by one, the Dasha period you are
                running, four areas of life taken separately, and the months ahead.
              </p>
              <button
                type="button"
                onClick={() => setShowDetailed(true)}
                className="px-5 py-2.5 rounded-full bg-[#181512] text-[#F9F7F1] text-xs font-medium tracking-wide hover:bg-[#302821] transition-colors cursor-pointer"
              >
                Read the detailed report · ₹50
              </button>
            </div>

            {/* Action Bar: Save Pattern & Close */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8DDCD]">
              <button
                type="button"
                onClick={handleSave}
                disabled={saved}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide border transition-all flex items-center gap-1.5 cursor-pointer ${
                  saved
                    ? 'bg-[#E5D8C5] border-[#A8885B] text-[#221C16]'
                    : 'bg-white border-[#D6C5B1] text-[#473B2E] hover:bg-[#F7F1E8]'
                }`}
              >
                <span>{saved ? '✓ Saved to My Patterns' : '✦ Save to My Patterns'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-[#1C1814] text-[#FAF7F2] text-xs font-medium tracking-wide hover:bg-[#342D26] cursor-pointer"
              >
                Close &amp; Return
              </button>
            </div>
          </div>
        )}
      </div>

      <DetailedReportModal
        isOpen={showDetailed}
        onClose={() => setShowDetailed(false)}
        userProfile={userProfile}
        focusHint={inputText}
      />
    </div>
  );
};
