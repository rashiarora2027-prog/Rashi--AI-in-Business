/**
 * Birth-location search and resolution.
 *
 * Two things matter for chart accuracy and both come from here:
 *   - latitude/longitude, which set the Lagna (Ascendant)
 *   - the IANA timezone, which converts the stated birth time to UTC
 *
 * Search is accent-insensitive on purpose: a large share of the Indian place
 * names in the source data carry diacritics, and nobody types those.
 */

import { getCities, type City } from '../data/cities.ts';

export type { City };

/** Characters that NFD cannot split apart, mapped to their plain equivalents. */
const SPECIAL: Record<string, string> = {
  ł: 'l', Ł: 'l', ø: 'o', Ø: 'o', ß: 'ss', đ: 'd', Đ: 'd',
  ð: 'd', Ð: 'd', þ: 'th', Þ: 'th', æ: 'ae', Æ: 'ae', œ: 'oe', Œ: 'oe',
  ı: 'i', '’': "'", '‘': "'",
};

/** Lowercases and strips accents so "Łódź" and "lodz" compare equal. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split('')
    .map((ch) => SPECIAL[ch] ?? ch)
    .join('')
    .toLowerCase()
    .trim();
}

/**
 * A deliberately lossy key that absorbs the usual Indian transliteration
 * variance — Bhubaneswar/Bhubaneshwar, v/w swaps, doubled letters. Only ever
 * used as a last resort when resolving stored text, never for ranking search
 * results, because it happily conflates names that merely sound alike.
 */
function looseKey(s: string): string {
  return normalize(s)
    .replace(/[^a-z]/g, '')
    .replace(/sh/g, 's')
    .replace(/w/g, 'v')
    .replace(/(.)\1+/g, '$1');
}

/** Cities whose searchable text has been precomputed. */
type Indexed = City & { _n: string; _r: string; _l: string };

let indexed: Indexed[] | null = null;

function getIndexed(): Indexed[] {
  if (indexed) return indexed;
  indexed = getCities().map((c) => ({
    ...c,
    _n: normalize(c.name),
    _r: normalize(c.region),
    _l: looseKey(c.name),
  }));
  return indexed;
}

/**
 * Ranked search over the city list.
 *
 * Ordering favours, in turn: exact name, name starting with the query, the
 * region matching, then any substring. The dataset is already sorted by
 * population, so within a tier the larger city wins — "Pune" beats a hamlet of
 * the same name without any extra work.
 */
export function searchCities(query: string, limit = 8): City[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const cities = getIndexed();
  const exact: City[] = [];
  const prefix: City[] = [];
  const region: City[] = [];
  const loose: City[] = [];

  for (const c of cities) {
    if (c._n === q) exact.push(c);
    else if (c._n.startsWith(q)) prefix.push(c);
    else if (c._r.startsWith(q)) region.push(c);
    else if (c._n.includes(q)) loose.push(c);

    // Stop early once the strong tiers can already fill the list.
    if (exact.length + prefix.length >= limit * 3) break;
  }

  return [...exact, ...prefix, ...region, ...loose].slice(0, limit);
}

/**
 * Resolves a stored location string back to a city.
 *
 * Profiles saved before the picker existed hold free text, so this has to cope
 * with "Austin, TX" as well as "Chaibasa, Jharkhand". Returns null rather than
 * guessing — callers decide what an unknown location should mean, instead of
 * silently charting someone at the wrong coordinates.
 */
export function resolveCity(locationStr: string): City | null {
  if (!locationStr) return null;

  const cities = getIndexed();
  const full = normalize(locationStr);

  // Whole string first, then the part before the first comma.
  for (const c of cities) if (c._n === full) return c;

  const head = normalize(locationStr.split(',')[0]);
  if (head.length >= 2) {
    for (const c of cities) if (c._n === head) return c;
    for (const c of cities) if (c._n.startsWith(head)) return c;

    // Last resort: spelling variants. Guarded by a length floor so short
    // inputs cannot collapse into an unrelated city.
    if (head.length >= 5) {
      const loose = looseKey(head);
      for (const c of cities) if (c._l === loose) return c;
    }
  }

  return null;
}
