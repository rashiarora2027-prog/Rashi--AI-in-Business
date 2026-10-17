import * as Astronomy from 'astronomy-engine';
import { localBirthToUtc } from './timezone.ts';

export interface CelestialPosition {
  name: string;
  sanskritName: string;
  symbol: string;
  tropicalDegree: number;
  siderealDegree: number;
  sign: string;
  signSanskrit: string;
  signIndex: number; // 0 = Aries, 11 = Pisces
  degreeInSign: number; // 0 to 29.999
  formattedDegree: string;
  nakshatra: string;
  nakshatraSanskrit: string;
  nakshatraIndex: number;
  nakshatraLord: string;
  nakshatraDeity: string;
  pada: number; // 1, 2, 3, 4
  isRetrograde?: boolean;
  speed?: number; // degrees per day
}

export interface DashaPeriod {
  planet: string;
  planetSanskrit: string;
  symbol: string;
  years: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  antardashas?: {
    planet: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }[];
}

export interface KundaliChartData {
  ayanamsa: {
    name: string;
    valueDegrees: number;
    formatted: string;
  };
  ascendant: CelestialPosition;
  sun: CelestialPosition;
  moon: CelestialPosition;
  planets: Record<string, CelestialPosition>;
  currentDasha: {
    mahadasha: string;
    antardasha: string;
    startDate: string;
    endDate: string;
  };
  dashaTimeline: DashaPeriod[];
  currentTransits: Record<string, CelestialPosition>;
  calculationTimestamp: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
    /** False when the place could not be matched and defaults were used. */
    resolved: boolean;
  };
}

// 12 Zodiac signs in order
export const ZODIAC_SIGNS = [
  { english: 'Aries', sanskrit: 'Mesha', symbol: '♈', element: 'Fire', ruler: 'Mars' },
  { english: 'Taurus', sanskrit: 'Vrishabha', symbol: '♉', element: 'Earth', ruler: 'Venus' },
  { english: 'Gemini', sanskrit: 'Mithuna', symbol: '♊', element: 'Air', ruler: 'Mercury' },
  { english: 'Cancer', sanskrit: 'Karka', symbol: '♋', element: 'Water', ruler: 'Moon' },
  { english: 'Leo', sanskrit: 'Simha', symbol: '♌', element: 'Fire', ruler: 'Sun' },
  { english: 'Virgo', sanskrit: 'Kanya', symbol: '♍', element: 'Earth', ruler: 'Mercury' },
  { english: 'Libra', sanskrit: 'Tula', symbol: '♎', element: 'Air', ruler: 'Venus' },
  { english: 'Scorpio', sanskrit: 'Vrishchika', symbol: '♏', element: 'Water', ruler: 'Mars' },
  { english: 'Sagittarius', sanskrit: 'Dhanu', symbol: '♐', element: 'Fire', ruler: 'Jupiter' },
  { english: 'Capricorn', sanskrit: 'Makara', symbol: '♑', element: 'Earth', ruler: 'Saturn' },
  { english: 'Aquarius', sanskrit: 'Kumbha', symbol: '♒', element: 'Air', ruler: 'Saturn' },
  { english: 'Pisces', sanskrit: 'Meena', symbol: '♓', element: 'Water', ruler: 'Jupiter' },
];

