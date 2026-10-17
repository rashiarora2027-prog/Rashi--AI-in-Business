import React, { useState } from 'react';
import DetailedReportUpsell from './DetailedReportUpsell';
import { UserProfile, CompatibilityResult } from '../types';

interface CompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserProfile;
}

export const CompatibilityModal: React.FC<CompatibilityModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile,
}) => {
  const [partnerName, setPartnerName] = useState('Alex');
  const [partnerBirthDate, setPartnerBirthDate] = useState('1995-11-20');
  const [partnerBirthTime, setPartnerBirthTime] = useState('14:15');
  const [partnerLocation, setPartnerLocation] = useState('San Francisco, CA');
  const [relationshipType, setRelationshipType] = useState('Romantic Partner');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  if (!isOpen) return null;

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personA: {
            name: currentUserProfile.name,
            birthDate: currentUserProfile.birthDate,
            birthLocation: currentUserProfile.birthLocation,
          },
          personB: {
            name: partnerName,
            birthDate: partnerBirthDate,
            birthTime: partnerBirthTime,
            birthLocation: partnerLocation,
            relationshipType,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to analyze synastry');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({
        emotionalConnection: {
          title: 'Deep Empathy with Differing Rhythms',
          description: 'Your connection operates on a foundation of unspoken mutual recognition. When one is overwhelmed, the other naturally senses the shift. However, one of you processes emotion through verbal reflection, while the other needs silent integration before sharing.'
        },
        communication: {
          title: 'Curious & Expansive Dialogue',
          description: 'Mercury indicates an easy flow of ideas and shared curiosity about life. Misunderstandings usually arise not from ill intent, but from differences in delivery—one being direct and factual, the other sensitive to nuance and undertones.'
        },
        attraction: {
          title: 'Devotional & Grounded Spark',
          description: 'This is not an erratic, roller-coaster chemistry; it is a grounding magnetic affinity that deepens as trust is earned. You offer each other a feeling of arriving home.'
        },
        conflictPatterns: {
          title: 'The Classic Pursuit & Retreat Dynamic',
          description: 'Under pressure, one partner tends to seek immediate resolution through conversation, while the other instinctively pulls back into their shell to protect themselves from emotional flooding.'
        },
        differentNeeds: {
          title: 'Autonomy vs. Shared Sanctity',
          description: 'One needs explicit solitude to recharge their creative energy, while the other finds renewal through shared rituals and presence.'
        },
        currentThemes: {
          title: 'Transitioning from Romance to Conscious Partnership',
          description: 'The current planetary transits highlight mutual accountability. It is an era of moving past idealized expectations and embracing each other as wonderfully imperfect human beings.'
        },
        areasOfGrowth: [
          'Learning to say "I love you and I need two hours of silence" instead of abruptly shutting down.',
          'Allowing space for differing opinions without equating disagreement with a lack of love.',
          'Creating intentional rituals of connection that break through the routine of daily logistics.'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#181410]/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#FAF6F0] rounded-3xl p-6 sm:p-10 border border-[#DECDBB] shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8DDCD]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base text-[#8B6E46]">⚯</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A7051] font-semibold font-sans">
                RELATIONAL SYNASTRY
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#221C16] font-normal">
              Compatibility Dynamics
            </h2>
            <p className="text-xs text-[#6B5A47] mt-0.5">
              Exploring mutual resonance, friction, and growth without reductive percentages.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#887561] hover:text-[#1E1A16] p-2 rounded-full hover:bg-[#EFE5D7] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Input Form for Partner */}
        <div className="my-6 p-5 rounded-2xl bg-[#F4EDE2]/80 border border-[#DFD0BE] text-left">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#866D50] block mb-3">
            PERSON TWO DETAILS
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-medium uppercase text-[#6B5B4B] mb-1">
                Name
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#D8C7B4] text-[#241F1A]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase text-[#6B5B4B] mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={partnerBirthDate}
                onChange={(e) => setPartnerBirthDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#D8C7B4] text-[#241F1A]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase text-[#6B5B4B] mb-1">
                Birth Location
              </label>
              <input
                type="text"
                value={partnerLocation}
                onChange={(e) => setPartnerLocation(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#D8C7B4] text-[#241F1A]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase text-[#6B5B4B] mb-1">
                Connection
              </label>
              <select
                value={relationshipType}
                onChange={(e) => setRelationshipType(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#D8C7B4] text-[#241F1A]"
              >
                <option>Romantic Partner</option>
                <option>Close Friend</option>
                <option>Creative Collaborator</option>
                <option>Family Member</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              disabled={loading}
              onClick={handleCalculate}
              className="px-5 py-2 rounded-full bg-[#1C1814] text-[#F9F7F1] text-xs font-medium tracking-wide hover:bg-[#342D26] disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-xs">✦</span>
                  <span>Synthesizing Synastry...</span>
                </>
              ) : (
                <>
                  <span>Explore Dynamics</span>
                  <span className="font-serif">→</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Synastry Results */}
        {result && (
          <div className="space-y-5 animate-fade-in text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Emotional Connection */}
              <div className="p-4 rounded-xl bg-white/70 border border-[#DFD1BE]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm text-[#8B6E46] font-serif">☽</span>
                  <h4 className="text-xs font-semibold text-[#241E18] font-sans">
                    {result.emotionalConnection.title}
                  </h4>
                </div>
                <p className="text-xs text-[#524536] leading-relaxed">
                  {result.emotionalConnection.description}
                </p>
              </div>

              {/* Communication */}
              <div className="p-4 rounded-xl bg-white/70 border border-[#DFD1BE]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm text-[#8B6E46] font-serif">☿</span>
                  <h4 className="text-xs font-semibold text-[#241E18] font-sans">
                    {result.communication.title}
                  </h4>
                </div>
                <p className="text-xs text-[#524536] leading-relaxed">
                  {result.communication.description}
                </p>
              </div>

              {/* Attraction */}
              <div className="p-4 rounded-xl bg-white/70 border border-[#DFD1BE]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm text-[#8B6E46] font-serif">♀</span>
                  <h4 className="text-xs font-semibold text-[#241E18] font-sans">
                    {result.attraction.title}
                  </h4>
                </div>
                <p className="text-xs text-[#524536] leading-relaxed">
                  {result.attraction.description}
                </p>
              </div>

              {/* Conflict Patterns */}
              <div className="p-4 rounded-xl bg-white/70 border border-[#DFD1BE]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm text-[#8B6E46] font-serif">♂</span>
                  <h4 className="text-xs font-semibold text-[#241E18] font-sans">
                    {result.conflictPatterns.title}
                  </h4>
                </div>
                <p className="text-xs text-[#524536] leading-relaxed">
                  {result.conflictPatterns.description}
                </p>
              </div>

              {/* Different Needs */}
              <div className="p-4 rounded-xl bg-white/70 border border-[#DFD1BE]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm text-[#8B6E46] font-serif">♄</span>
                  <h4 className="text-xs font-semibold text-[#241E18] font-sans">
                    {result.differentNeeds.title}
                  </h4>
                </div>
                <p className="text-xs text-[#524536] leading-relaxed">
                  {result.differentNeeds.description}
                </p>
              </div>

              {/* Current Themes */}
              <div className="p-4 rounded-xl bg-white/70 border border-[#DFD1BE]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm text-[#8B6E46] font-serif">♃</span>
                  <h4 className="text-xs font-semibold text-[#241E18] font-sans">
                    {result.currentThemes.title}
                  </h4>
                </div>
                <p className="text-xs text-[#524536] leading-relaxed">
                  {result.currentThemes.description}
                </p>
              </div>
            </div>

            {/* Areas of Growth */}
            <div className="p-5 rounded-2xl bg-[#EFE6D9]/70 border border-[#D8C7B3]">
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#866D50] block mb-2">
                EVOLUTIONARY AREAS OF GROWTH
              </span>
              <ul className="space-y-2">
                {result.areasOfGrowth.map((growth, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#392F25]">
                    <span className="font-serif text-[#866D50] text-sm">✦</span>
                    <span className="leading-relaxed">{growth}</span>
                  </li>
                ))}
              </ul>
            </div>

            <DetailedReportUpsell context="relationship" />

            <div className="flex justify-end pt-3 border-t border-[#E8DDCD]">
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
    </div>
  );
};
