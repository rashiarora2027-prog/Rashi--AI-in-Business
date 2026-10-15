export interface UserProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  birthLocation: string;
  sunSign?: string;
  moonSign?: string;
  ascendant?: string;
  nakshatra?: string;
  pada?: number;
  currentDasha?: string;
  onboarded: boolean;
}

export type QuickFeeling = 
  | 'Curious'
  | 'Stuck'
  | 'Anxious'
  | 'Excited'
  | 'Overwhelmed'
  | 'Just exploring';

export interface PlanetaryInfluence {
  planet: string;
  symbol: string;
  archetype: string;
  description: string;
}

export interface AffectedArea {
  area: string;
  impact: string;
  guidance: string;
}

export interface FeelingInsightResult {
  summary: string;
  cosmicContext: string;
  planetaryInfluences: PlanetaryInfluence[];
  affectedAreas: AffectedArea[];
  whyItFeelsDifferent: string;
  timelineOfChange: string;
  reflectionThemes: string[];
}

export interface StuckQuestion {
  id: number;
  question: string;
  insight: string;
}

export interface StuckPattern {
  title: string;
  description: string;
}

export interface StuckAnalysisResult {
  identifiedPatterns: StuckPattern[];
  astrologicalResonance: string;
  theCoreChoice: string;
  gentleActions: string[];
}

export interface AspectDetail {
  title: string;
  description: string;
}

export interface CompatibilityResult {
  emotionalConnection: AspectDetail;
  communication: AspectDetail;
  attraction: AspectDetail;
  conflictPatterns: AspectDetail;
  differentNeeds: AspectDetail;
  currentThemes: AspectDetail;
  areasOfGrowth: string[];
}

export interface TarotCard {
  id: string;
  name: string;
  number: string;
  arcana: 'Major' | 'Minor';
  keywords: string[];
  description: string;
  uprightMeaning: string;
  symbolism: string;
}

export interface TarotReadingResult {
  theme: string;
  rootInterpretation: string;
  crucibleInterpretation: string;
  horizonInterpretation: string;
  syntheticGuidance: string;
  meditationMantra: string;
  cards: TarotCard[];
}

export interface SavedPattern {
  id: string;
  timestamp: string;
  type: 'feeling' | 'stuck' | 'tarot' | 'compatibility' | 'chart';
  headline: string;
  summary: string;
  relevantPlanets: string[];
  notes?: string;
}

export interface CompanionBot {
  id: 'personal-astrologer' | 'relationship-guide' | 'career-guide' | 'tarot-guide';
  name: string;
  title: string;
  tagline: string;
  description: string;
  symbol: string;
  initialGreeting: string;
  starterQuestions: string[];
}