// 27 Nakshatras (Lunar Mansions) in Vedic Astronomy (13°20' each)
export const NAKSHATRAS = [
  { name: 'Ashwini', sanskrit: 'अश्विनी', lord: 'Ketu', deity: 'Ashwini Kumaras (Divine Healers)' },
  { name: 'Bharani', sanskrit: 'भरणी', lord: 'Venus', deity: 'Yama (God of Transformation & Truth)' },
  { name: 'Krittika', sanskrit: 'कृत्तिका', lord: 'Sun', deity: 'Agni (Sacred Fire)' },
  { name: 'Rohini', sanskrit: 'रोहिणी', lord: 'Moon', deity: 'Brahma / Prajapati (Creation & Beauty)' },
  { name: 'Mrigashira', sanskrit: 'मृगशिरा', lord: 'Mars', deity: 'Soma (Nectar of Seeking)' },
  { name: 'Ardra', sanskrit: 'आर्द्रा', lord: 'Rahu', deity: 'Rudra (Storm & Breakthrough)' },
  { name: 'Punarvasu', sanskrit: 'पुनर्वसु', lord: 'Jupiter', deity: 'Aditi (Cosmic Mother of Light)' },
  { name: 'Pushya', sanskrit: 'पुष्य', lord: 'Saturn', deity: 'Brihaspati (Supreme Spiritual Nourishment)' },
  { name: 'Ashlesha', sanskrit: 'आश्लेषा', lord: 'Mercury', deity: 'Nagas (Serpent Wisdom & Kundalini)' },
  { name: 'Magha', sanskrit: 'मघा', lord: 'Ketu', deity: 'Pitris (Ancestral Authority & Lineage)' },
  { name: 'Purva Phalguni', sanskrit: 'पूर्वा फाल्गुनी', lord: 'Venus', deity: 'Bhaga (Delight & Union)' },
  { name: 'Uttara Phalguni', sanskrit: 'उत्तरा फाल्गुनी', lord: 'Sun', deity: 'Aryaman (Honor & Lasting Vows)' },
  { name: 'Hasta', sanskrit: 'हस्त', lord: 'Moon', deity: 'Savitr (The Golden Hand of Skill)' },
  { name: 'Chitra', sanskrit: 'चित्रा', lord: 'Mars', deity: 'Tvashtar (The Celestial Architect)' },
  { name: 'Swati', sanskrit: 'स्वाति', lord: 'Rahu', deity: 'Vayu (Wind of Independent Freedom)' },
  { name: 'Vishakha', sanskrit: 'विशाखा', lord: 'Jupiter', deity: 'Indra & Agni (Triumphant Focus)' },
  { name: 'Anuradha', sanskrit: 'अनुराधा', lord: 'Saturn', deity: 'Mitra (Devotion & Friendship)' },
  { name: 'Jyeshtha', sanskrit: 'ज्येष्ठा', lord: 'Mercury', deity: 'Indra (Sovereignty & Eldership)' },
  { name: 'Mula', sanskrit: 'मूल', lord: 'Ketu', deity: 'Nirriti (Root Investigation & Release)' },
  { name: 'Purva Ashadha', sanskrit: 'पूर्वाषाढा', lord: 'Venus', deity: 'Apas (Invincible Flow of Waters)' },
  { name: 'Uttara Ashadha', sanskrit: 'उत्तराषाढा', lord: 'Sun', deity: 'Vishwadevas (Universal Virtues)' },
  { name: 'Shravana', sanskrit: 'श्रवण', lord: 'Moon', deity: 'Vishnu (Attuned Listening & Wisdom)' },
  { name: 'Dhanishta', sanskrit: 'धनिष्ठा', lord: 'Mars', deity: 'Ashta Vasus (Rhythm & Abundance)' },
  { name: 'Shatabhisha', sanskrit: 'शतभिषा', lord: 'Rahu', deity: 'Varuna (The 100 Physicians & Mystery)' },
  { name: 'Purva Bhadrapada', sanskrit: 'पूर्व भाद्रपदा', lord: 'Jupiter', deity: 'Aja Ekapada (Fire of Contemplation)' },
  { name: 'Uttara Bhadrapada', sanskrit: 'उत्तर भाद्रपदा', lord: 'Saturn', deity: 'Ahirbudhnya (Deep Ocean of Stillness)' },
  { name: 'Revati', sanskrit: 'रेवती', lord: 'Mercury', deity: 'Pushan (The Nurturing Guide of Souls)' },
];

// Vimshottari Dasha system periods (120 years total)
export const VIMSHOTTARI_DASHA_CYCLE = [
  { planet: 'Ketu', sanskrit: 'केतु', symbol: '☋', years: 7 },
  { planet: 'Venus', sanskrit: 'शुक्र (Shukra)', symbol: '♀', years: 20 },
  { planet: 'Sun', sanskrit: 'सूर्य (Surya)', symbol: '☉', years: 6 },
  { planet: 'Moon', sanskrit: 'चन्द्र (Chandra)', symbol: '☽', years: 10 },
  { planet: 'Mars', sanskrit: 'मंगल (Mangala)', symbol: '♂', years: 7 },
  { planet: 'Rahu', sanskrit: 'राहु', symbol: '☊', years: 18 },
  { planet: 'Jupiter', sanskrit: 'बृहस्पति (Guru)', symbol: '♃', years: 16 },
  { planet: 'Saturn', sanskrit: 'शनि (Shani)', symbol: '♄', years: 19 },
  { planet: 'Mercury', sanskrit: 'बुध (Budha)', symbol: '☿', years: 17 },
];

