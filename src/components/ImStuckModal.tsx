import React, { useState } from 'react';
import { StuckQuestion, StuckAnalysisResult, SavedPattern } from '../types';

interface ImStuckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePattern: (pattern: SavedPattern) => void;
}

const STUCK_QUESTIONS: StuckQuestion[] = [
  {
    id: 1,
    question: 'Are you thinking about leaving your current job, relationship, or major commitment?',
    insight: 'Identifying whether the stuckness has a physical, external epicenter.'
  },
  {
    id: 2,
    question: 'Are you more afraid of leaving than you are of staying exactly where you are for another year?',
    insight: 'Measuring inertia versus the discomfort of familiar survival.'
  },
  {
    id: 3,
    question: 'Would you make this exact decision tomorrow if guaranteed that nobody would judge or question you?',
    insight: 'Separating your true instinct from the heavy burden of social approval.'
  },
  {
    id: 4,
    question: 'Are you waiting for a feeling of 100% certainty before you allow yourself to take the first step?',
    insight: 'Examining perfectionism as a subtle avoidance mechanism.'
  },
  {
    id: 5,
    question: 'Do you secretly wish someone else would make this choice for you so you wouldn’t be responsible for the outcome?',
    insight: 'Exploring the fear of agency and autonomy.'
  },
  {
    id: 6,
    question: 'If you listen to your body rather than your logical arguments, does your chest expand or contract when picturing the new path?',
    insight: 'Accessing somatic somatic intelligence beyond mental debate.'
  }
];

