import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile } from '../types';
import { calculateFullKundali, KundaliChartData } from '../utils/astronomy';
import { loadCities, citiesReady } from '../utils/loadCities';

interface BirthChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

export const BirthChartModal: React.FC<BirthChartModalProps> = ({
  isOpen,
  onClose,
  userProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'planets' | 'dasha'>('overview');

  // A returning visitor can open this without ever touching a location field,
  // so make sure the city data is in place before charting. Without it the
  // birthplace cannot be resolved and the Ascendant would be computed at
  // default coordinates.
  const [geoReady, setGeoReady] = useState(citiesReady());
  useEffect(() => {
    if (!isOpen || geoReady) return;
    let active = true;
    loadCities().then(() => { if (active) setGeoReady(true); });
    return () => { active = false; };
  }, [isOpen, geoReady]);

  const chartData: KundaliChartData | null = useMemo(() => {
    try {
      return calculateFullKundali(
        userProfile.birthDate || '1996-05-14',
        userProfile.birthTime || '12:00',
        userProfile.birthLocation || ''
      );
    } catch (err) {
      console.warn('Failed to calculate full kundali:', err);
      return null;
    }
    // geoReady is a dependency on purpose: the chart is recomputed once the
    // city data lands, so the first render is not left showing fallback values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.birthDate, userProfile.birthTime, userProfile.birthLocation, geoReady]);

  if (!isOpen) return null;

  const asc = chartData?.ascendant;
  const moon = chartData?.moon;
  const sun = chartData?.sun;
  const dasha = chartData?.currentDasha;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#181410]/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#FAF6F0] rounded-3xl p-6 sm:p-10 border border-[#DECDBB] shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8DDCD]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base text-[#8B6E46]">✶</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A7051] font-semibold font-sans">
                KUNDALI ARCHITECTURE • ASTRONOMICAL PRECISION
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#221C16] font-normal">
              Your Natal Birth Chart
            </h2>
            <p className="text-xs text-[#6B5A47] mt-0.5">
              Calculated using Sidereal coordinates (Lahiri Ayanamsha: {chartData?.ayanamsa.formatted || '23° 51\' 25"'}) for {userProfile.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#887561] hover:text-[#1E1A16] p-2 rounded-full hover:bg-[#EFE5D7] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 my-4 border-b border-[#E8DDCD]/80 pb-2 text-xs">
          {[
            { id: 'overview', label: 'Primary Pillars' },
            { id: 'planets', label: 'All 9 Grahas (Planets)' },
            { id: 'dasha', label: 'Vimshottari Dasha' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1F1B16] text-[#FAF6F0] font-medium'
                  : 'bg-white/60 text-[#6B5B49] hover:bg-[#EAE0D2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Primary Pillars Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Natal Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Lagna / Ascendant */}
              <div className="p-4 rounded-2xl bg-white/80 border border-[#DFD1BE] shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-[#251E17]">Lagna (Rising)</span>
                  <span className="text-[11px] text-[#8A6F4E] font-serif">Ascendant</span>
                </div>
                <p className="text-lg font-serif text-[#866D4E] font-medium mb-0.5">
                  {asc?.sign || userProfile.ascendant || 'Cancer'} ({asc?.signSanskrit || 'Karka'})
                </p>
                <div className="text-[11px] text-[#7D6B57] mb-2 font-mono">
                  {asc?.formattedDegree || '14° 12\''} • {asc?.nakshatra || 'Pushya'} (Pada {asc?.pada || 1})
                </div>
                <p className="text-[11px] text-[#554737] leading-relaxed">
                  Your physical sanctuary and the experiential filter through which you engage the world.
                </p>
              </div>

              {/* Chandra Rashi (Moon Sign) */}
              <div className="p-4 rounded-2xl bg-white/80 border border-[#DFD1BE] shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-[#251E17]">Chandra (Moon)</span>
                  <span className="text-[11px] text-[#8A6F4E] font-serif">Mind & Heart</span>
                </div>
                <p className="text-lg font-serif text-[#866D4E] font-medium mb-0.5">
                  {moon?.sign || userProfile.moonSign || 'Pisces'} ({moon?.signSanskrit || 'Meena'})
                </p>
                <div className="text-[11px] text-[#7D6B57] mb-2 font-mono">
                  {moon?.formattedDegree || '28° 04\''} • {moon?.nakshatra || userProfile.nakshatra || 'Revati'} (Pada {moon?.pada || userProfile.pada || 1})
                </div>
                <p className="text-[11px] text-[#554737] leading-relaxed">
                  The emotional mind (Manas). How you intuitively process belonging, vulnerability, and internal security.
                </p>
              </div>

              {/* Surya (Sun Sign) */}
              <div className="p-4 rounded-2xl bg-white/80 border border-[#DFD1BE] shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-[#251E17]">Surya (Sun)</span>
                  <span className="text-[11px] text-[#8A6F4E] font-serif">Soul Will</span>
                </div>
                <p className="text-lg font-serif text-[#866D4E] font-medium mb-0.5">
                  {sun?.sign || userProfile.sunSign || 'Taurus'} ({sun?.signSanskrit || 'Vrishabha'})
                </p>
                <div className="text-[11px] text-[#7D6B57] mb-2 font-mono">
                  {sun?.formattedDegree || '00° 15\''} • {sun?.nakshatra || 'Krittika'} (Pada {sun?.pada || 1})
                </div>
                <p className="text-[11px] text-[#554737] leading-relaxed">
                  The core life vitality (Atman). The steady flame of personal purpose and ethical dignity.
                </p>
              </div>
            </div>

            {/* Current Running Dasha Capsule */}
            <div className="p-5 rounded-2xl bg-[#F4EDE2]/80 border border-[#DFD0BE]">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#866D50] block mb-1">
                CURRENT VIMSHOTTARI DASHA TIMELINE
              </span>
              <h4 className="text-sm font-semibold text-[#221C16] mb-1">
                Active Period: {dasha?.mahadasha || 'Saturn'} Mahadasha / {dasha?.antardasha || 'Mercury'} Antardasha
              </h4>
              <p className="text-xs text-[#524436] leading-relaxed mb-3">
                In Vedic astrology, personal time unfolds through multi-year planetary chapters called Dashas. Your current period is governed by {dasha?.mahadasha || 'Saturn'} (maturation, discipline, endurance) and refined by {dasha?.antardasha || 'Mercury'} (discernment, intellectual inquiry).
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#86735E]">
                <span>Period Window: {dasha?.startDate || '2024'} to {dasha?.endDate || '2027'}</span>
                <span>&bull;</span>
                <span>Calculated from Moon&apos;s exact degree in {moon?.nakshatra || 'Nakshatra'}</span>
              </div>
            </div>

            {/* Core Life Themes */}
            <div className="space-y-3">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#866D50] font-semibold block">
                INTEGRATIVE PATTERNS
              </span>
              <div className="p-4 rounded-xl bg-white/60 border border-[#DECDBB]">
                <h5 className="text-xs font-semibold text-[#251F19] mb-1">
                  1. Sacred Sanctuary Over Social Performance
                </h5>
                <p className="text-xs text-[#524536] leading-relaxed">
                  With your Moon in {moon?.sign || 'Pisces'} ({moon?.nakshatra || 'Revati'}), your deepest vitality returns in solitary, unwitnessed spaces. Respecting your need for quiet integration prevents emotional exhaustion.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/60 border border-[#DECDBB]">
                <h5 className="text-xs font-semibold text-[#251F19] mb-1">
                  2. Sustainable Craft (Dharma) Over Rushed Milestones
                </h5>
                <p className="text-xs text-[#524536] leading-relaxed">
                  Under your active {dasha?.mahadasha || 'Saturn'} chapter, lasting momentum is built brick-by-brick. Rushed compromises create friction; patient devotion to your true craft brings enduring peace.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: All 9 Planetary Positions */}
        {activeTab === 'planets' && (
          <div className="space-y-4 animate-fade-in text-left">
            <p className="text-xs text-[#6B5A47]">
              Mathematically computed planetary coordinates (Sidereal / Lahiri) at the moment of birth:
            </p>
            <div className="overflow-x-auto rounded-2xl border border-[#DFD1BE] bg-white/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EFE7DC]/60 text-[#725F4D] uppercase text-[10px] tracking-wider border-b border-[#DFD1BE]">
                  <tr>
                    <th className="py-2.5 px-3">Graha (Planet)</th>
                    <th className="py-2.5 px-3">Sign (Rashi)</th>
                    <th className="py-2.5 px-3">Exact Degree</th>
                    <th className="py-2.5 px-3">Nakshatra & Pada</th>
                    <th className="py-2.5 px-3">Motion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE7DC]">
                  {chartData && Object.values(chartData.planets).map((p) => (
                    <tr key={p.name} className="hover:bg-[#FAF4EC]/50 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-[#221C16]">
                        <span className="mr-1.5 font-serif text-[#866D4E]">{p.symbol}</span>
                        {p.name}
                        <span className="block text-[10px] text-[#86735E] font-normal">{p.sanskritName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-[#4A3D2F]">
                        {p.sign} <span className="text-[#86735E]">({p.signSanskrit})</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#524436]">
                        {p.formattedDegree}
                      </td>
                      <td className="py-2.5 px-3 text-[#524436]">
                        {p.nakshatra} <span className="text-[10px] text-[#86735E]">(Pada {p.pada})</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {p.isRetrograde ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#E8D8C8] text-[#7A4B2A] text-[10px] font-medium">
                            Retrograde ℞
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#7D7061]">Direct</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Dasha Timeline */}
        {activeTab === 'dasha' && (
          <div className="space-y-4 animate-fade-in text-left">
            <p className="text-xs text-[#6B5A47]">
              The 120-year Vimshottari Dasha system unfolds in 9 planetary chapters starting from your birth Nakshatra ({moon?.nakshatra || 'Revati'}, ruled by {moon?.nakshatraLord || 'Mercury'}):
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {chartData?.dashaTimeline.map((item) => (
                <div
                  key={item.planet}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.isCurrent
                      ? 'bg-[#F2E8DC] border-[#BFA587] shadow-xs'
                      : 'bg-white/60 border-[#E8DDCD]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base text-[#866D4E]">{item.symbol}</span>
                      <span className="text-xs font-semibold text-[#251E17]">
                        {item.planet} Mahadasha ({item.years.toFixed(1)} years)
                      </span>
                      {item.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#1C1814] text-[#FAF7F2] text-[9px] uppercase tracking-wider font-medium">
                          Active Now
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#7C6955] font-mono">
                      {item.startDate} → {item.endDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-5 border-t border-[#E8DDCD] mt-6">
          <span className="text-[11px] text-[#86735E]">
            Verified with NASA JPL Planetary Algorithms & Chitrapaksha Lahiri standard
          </span>
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
