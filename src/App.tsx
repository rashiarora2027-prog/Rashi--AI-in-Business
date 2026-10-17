import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { CelestialWheel } from './components/CelestialWheel';
import { PlanetaryRow } from './components/PlanetaryRow';
import { FeelingQuickCard } from './components/FeelingQuickCard';
import { FeatureCardsRow } from './components/FeatureCardsRow';
import WhyDifferent from './components/WhyDifferent';
import ClassicalTextsSection from './components/ClassicalTextsSection';
import CelestialBackdrop from './components/CelestialBackdrop';
import { DashaArcs, LunarColumn } from './components/AbstractMotifs';
import TextsPage from './components/TextsPage';
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

  // Hash routing for the classical-texts pages (#/texts, #/texts/<slug>).
  // Hash rather than a router: shareable URLs that survive a reload on a static
  // host, with nothing extra shipped to the browser.
  const [hash, setHash] = useState<string>(() =>
    typeof window === 'undefined' ? '' : window.location.hash
  );

  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const isTextsRoute = hash === '#/texts' || hash.startsWith('#/texts/');
  const textSlug = hash.startsWith('#/texts/') ? hash.slice('#/texts/'.length) : null;

  const goHome = () => {
    window.location.hash = '';
    setHash('');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

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
      <main className="w-full flex-1">
        {isTextsRoute ? (
          <TextsPage slug={textSlug} onHome={goHome} />
        ) : (
        <>

        {/* 2. Hero — one message, one action. The wheel is the only companion
            here on purpose: a second interactive card competing beside the CTA
            was splitting attention on first load. */}
        <section className="relative w-full min-h-[calc(100vh-96px)] flex items-center py-10 overflow-hidden">
          <CelestialBackdrop />
          <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

            {/* The message */}
            <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
              <div className="flex items-center gap-1.5 text-xs tracking-[0.28em] font-sans font-semibold mb-3">
                <span className="text-[#3A3229]">SAME STARS.</span>
                <span className="text-[#967C5A]">A BRIGHTER YOU.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#1F1B16] font-normal leading-[1.08] tracking-tight mb-4">
                Understand<br />
                your patterns<span className="font-serif italic text-[#8B6E46]">.</span>
              </h1>

              {/* What the app actually does, in two lines. */}
              <p className="text-base sm:text-lg text-[#4C4337] font-sans max-w-lg leading-relaxed mb-2.5">
                Tell us how you’re feeling. We read it against your real birth chart
                and show you the pattern underneath.
              </p>
              <p className="text-sm text-[#8A7B68] font-serif italic mb-7">
                Reflection, never prediction.
              </p>

              <button
                type="button"
                onClick={handleStartNow}
                className="cursor-pointer px-7 py-3.5 rounded-full bg-[#181512] text-[#F9F7F1] text-sm font-medium tracking-wide transition-all duration-200 hover:bg-[#302821] hover:scale-[1.02] shadow-sm flex items-center gap-2.5"
              >
                <span>Start Your Journey</span>
                <span className="font-serif text-base">→</span>
              </button>

              <PlanetaryRow />
            </div>

            {/* The visual */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center z-10">
              <CelestialWheel onSelectSign={(sign) => {
                setCurrentFeelingText(`I want to explore the archetype of ${sign} and what it is reflecting in my current life.`);
                setIsFeelingModalOpen(true);
              }} />
            </div>
          </div>
        </section>

        {/* 3. The feeling prompt, now a screen of its own rather than a card
            competing with the hero CTA. */}
        <section className="relative w-full border-t border-[#E7DCCB] overflow-hidden">
          {/* The card sits centred in a wide column, leaving two tall empty
              gutters. The Vimshottari cycle fills one and the lunar month the
              other — the two clocks a reading is actually told by. */}
          <DashaArcs className="hidden lg:block absolute left-[2%] xl:left-[5%] top-1/2 -translate-y-1/2 w-[250px] xl:w-[300px] opacity-[0.22]" />
          <LunarColumn className="hidden lg:block absolute right-[6%] xl:right-[9%] top-1/2 -translate-y-1/2 h-[62%] opacity-[0.17]" />

          <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-12 py-20 md:py-24">
            <div className="flex flex-col items-center text-center mb-9">
              <span className="text-[11px] uppercase tracking-[0.28em] text-[#937C63] font-semibold mb-3">
                WHERE A READING BEGINS
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-[#1F1B16] font-normal mb-3.5">
                How are you feeling today?
              </h2>
              <p className="text-sm sm:text-base text-[#5C5042] max-w-xl leading-relaxed">
                Start anywhere — a word, a mood, or a paragraph about the thing you keep
                circling. Your chart is read against that, not the other way round.
              </p>
            </div>

            {/* The lunar bar lives here now rather than in the hero: it is about
                mood and rhythm, which is what this section is asking about. */}
            <div className="flex justify-center mb-8">
              <LunarRhythmIndicator
                onPhaseSelect={(phase) => {
                  setCurrentFeelingText(`I am aligning with the ${phase.name} (${phase.sanskrit}) lunar phase: "${phase.theme}". Here is what is shifting in my life: `);
                  setIsFeelingModalOpen(true);
                }}
              />
            </div>

            <div className="flex justify-center">
              <FeelingQuickCard
                onSelectFeeling={handleFeelingChosen}
                onOpenDirect={handleDirectFeelingOpen}
              />
            </div>
          </div>
        </section>

        {/* 4. Positioning */}
        <WhyDifferent />

        {/* 5. The classical sources, each linking to its own page */}
        <ClassicalTextsSection />

        {/* 6. Feature Section: "More than a horoscope." with 4 cards */}
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 pb-6">
          <FeatureCardsRow
            onOpenBirthChart={() => setIsBirthChartModalOpen(true)}
            onOpenImStuck={() => setIsStuckModalOpen(true)}
            onOpenCompatibility={() => setIsCompatibilityModalOpen(true)}
            onOpenTarot={() => setIsTarotModalOpen(true)}
            onOpenPatterns={() => setIsPatternsModalOpen(true)}
            onOpenCompanions={() => setIsCompanionsModalOpen(true)}
          />
        </div>
        </>
        )}
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