/**
 * Calculates official Lahiri (Chitrapaksha) Ayanamsa for any date.
 * Base standard: On Jan 1, 2000 (J2000.0), Lahiri Ayanamsha was 23° 51' 25.53" (23.857092°).
 * Annual precession rate: 50.290966 arcseconds / year (0.01396971° / year).
 */
export function getLahiriAyanamsa(date: Date): number {
  const epoch2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0)).getTime();
  const diffDays = (date.getTime() - epoch2000) / (1000 * 60 * 60 * 24);
  const diffYears = diffDays / 365.24219;
  return 23.857092 + diffYears * (50.290966 / 3600);
}

/**
 * Formats degrees decimal to degrees and arcminutes (e.g., 14° 32')
 */
export function formatDegreesMinutes(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  const d = Math.floor(normalized);
  const m = Math.floor((normalized - d) * 60);
  return `${d}° ${m < 10 ? '0' : ''}${m}'`;
}

/**
 * Given a sidereal ecliptic longitude (0-360), computes sign, degree within sign, nakshatra, and pada.
 */
export function getSiderealPositionDetails(
  siderealDegree: number,
  tropicalDegree: number,
  planetName: string,
  sanskritName: string,
  symbol: string,
  isRetrograde = false,
  speed = 0
): CelestialPosition {
  const normSidereal = ((siderealDegree % 360) + 360) % 360;
  const signIndex = Math.floor(normSidereal / 30);
  const degreeInSign = normSidereal % 30;
  const sign = ZODIAC_SIGNS[signIndex];

  // Nakshatra: each is 360 / 27 = 13.3333333° (13° 20')
  const nakshatraSpan = 360 / 27; // 13.333333333 degrees
  const nakshatraIndex = Math.floor(normSidereal / nakshatraSpan);
  const nakshatraObj = NAKSHATRAS[nakshatraIndex % 27];

  // Pada: each nakshatra has 4 padas of 3° 20' (3.333333° each)
  const degreeInNakshatra = normSidereal - nakshatraIndex * nakshatraSpan;
  const pada = Math.min(4, Math.floor(degreeInNakshatra / (nakshatraSpan / 4)) + 1);

  return {
    name: planetName,
    sanskritName,
    symbol,
    tropicalDegree,
    siderealDegree: normSidereal,
    sign: sign.english,
    signSanskrit: sign.sanskrit,
    signIndex,
    degreeInSign,
    formattedDegree: formatDegreesMinutes(degreeInSign),
    nakshatra: nakshatraObj.name,
    nakshatraSanskrit: nakshatraObj.sanskrit,
    nakshatraIndex,
    nakshatraLord: nakshatraObj.lord,
    nakshatraDeity: nakshatraObj.deity,
    pada,
    isRetrograde,
    speed,
  };
}

/**
 * Calculates accurate True / Mean Lunar Node (Rahu and Ketu).
 * Uses high-precision formula for the lunar ascending node.
 */
export function getLunarNodes(time: Astronomy.AstroTime, ayanamsa: number): { rahu: CelestialPosition; ketu: CelestialPosition } {
  // Astronomical formula for the Mean Ascending Node of the Moon (J2000 based)
  const T = (time.tt - 0) / 36525.0; // centuries since J2000
  // Ω = 125.04452 - 1934.136261 * T + 0.0020708 * T^2 + T^3 / 450000
  let nodeLongitude = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  nodeLongitude = ((nodeLongitude % 360) + 360) % 360;

  const siderealRahu = ((nodeLongitude - ayanamsa) % 360 + 360) % 360;
  const siderealKetu = ((siderealRahu + 180) % 360 + 360) % 360;
  const tropicalKetu = ((nodeLongitude + 180) % 360 + 360) % 360;

  const rahu = getSiderealPositionDetails(siderealRahu, nodeLongitude, 'North Node (Rahu)', 'राहु', '☊', true, -0.0529);
  const ketu = getSiderealPositionDetails(siderealKetu, tropicalKetu, 'South Node (Ketu)', 'केतु', '☋', true, -0.0529);

  return { rahu, ketu };
}

/**
 * Calculates precise Lagna (Ascendant / Rising Sign)
 * Uses Local Sidereal Time (LST) and geographic latitude/longitude.
 */