export const ImStuckModal: React.FC<ImStuckModalProps> = ({
  isOpen,
  onClose,
  onSavePattern,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: number; question: string; answer: 'Yes' | 'No' | 'Unsure' }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<StuckAnalysisResult | null>(null);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const currentQ = STUCK_QUESTIONS[currentIndex];

  const handleSelectAnswer = async (ans: 'Yes' | 'No' | 'Unsure') => {
    const updated = [...answers, { questionId: currentQ.id, question: currentQ.question, answer: ans }];
    setAnswers(updated);

    if (currentIndex < STUCK_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Analyze all answers
      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/stuck-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: updated }),
        });
        if (!res.ok) throw new Error('Failed to analyze');
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error(err);
        setResult({
          identifiedPatterns: [
            {
              title: 'The Paradox of External Permission',
              description: 'Your answers indicate that the path forward is already known to your deeper instinct, but you may be waiting for a social or familial sign-off that may never arrive.'
            },
            {
              title: 'The Cost of Familiar Friction',
              description: 'Staying in familiar friction often feels safer than the vulnerable emptiness of starting anew. This is not weakness; it is your nervous system seeking equilibrium.'
            }
          ],
          astrologicalResonance: 'In classic Vedic texts like Saravali, periods of being "stuck" often correspond with planetary thresholds—such as crossing into a new Nakshatra or the quiet stationing of Jupiter. You are experiencing the natural inertia that precedes structural realignment.',
          theCoreChoice: 'Are you choosing to stay because it is truly nourishing, or simply because you know how to survive the familiar ache?',
          gentleActions: [
            'Take a 48-hour moratorium on asking friends or family for their opinion on this matter.',
            'Spend 15 minutes writing the truth of what you want if guaranteed that nobody would judge you.',
            'Take one small, reversible action toward the new direction to test the waters without burning bridges.'
          ]
        });
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setResult(null);
    setSaved(false);
  };

  const handleSave = () => {
    if (!result) return;
    const pattern: SavedPattern = {
      id: `stuck-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: 'stuck',
      headline: result.identifiedPatterns[0]?.title || 'Decision Crossroads',
      summary: result.theCoreChoice,
      relevantPlanets: ['Saturn (Shani)', 'Jupiter (Guru)'],
      notes: result.gentleActions[0],
    };
    onSavePattern(pattern);
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#181410]/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FAF6F0] rounded-3xl p-6 sm:p-10 border border-[#DECDBB] shadow-2xl my-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DDCD]">
          <div className="flex items-center gap-2">
            <span className="text-lg text-[#856C47]">☾</span>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A7051] font-semibold block font-sans">
                GUIDED INQUIRY
              </span>
              <h2 className="text-xl sm:text-2xl font-serif text-[#221C16] font-normal">
                I’m Stuck
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#887561] hover:text-[#1E1A16] p-2 rounded-full hover:bg-[#EFE5D7] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content: Active Questions vs Analyzing vs Results */}
        {!result && !isAnalyzing && (
          <div className="py-6">
            {/* Progress bar */}
            <div className="flex items-center justify-between text-xs text-[#82715F] mb-3">
              <span className="font-serif italic">Question {currentIndex + 1} of {STUCK_QUESTIONS.length}</span>
              <span className="text-[11px] font-sans font-medium uppercase tracking-wider">
                {Math.round(((currentIndex) / STUCK_QUESTIONS.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#E8DDD0] rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-[#8E724F] transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / STUCK_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="p-8 rounded-2xl bg-[#F4EDE2]/80 border border-[#DFD0BE] text-center shadow-xs">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8E724F] font-semibold block mb-3">
                {currentQ.insight}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif text-[#201A14] font-normal leading-relaxed mb-8">
                &ldquo;{currentQ.question}&rdquo;
              </h3>

              {/* Three Choices: YES, NO, UNSURE */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => handleSelectAnswer('Yes')}
                  className="py-3 px-4 rounded-xl bg-white border border-[#D8C7B3] hover:border-[#8E724F] hover:bg-[#F9F5EE] text-[#221C16] font-medium text-sm transition-all shadow-xs cursor-pointer"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAnswer('No')}
                  className="py-3 px-4 rounded-xl bg-white border border-[#D8C7B3] hover:border-[#8E724F] hover:bg-[#F9F5EE] text-[#221C16] font-medium text-sm transition-all shadow-xs cursor-pointer"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAnswer('Unsure')}
                  className="py-3 px-4 rounded-xl bg-white border border-[#D8C7B3] hover:border-[#8E724F] hover:bg-[#F9F5EE] text-[#695A4B] font-medium text-sm transition-all shadow-xs cursor-pointer"
                >
                  Unsure
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-[#8A7762] italic font-serif mt-5">
              Answer from your first intuitive instinct without editing.
            </p>
          </div>
        )}

        {/* Analyzing Screen */}
        {isAnalyzing && (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#D8C6B1] border-t-[#8B6E46] animate-spin mx-auto flex items-center justify-center">
              <span className="text-xs text-[#8B6E46] font-serif">☾</span>
            </div>
            <h3 className="font-serif text-xl text-[#241E18]">
              Synthesizing your patterns...
            </h3>
            <p className="text-xs text-[#7A6956] max-w-sm mx-auto leading-relaxed">
              Unpacking the underlying psychological knot and mapping it against Saturnian and Jupiterian thresholds.
            </p>
          </div>
        )}

        {/* Results Screen */}
        {!isAnalyzing && result && (
          <div className="space-y-6 pt-4 animate-fade-in text-left">
            {/* Core Choice Banner */}
            <div className="p-6 rounded-2xl bg-[#F3ECE0] border border-[#DCCEBE]">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#886F4E] font-semibold block mb-1">
                THE ESSENTIAL INQUIRY
              </span>
              <p className="text-base sm:text-lg font-serif italic text-[#241E18] leading-relaxed">
                &ldquo;{result.theCoreChoice}&rdquo;
              </p>
            </div>

            {/* Identified Patterns */}
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#886F4E] font-semibold block mb-3">
                IDENTIFIED BEHAVIORAL PATTERNS
              </span>
              <div className="space-y-3">
                {result.identifiedPatterns.map((pat, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/70 border border-[#DFD1BF]">
                    <h4 className="text-xs font-semibold text-[#251E17] font-sans mb-1">
                      {pat.title}
                    </h4>
                    <p className="text-xs text-[#56493B] leading-relaxed">
                      {pat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Astrological Resonance */}
            <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E1D4C3]">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#866D50] block mb-1">
                ASTROLOGICAL THRESHOLD PRINCIPLES
              </span>
              <p className="text-xs text-[#4F4335] leading-relaxed">
                {result.astrologicalResonance}
              </p>
            </div>

            {/* Gentle Actions to Unstick */}
            <div className="p-5 rounded-2xl bg-[#EFE7DB]/70 border border-[#D9C8B5]">
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#866D50] block mb-2">
                THREE GENTLE EXPERIMENTS
              </span>
              <ul className="space-y-2">
                {result.gentleActions.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#392F25]">
                    <span className="font-serif text-[#866D50] text-sm">✦</span>
                    <span className="leading-relaxed">{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8DDCD]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saved}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide border transition-all cursor-pointer ${
                    saved
                      ? 'bg-[#E5D8C5] border-[#A8885B] text-[#221C16]'
                      : 'bg-white border-[#D6C5B1] text-[#473B2E] hover:bg-[#F7F1E8]'
                  }`}
                >
                  {saved ? '✓ Saved to Patterns' : '✦ Save to Patterns'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-[#756553] hover:text-black cursor-pointer underline underline-offset-4"
                >
                  Start Over
                </button>
              </div>

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
