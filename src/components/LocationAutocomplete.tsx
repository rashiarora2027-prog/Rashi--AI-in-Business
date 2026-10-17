/**
 * Birth-location picker with type-ahead over the full city dataset.
 *
 * The dataset is a few hundred KB, so it is pulled in with a dynamic import the
 * first time someone focuses the field — it never sits in the initial page load.
 *
 * Free text is still allowed. Someone born in a village that isn't listed
 * should be able to proceed, but the field says plainly when a place hasn't
 * been matched, because an unmatched location falls back to default
 * coordinates and produces a confidently wrong Ascendant.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Check, AlertCircle, Loader2 } from 'lucide-react';
import type { City } from '../utils/locations';
import { loadCities } from '../utils/loadCities';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Fired when a city is picked from the list, or cleared by free typing. */
  onCitySelect?: (city: City | null) => void;
};

type SearchFns = {
  searchCities: (q: string, limit?: number) => City[];
  resolveCity: (s: string) => City | null;
};

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Start typing a city — e.g. Chaibasa, Pune, London',
  className = '',
  onCitySelect,
}: Props) {
  const [fns, setFns] = useState<SearchFns | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [matched, setMatched] = useState<City | null>(null);
  const [touched, setTouched] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);

  /** Pulls the city dataset in on first interaction. */
  const ensureLoaded = useCallback(async (): Promise<SearchFns | null> => {
    if (fns) return fns;
    setLoading(true);
    try {
      const [mod] = await Promise.all([import('../utils/locations'), loadCities()]);
      const loaded = { searchCities: mod.searchCities, resolveCity: mod.resolveCity };
      setFns(loaded);
      return loaded;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [fns]);

  // Confirm whatever is already in the field once the data is available.
  useEffect(() => {
    if (!fns || !value) return;
    const city = fns.resolveCity(value);
    setMatched(city);
    onCitySelect?.(city);
    // onCitySelect is intentionally excluded: callers often pass an inline
    // function, which would re-run this on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fns, value]);

  // Close when the click lands outside.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  async function handleChange(next: string) {
    onChange(next);
    setTouched(true);

    const loaded = await ensureLoaded();
    if (!loaded) return;

    const found = loaded.searchCities(next, 8);
    setResults(found);
    setHighlighted(0);
    setOpen(found.length > 0);

    const exact = loaded.resolveCity(next);
    setMatched(exact);
    onCitySelect?.(exact);
  }

  function pick(city: City) {
    onChange(city.label);
    setMatched(city);
    onCitySelect?.(city);
    setOpen(false);
    setResults([]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(results[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const showUnmatched = touched && value.trim().length > 2 && !matched && !loading && !open;

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            ensureLoaded();
            if (results.length) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          className={
            className ||
            'w-full text-xs sm:text-sm px-3.5 py-2.5 pr-9 rounded-xl bg-white/80 border border-[#DACBB8] text-[#241F1A] placeholder:text-[#A49483] focus:outline-none focus:border-[#967448]'
          }
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader2 size={14} className="animate-spin text-[#A49483]" />
          ) : matched ? (
            <Check size={14} className="text-[#6B8E5A]" />
          ) : (
            <MapPin size={14} className="text-[#A49483]" />
          )}
        </div>
      </div>

      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-[#DACBB8] bg-[#FDFBF7] shadow-lg"
        >
          {results.map((city, i) => (
            <li key={`${city.name}-${city.lat}-${city.lon}`} role="option" aria-selected={i === highlighted}>
              <button
                type="button"
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => pick(city)}
                className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm transition-colors ${
                  i === highlighted ? 'bg-[#EFE6D8]' : 'hover:bg-[#F5EFE4]'
                }`}
              >
                <span className="text-[#241F1A]">{city.name}</span>
                {city.region && <span className="text-[#8A7B68]">, {city.region}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {matched && !open && (
        <p className="mt-1 text-[10px] text-[#6B8E5A]">
          Using {matched.lat.toFixed(2)}°, {matched.lon.toFixed(2)}° · {matched.timezone.replace('_', ' ')}
        </p>
      )}

      {showUnmatched && (
        <p className="mt-1 flex items-start gap-1 text-[10px] text-[#A6703C]">
          <AlertCircle size={11} className="mt-px shrink-0" />
          <span>
            Not in our list — pick the nearest listed town, or your chart will use default
            coordinates and the rising sign may be wrong.
          </span>
        </p>
      )}
    </div>
  );
}