export function calculateAscendant(
  date: Date,
  latitude: number,
  longitude: number,
  ayanamsa: number
): CelestialPosition {
  const astroTime = Astronomy.MakeTime(date);
  // Greenwich Apparent Sidereal Time in hours
  const gastHours = Astronomy.SiderealTime(astroTime);
  // Local Sidereal Time in degrees
  let lstDegrees = (gastHours * 15.0 + longitude) % 360;
  if (lstDegrees < 0) lstDegrees += 360;

  const lstRad = (lstDegrees * Math.PI) / 180.0;
  const latRad = (latitude * Math.PI) / 180.0;

  // True Obliquity of the Ecliptic (approx 23.439 degrees)
  const eps = 23.4392911 * (Math.PI / 180.0);

  // Ascendant formula in celestial sphere:
  // tan(asc) = -cos(LST) / (sin(eps)*tan(lat) + cos(eps)*sin(LST))
  const y = -Math.cos(lstRad);
  const x = Math.sin(eps) * Math.tan(latRad) + Math.cos(eps) * Math.sin(lstRad);
  let ascTropical = (Math.atan2(y, x) * 180.0) / Math.PI;
  if (ascTropical < 0) ascTropical += 360;

  // Convert to Sidereal Lagna using Lahiri Ayanamsha
  let ascSidereal = (ascTropical - ayanamsa) % 360;
  if (ascSidereal < 0) ascSidereal += 360;

  return getSiderealPositionDetails(
    ascSidereal,
    ascTropical,
    'Lagna (Rising Sign)',
    'लग्न (Lagna)',
    'ASC'
  );
}

/**
 * Computes the complete Vimshottari Dasha timeline and currently running periods based on natal Moon longitude.
 */
export function calculateVimshottariDasha(
  natalMoonSiderealDeg: number,
  birthDate: Date,
  currentDate: Date = new Date()
): {
  currentDasha: { mahadasha: string; antardasha: string; startDate: string; endDate: string };
  timeline: DashaPeriod[];
} {
  const nakshatraSpan = 360 / 27; // 13° 20' = 13.333333°
  const nakshatraIndex = Math.floor(natalMoonSiderealDeg / nakshatraSpan) % 27;
  const degInNakshatra = natalMoonSiderealDeg % nakshatraSpan;

  // The 27 nakshatras cycle through the 9 planetary lords starting with Ketu
  // Index 0 (Ashwini) is ruled by Ketu (index 0 in VIMSHOTTARI_DASHA_CYCLE)
  const startingLordIndex = nakshatraIndex % 9;
  const startingLord = VIMSHOTTARI_DASHA_CYCLE[startingLordIndex];

  // Fraction of nakshatra already elapsed vs remaining
  const fractionElapsed = degInNakshatra / nakshatraSpan;
  const fractionRemaining = 1 - fractionElapsed;

  // Balance of birth dasha remaining in years
  const balanceYears = startingLord.years * fractionRemaining;

  const timeline: DashaPeriod[] = [];
  let periodStart = new Date(birthDate.getTime());

  // Loop through dashas for 120 years
  let currentActive = {
    mahadasha: startingLord.planet,
    antardasha: startingLord.planet,
    startDate: '',
    endDate: '',
  };

  const nowMs = currentDate.getTime();

  for (let i = 0; i < 9; i++) {
    const cycleIdx = (startingLordIndex + i) % 9;
    const planetData = VIMSHOTTARI_DASHA_CYCLE[cycleIdx];
    const durationYears = i === 0 ? balanceYears : planetData.years;

    const periodEndMs = periodStart.getTime() + durationYears * 365.25 * 24 * 60 * 60 * 1000;
    const periodEnd = new Date(periodEndMs);

    const isCurrent = nowMs >= periodStart.getTime() && nowMs < periodEnd.getTime();

    // Calculate Antardashas (sub-periods)
    const antardashas: { planet: string; startDate: string; endDate: string; isCurrent: boolean }[] = [];
    let subStart = new Date(periodStart.getTime());

    for (let j = 0; j < 9; j++) {
      const subIdx = (cycleIdx + j) % 9;
      const subPlanet = VIMSHOTTARI_DASHA_CYCLE[subIdx];
      // Proportion: (Mahadasha Years * Antardasha Years) / 120
      const subDurationYears = (durationYears * subPlanet.years) / 120;
      const subEndMs = subStart.getTime() + subDurationYears * 365.25 * 24 * 60 * 60 * 1000;
      const subEnd = new Date(subEndMs);

      const isSubCurrent = nowMs >= subStart.getTime() && nowMs < subEnd.getTime();
      if (isSubCurrent) {
        currentActive = {
          mahadasha: planetData.planet,
          antardasha: subPlanet.planet,
          startDate: subStart.toISOString().split('T')[0],
          endDate: subEnd.toISOString().split('T')[0],
        };
      }

      antardashas.push({
        planet: subPlanet.planet,
        startDate: subStart.toISOString().split('T')[0],
        endDate: subEnd.toISOString().split('T')[0],
        isCurrent: isSubCurrent,
      });

      subStart = subEnd;
    }

    timeline.push({
      planet: planetData.planet,
      planetSanskrit: planetData.sanskrit,
      symbol: planetData.symbol,
      years: durationYears,
      startDate: periodStart.toISOString().split('T')[0],
      endDate: periodEnd.toISOString().split('T')[0],
      isCurrent,
      antardashas,
    });

    periodStart = periodEnd;
  }

  return { currentDasha: currentActive, timeline };
}

