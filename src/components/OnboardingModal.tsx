import React, { useState } from 'react';
import { UserProfile } from '../types';
import { calculateFullKundali } from '../utils/astronomy';
import LocationAutocomplete from './LocationAutocomplete';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: UserProfile, targetDestination?: string) => void;
  initialIntent?: string;
}

const INTENT_OPTIONS = [
  { id: 'feeling', label: 'I want to understand how I’m feeling', icon: '☽' },
  { id: 'stuck', label: 'I’m stuck on a decision', icon: '⚖' },
  { id: 'relationship', label: 'I want to understand my relationship', icon: '⚯' },
  { id: 'chart', label: 'I want to explore my birth chart', icon: '☉' },
  { id: 'tarot', label: 'I want a Tarot reading', icon: '🂠' },
  { id: 'curious', label: 'I’m just curious', icon: '✦' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialIntent,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedIntent, setSelectedIntent] = useState<string>(initialIntent || 'feeling');
  
  // Birth Profile form fields
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('1996-05-14');
  const [birthTime, setBirthTime] = useState('08:30');
  const [birthLocation, setBirthLocation] = useState('');
  const [timeUnknown, setTimeUnknown] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      // Calculate real astronomical Vedic positions using astronomy-engine and Lahiri Ayanamsha
      let calculatedSun = 'Taurus';
      let calculatedMoon = 'Pisces';
      let calculatedAsc = 'Cancer';
      let calculatedNakshatra = 'Revati';
      let calculatedPada = 1;
      let calculatedDasha = 'Saturn / Mercury';

      try {
        const kundali = calculateFullKundali(
          birthDate,
          timeUnknown ? '12:00' : birthTime,
          birthLocation
        );
        calculatedSun = kundali.sun.sign;
        calculatedMoon = kundali.moon.sign;
        calculatedAsc = kundali.ascendant.sign;
        calculatedNakshatra = kundali.moon.nakshatra;
        calculatedPada = kundali.moon.pada;
        calculatedDasha = `${kundali.currentDasha.mahadasha} / ${kundali.currentDasha.antardasha}`;
      } catch (err) {
        console.warn('Astronomical calculation fallback:', err);
      }

      const profile: UserProfile = {
        name: name.trim() || 'Seeker',
        birthDate,
        birthTime: timeUnknown ? '12:00' : birthTime,
        birthLocation: birthLocation.trim(),
        sunSign: calculatedSun,
        moonSign: calculatedMoon,
        ascendant: calculatedAsc,
        nakshatra: calculatedNakshatra,
        pada: calculatedPada,
        currentDasha: calculatedDasha,
        onboarded: true,
      };
      onComplete(profile, selectedIntent);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1A16]/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E3D4C1] shadow-2xl overflow-hidden">
        {/* Decorative corner stars */}
        <div className="absolute top-4 right-4 text-[#C9B499] text-xs">✦</div>
        <div className="absolute bottom-4 left-4 text-[#C9B499] text-xs">✦</div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#1E1A16] text-[#FAF7F2] text-xs flex items-center justify-center font-serif">
              {step}
            </span>
            <span className="text-xs text-[#7F6E5A] font-medium tracking-wider uppercase font-sans">
              {step === 1 ? 'Intent' : 'Birth Details'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#8F7D6A] hover:text-[#1E1A16] text-sm p-1.5 rounded-full hover:bg-[#EFE7DC] transition-colors"
          >
            ✕
          </button>
        </div>

        {step === 1 ? (
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#937C63] font-semibold block mb-1">
              BEGIN YOUR JOURNEY
            </span>
            <h2 className="text-2xl font-serif text-[#221C16] font-normal mb-2">
              What brings you here today?
            </h2>
            <p className="text-xs text-[#6B5C4B] mb-5 leading-relaxed">
              Patterns adapts to your present crossroad. Choose the inquiry closest to your heart right now.
            </p>

            <div className="space-y-2.5 mb-6">
              {INTENT_OPTIONS.map((opt) => {
                const isSelected = selectedIntent === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedIntent(opt.id)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#F0E4D3] border-[#9E7D4E] text-[#1E1A16] shadow-xs'
                        : 'bg-[#FAF6F0] border-[#E3D6C5] hover:bg-[#F4ECE0] text-[#473B2E]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-[#846A45] font-serif w-6 text-center">
                        {opt.icon}
                      </span>
                      <span className="text-xs sm:text-sm font-medium">
                        {opt.label}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-xs text-[#846A45] font-serif">●</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full bg-[#1C1814] text-[#F8F5EE] text-xs sm:text-sm font-medium tracking-wide hover:bg-[#322A22] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <span className="font-serif">→</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#937C63] font-semibold block mb-1">
              CELESTIAL RECKONING
            </span>
            <h2 className="text-2xl font-serif text-[#221C16] font-normal mb-2">
              Your birth moment.
            </h2>
            <p className="text-xs text-[#6B5C4B] mb-5 leading-relaxed">
              Vedic astrology uses your exact coordinates to map planetary placements, rising signs (Lagna), and Moon nakshatras.
            </p>

            <div className="space-y-3.5 mb-6 text-left">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6F5F4E] mb-1">
                  Your First Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya, Julian, Claire..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#DACBB8] text-[#241F1A] placeholder:text-[#A49483] focus:outline-none focus:border-[#967448]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6F5F4E] mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#DACBB8] text-[#241F1A] focus:outline-none focus:border-[#967448]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6F5F4E]">
                      Exact Time
                    </label>
                    <label className="text-[10px] text-[#86735E] flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={timeUnknown}
                        onChange={(e) => setTimeUnknown(e.target.checked)}
                        className="rounded accent-[#886940]"
                      />
                      <span>Time unknown</span>
                    </label>
                  </div>
                  <input
                    type="time"
                    disabled={timeUnknown}
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#DACBB8] text-[#241F1A] disabled:opacity-40 focus:outline-none focus:border-[#967448]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6F5F4E] mb-1">
                  Birth Location
                </label>
                <LocationAutocomplete
                  value={birthLocation}
                  onChange={setBirthLocation}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[#7F6E5A] hover:text-black cursor-pointer underline underline-offset-4"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full bg-[#1C1814] text-[#F8F5EE] text-xs sm:text-sm font-medium tracking-wide hover:bg-[#322A22] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Enter Patterns</span>
                <span className="font-serif">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
