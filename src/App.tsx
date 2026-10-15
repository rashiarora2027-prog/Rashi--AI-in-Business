import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { CelestialWheel } from './components/CelestialWheel';
import { PlanetaryRow } from './components/PlanetaryRow';
import { FeelingQuickCard } from './components/FeelingQuickCard';
import { FeatureCardsRow } from './components/FeatureCardsRow';
import { CredibilityBanner } from './components/CredibilityBanner';
import { LunarRhythmIndicator } from './components/LunarRhythmIndicator';

// Interactive Modals
import { OnboardingModal } from './components/OnboardingModal';
import { WhyAmIFeelingThisModal } from './components/WhyAmIFeelingThisModal';
import { ImStuckModal } from './components/ImStuckModal';
import { CompatibilityModal } from './components/CompatibilityModal';
import { TarotModal } from './components/TarotModal';
import { MyPatternsModal } from './components/MyPatternsModal';
import { CompanionsModal } from './components/CompanionsModal';
import { BirthChartModal } from './components/BirthChartModal';
import { InfoModals } from './components/InfoModals';

import { UserProfile, QuickFeeling, SavedPattern } from './types';

const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Seeker',
  birthDate: '1996-05-14',
  birthTime: '08:30',
  birthLocation: 'San Francisco, CA',
  sunSign: 'Taurus',
  moonSign: 'Pisces',
  ascendant: 'Cancer',
  nakshatra: 'Revati',
  onboarded: false,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('patterns_user_profile');
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>(() => {
    try {
      const saved = localStorage.getItem('patterns_saved_entries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal visibility states
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isFeelingModalOpen, setIsFeelingModalOpen] = useState(false);
  const [isStuckModalOpen, setIsStuckModalOpen] = useState(false);
  const [isCompatibilityModalOpen, setIsCompatibilityModalOpen] = useState(false);
  const [isTarotModalOpen, setIsTarotModalOpen] = useState(false);
  const [isPatternsModalOpen, setIsPatternsModalOpen] = useState(false);
  const [isCompanionsModalOpen, setIsCompanionsModalOpen] = useState(false);
  const [isBirthChartModalOpen, setIsBirthChartModalOpen] = useState(false);
  
  // Info modal tab
  const [infoModalType, setInfoModalType] = useState<'explore' | 'about' | 'pricing' | 'faqs' | null>(null);

  // Quick feeling pass-through
  const [currentFeelingText, setCurrentFeelingText] = useState('');
  const [currentQuickState, setCurrentQuickState] = useState<QuickFeeling | undefined>(undefined);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('patterns_user_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Could not persist profile', e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('patterns_saved_entries', JSON.stringify(savedPatterns));
    } catch (e) {
      console.warn('Could not persist patterns', e);
    }
  }, [savedPatterns]);

  // Handle nav tab clicks
  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setInfoModalType(null);
    } else if (tab === 'explore' || tab === 'about' || tab === 'pricing' || tab === 'faqs') {
      setInfoModalType(tab as typeof infoModalType);
    }
  };

  // Start journey handler
  const handleStartNow = () => {
    setIsOnboardingOpen(true);
  };

  const handleOnboardingComplete = (profile: UserProfile, targetDestination?: string) => {
    setUserProfile(profile);
    setIsOnboardingOpen(false);

    if (targetDestination === 'feeling') {
      setIsFeelingModalOpen(true);
    } else if (targetDestination === 'stuck') {
      setIsStuckModalOpen(true);
    } else if (targetDestination === 'relationship') {
      setIsCompatibilityModalOpen(true);
    } else if (targetDestination === 'chart') {
      setIsBirthChartModalOpen(true);
    } else if (targetDestination === 'tarot') {
      setIsTarotModalOpen(true);
    }
  };

  // Quick card trigger
  const handleFeelingChosen = (feeling: QuickFeeling, customNote?: string) => {
    setCurrentQuickState(feeling);
    setCurrentFeelingText(customNote || `I am feeling ${feeling.toLowerCase()} today and wondering what cosmic rhythms might be illuminating this state.`);
    setIsFeelingModalOpen(true);
  };

  const handleDirectFeelingOpen = () => {
    setCurrentFeelingText('');
    setCurrentQuickState(undefined);
    setIsFeelingModalOpen(true);
  };

  const handleSavePattern = (pattern: SavedPattern) => {
    setSavedPatterns((prev) => [pattern, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#F6F2EB] text-[#24201B] flex flex-col justify-between selection:bg-[#E2D5C3] selection:text-[#1F1C18] relative overflow-x-hidden">
      
      {/* Top Background Delicate Celestial Elements */}
      {/* Subtle Ambient Sunburst Watermark */}
      <div className="absolute -top-16 -left-16 w-72 h-72 pointer-events-none opacity-15 select-none">
        <svg viewBox="0 0 200 200" className="w-full h-full fill-none stroke-[#8A7155] stroke-[0.8]">
          <circle cx="100" cy="100" r="80" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="60" />
          <circle cx="100" cy="100" r="40" strokeDasharray="2 2" />
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={i}
              x1="100"
              y1="100"
              x2={100 + 95 * Math.cos((i * 22.5 * Math.PI) / 180)}
              y2={100 + 95 * Math.sin((i * 22.5 * Math.PI) / 180)}
              stroke="#8A7155"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>

      {/* Delicate celestial ambient stars */}
      <div className="absolute top-8 right-12 text-[#9A8164] opacity-30 pointer-events-none select-none text-xs">✦</div>
      <div className="absolute top-24 right-32 text-[#9A8164] opacity-20 pointer-events-none select-none text-[10px]">✦</div>
      <div className="absolute top-16 left-1/3 text-[#9A8164] opacity-20 pointer-events-none select-none text-[9px]">✦</div>

      {/* 1. Header Navigation */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onStartNow={handleStartNow}
      />

      {/* Main Content Area */}
      <main className="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex-1 flex flex-col justify-center">
        
        {/* 2. Hero Section: 3-column panoramic layout matching reference image */}
        <section className="pt-3 pb-5 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Column: Headlines, CTA and Planetary Symbols (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-start text-left z-10">
            {/* Small Eyebrow */}
            <div className="flex items-center gap-1.5 text-xs tracking-[0.28em] font-sans font-semibold mb-2.5">
              <span className="text-[#3A3229]">SAME STARS.</span>
              <span className="text-[#967C5A]">A BRIGHTER YOU.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#1F1B16] font-normal leading-[1.08] tracking-tight mb-3.5">
              Understand<br />
              your patterns<span className="font-serif italic text-[#8B6E46]">.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-[#5C5042] font-sans max-w-md leading-relaxed mb-5 font-normal">
              Gain clarity, make sense of what you’re feeling, and navigate what’s next.
            </p>

            {/* Primary CTA Button */}
            <button
              type="button"
              onClick={handleStartNow}
              className="cursor-pointer px-7 py-3 rounded-full bg-[#181512] text-[#F9F7F1] text-sm font-medium tracking-wide transition-all duration-200 hover:bg-[#302821] hover:scale-[1.02] shadow-sm flex items-center gap-2.5"
            >
              <span>Start Your Journey</span>
              <span className="font-serif text-base">→</span>
            </button>

            {/* Major Planetary Symbols Row */}
            <PlanetaryRow />
          </div>

          {/* Center Column: Lunar Rhythm Indicator & The Large Celestial Zodiac Wheel (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center py-2 lg:py-0 z-10">
            {/* Interactive Lunar Rhythm Indicator positioned near the Zodiac Wheel */}
            <LunarRhythmIndicator
              onPhaseSelect={(phase) => {
                setCurrentFeelingText(`I am aligning with the ${phase.name} (${phase.sanskrit}) lunar phase: "${phase.theme}". Here is what is shifting in my life: `);
                setIsFeelingModalOpen(true);
              }}
            />

            {/* The Large Celestial Zodiac Wheel */}
            <CelestialWheel onSelectSign={(sign) => {
              setCurrentFeelingText(`I want to explore the archetype of ${sign} and what it is reflecting in my current life.`);
              setIsFeelingModalOpen(true);
            }} />
          </div>

          {/* Right Column: "How are you feeling today?" card, quote and cursive text (3 cols) */}
          <div className="lg:col-span-3 flex flex-col justify-center items-center lg:items-end z-10">
            <FeelingQuickCard
              onSelectFeeling={handleFeelingChosen}
              onOpenDirect={handleDirectFeelingOpen}
            />
          </div>
        </section>

        {/* 3. Feature Section: "More than a horoscope." with 4 cards */}
        <FeatureCardsRow
          onOpenBirthChart={() => setIsBirthChartModalOpen(true)}
          onOpenImStuck={() => setIsStuckModalOpen(true)}
          onOpenCompatibility={() => setIsCompatibilityModalOpen(true)}
          onOpenTarot={() => setIsTarotModalOpen(true)}
          onOpenPatterns={() => setIsPatternsModalOpen(true)}
          onOpenCompanions={() => setIsCompanionsModalOpen(true)}
        />
      </main>

      {/* 4. Bottom Credibility Banner & Classical Texts Illustration */}
      <CredibilityBanner onLearnMore={() => setInfoModalType('about')} />

      {/* ================= Interactive Modals ================= */}

      {/* Onboarding Flow ("What brings you here today?" + DOB / coordinates) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />

      {/* Main Core Feature: "Why am I feeling this way?" */}
      <WhyAmIFeelingThisModal
        isOpen={isFeelingModalOpen}
        onClose={() => setIsFeelingModalOpen(false)}
        userProfile={userProfile}
        initialFeelingText={currentFeelingText}
        initialQuickState={currentQuickState}
        onSavePattern={handleSavePattern}
      />

      {/* "I'm Stuck" Yes/No Decision Exploration */}
      <ImStuckModal
        isOpen={isStuckModalOpen}
        onClose={() => setIsStuckModalOpen(false)}
        onSavePattern={handleSavePattern}
      />

      {/* Multi-Dimensional Compatibility (No percentages) */}
      <CompatibilityModal
        isOpen={isCompatibilityModalOpen}
        onClose={() => setIsCompatibilityModalOpen(false)}
        currentUserProfile={userProfile}
      />

      {/* Reflective Tarot Room */}
      <TarotModal
        isOpen={isTarotModalOpen}
        onClose={() => setIsTarotModalOpen(false)}
      />

      {/* My Patterns Over Time */}
      <MyPatternsModal
        isOpen={isPatternsModalOpen}
        onClose={() => setIsPatternsModalOpen(false)}
        patterns={savedPatterns}
        userProfile={userProfile}
      />

      {/* Specialized AI Astrological Companions */}
      <CompanionsModal
        isOpen={isCompanionsModalOpen}
        onClose={() => setIsCompanionsModalOpen(false)}
        userProfile={userProfile}
      />

      {/* Birth Chart Explorer */}
      <BirthChartModal
        isOpen={isBirthChartModalOpen}
        onClose={() => setIsBirthChartModalOpen(false)}
        userProfile={userProfile}
      />

      {/* Info Modals (Explore, About, Pricing, FAQs) */}
      <InfoModals
        type={infoModalType}
        onClose={() => { setInfoModalType(null); setActiveTab('home'); }}
        onStartNow={() => { setInfoModalType(null); setIsOnboardingOpen(true); }}
      />
    </div>
  );
}