/**
 * Calculates exact planetary positions (Tropical and Sidereal) using Astronomy Engine.
 */
export function calculatePlanetaryPositions(date: Date, ayanamsa: number): Record<string, CelestialPosition> {
  const time = Astronomy.MakeTime(date);
  const result: Record<string, CelestialPosition> = {};

  const bodies = [
    { id: Astronomy.Body.Sun, name: 'Sun', sanskrit: 'सूर्य (Surya)', symbol: '☉' },
    { id: Astronomy.Body.Moon, name: 'Moon', sanskrit: 'चन्द्र (Chandra)', symbol: '☽' },
    { id: Astronomy.Body.Mercury, name: 'Mercury', sanskrit: 'बुध (Budha)', symbol: '☿' },
    { id: Astronomy.Body.Venus, name: 'Venus', sanskrit: 'शुक्र (Shukra)', symbol: '♀' },
    { id: Astronomy.Body.Mars, name: 'Mars', sanskrit: 'मंगल (Mangala)', symbol: '♂' },
    { id: Astronomy.Body.Jupiter, name: 'Jupiter', sanskrit: 'बृहस्पति (Guru)', symbol: '♃' },
    { id: Astronomy.Body.Saturn, name: 'Saturn', sanskrit: 'शनि (Shani)', symbol: '♄' },
    { id: Astronomy.Body.Uranus, name: 'Uranus', sanskrit: 'अरुण (Uranus)', symbol: '♅' },
    { id: Astronomy.Body.Neptune, name: 'Neptune', sanskrit: 'वरुण (Neptune)', symbol: '♆' },
    { id: Astronomy.Body.Pluto, name: 'Pluto', sanskrit: 'यम (Pluto)', symbol: '♇' },
  ];

  for (const b of bodies) {
    // Geocentric ecliptic vector
    const vec = Astronomy.GeoVector(b.id, time, true);
    const ecl = Astronomy.Ecliptic(vec);
    const tropicalDeg = ecl.elon; // ecliptic longitude in degrees 0-360

    // Compute speed to detect retrograde motion (check position 1 hour later)
    const timeDelta = Astronomy.MakeTime(new Date(date.getTime() + 3600 * 1000));
    const vecDelta = Astronomy.GeoVector(b.id, timeDelta, true);
    const eclDelta = Astronomy.Ecliptic(vecDelta);
    let speedDegPerDay = (eclDelta.elon - tropicalDeg) * 24.0;
    // Normalize jump across 0/360
    if (speedDegPerDay > 180) speedDegPerDay -= 360;
    if (speedDegPerDay < -180) speedDegPerDay += 360;
    const isRetrograde = speedDegPerDay < 0;

    // Convert to sidereal via Lahiri Ayanamsha
    let siderealDeg = (tropicalDeg - ayanamsa) % 360;
    if (siderealDeg < 0) siderealDeg += 360;

    result[b.name.toLowerCase()] = getSiderealPositionDetails(
      siderealDeg,
      tropicalDeg,
      b.name,
      b.sanskrit,
      b.symbol,
      isRetrograde,
      speedDegPerDay
    );
  }

  // Add True / Mean Lunar Nodes (Rahu and Ketu)
  const { rahu, ketu } = getLunarNodes(time, ayanamsa);
  result['rahu'] = rahu;
  result['ketu'] = ketu;

  return result;
}

type ResolvedCity = {
  label: string;
  lat: number;
  lon: number;
  timezone: string;
};

/**
 * The city lookup is injected rather than imported.
 *
 * The dataset is a few hundred KB. Importing it here would pull it into the
 * main browser bundle for every visitor, including those who never open a
 * chart. Instead the browser loads it on demand (see utils/loadCities) and the
 * server loads it at startup, and each registers the resolver through here.
 *
 * If nothing has registered, resolveLocation reports `resolved: false` and the
 * UI shows that the place was not matched — the one thing it must never do is
 * silently chart someone at default coordinates.
 */
let cityResolver: ((locationStr: string) => ResolvedCity | null) | null = null;

export function setCityResolver(fn: (locationStr: string) => ResolvedCity | null): void {
  cityResolver = fn;
}

/**
 * Resolves a location string to coordinates and timezone.
 *
 * Backed by the full city dataset, not a short hardcoded list. When a place
 * genuinely cannot be found we say so via `resolved: false` rather than
 * quietly substituting a default city — a chart computed at the wrong
 * coordinates looks just as confident as a correct one, which is the worst
 * possible failure for this app.
 */
export function resolveLocation(locationStr: string): {
  name: string;
  lat: number;
  lon: number;
  timezone: string;
  resolved: boolean;
} {
  const fallback = {
    name: locationStr || 'Unknown location',
    lat: 28.6139,
    lon: 77.209,
    timezone: 'Asia/Kolkata',
    resolved: false,
  };

  if (!locationStr) return fallback;

  const city = cityResolver ? cityResolver(locationStr) : null;
  if (!city) return fallback;

  return {
    name: city.label,
    lat: city.lat,
    lon: city.lon,
    timezone: city.timezone,
    resolved: true,
  };
}

/**
 * Main Orchestrator: Computes complete authentic Kundali natal chart and real-time transits.
 * 100% Free, zero-external-cost, mathematically precise.
 */
export function calculateFullKundali(
  birthDateStr: string, // 'YYYY-MM-DD'
  birthTimeStr: string, // 'HH:MM'
  locationStr: string
): KundaliChartData {
  const loc = resolveLocation(locationStr);
  const [year, month, day] = birthDateStr.split('-').map(Number);
  const [hours, minutes] = (birthTimeStr || '12:00').split(':').map(Number);

  // Convert the stated local birth time into the matching UTC instant using the
  // birthplace's timezone. Skipping this shifts the Lagna by the UTC offset —
  // about two and a half signs for an Indian birth.
  const birthDate = localBirthToUtc(
    year,
    month || 1,
    day || 1,
    hours === undefined || Number.isNaN(hours) ? 12 : hours,
    minutes === undefined || Number.isNaN(minutes) ? 0 : minutes,
    loc.timezone
  );

  // Compute Ayanamsha for birth date
  const birthAyanamsa = getLahiriAyanamsa(birthDate);

  // Compute Ascendant / Lagna
  const ascendant = calculateAscendant(birthDate, loc.lat, loc.lon, birthAyanamsa);

  // Compute Natal Planets
  const natalPlanets = calculatePlanetaryPositions(birthDate, birthAyanamsa);
  const sun = natalPlanets['sun'];
  const moon = natalPlanets['moon'];

  // Compute Vimshottari Dasha cycle from birth Moon position
  const now = new Date();
  const dashaInfo = calculateVimshottariDasha(moon.siderealDegree, birthDate, now);

  // Compute Real-Time Current Transits for TODAY
  const nowAyanamsa = getLahiriAyanamsa(now);
  const currentTransits = calculatePlanetaryPositions(now, nowAyanamsa);

  return {
    ayanamsa: {
      name: 'Lahiri (Chitrapaksha) Sidereal',
      valueDegrees: birthAyanamsa,
      formatted: formatDegreesMinutes(birthAyanamsa),
    },
    ascendant,
    sun,
    moon,
    planets: natalPlanets,
    currentDasha: dashaInfo.currentDasha,
    dashaTimeline: dashaInfo.timeline,
    currentTransits,
    calculationTimestamp: now.toISOString(),
    location: {
      name: loc.name,
      latitude: loc.lat,
      longitude: loc.lon,
      timezone: loc.timezone,
      resolved: loc.resolved,
    },
  };
}
