/**
 * Generates src/data/cities.ts — the birth-location database.
 *
 * Runs as part of the build rather than being committed, so the repository
 * stays small and the data can be regenerated from upstream sources.
 *
 * Sources (all devDependencies, all offline once installed):
 *   all-the-cities  GeoNames-derived places with population and coordinates
 *   tz-lookup       IANA timezone for a coordinate
 *   city-timezones  ISO-3166 alpha-2 -> country name
 *
 * Coverage is deliberately asymmetric: India down to ~5,000 population so that
 * small towns resolve, the rest of the world down to ~100,000 to keep the
 * payload reasonable.
 *
 * Exits non-zero on failure. A broken build is recoverable; a silently missing
 * city list would mean charts computed at fallback coordinates.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'src', 'data', 'cities.ts');

const INDIA_MIN_POPULATION = 5000;
const WORLD_MIN_POPULATION = 100000;

/** GeoNames admin1 codes for India -> state / union territory. */
const IN_STATES = {
  '01': 'Andaman and Nicobar Islands', '02': 'Andhra Pradesh', '03': 'Assam',
  '05': 'Chandigarh', '06': 'Dadra and Nagar Haveli', '07': 'Delhi', '09': 'Gujarat',
  '10': 'Haryana', '11': 'Himachal Pradesh', '12': 'Jammu and Kashmir', '13': 'Kerala',
  '14': 'Lakshadweep', '16': 'Maharashtra', '17': 'Manipur', '18': 'Meghalaya',
  '19': 'Karnataka', '20': 'Nagaland', '21': 'Odisha', '22': 'Puducherry', '23': 'Punjab',
  '24': 'Rajasthan', '25': 'Tamil Nadu', '26': 'Tripura', '28': 'West Bengal',
  '29': 'Sikkim', '30': 'Arunachal Pradesh', '31': 'Mizoram', '32': 'Daman and Diu',
  '33': 'Goa', '34': 'Bihar', '35': 'Madhya Pradesh', '36': 'Uttar Pradesh',
  '37': 'Chhattisgarh', '38': 'Jharkhand', '39': 'Uttarakhand', '40': 'Telangana',
};

/**
 * Former and alternate names people still type.
 *
 * Each alias becomes its own searchable row pointing at the same coordinates,
 * but carrying the canonical label — so typing "Bangalore" finds the city and
 * stores it as "Bengaluru, Karnataka". Without these, many of India's major
 * cities fail to resolve under the name their residents grew up with, and
 * fuzzy matching fills the gap with the wrong town ("Poona" -> "Poonamalle").
 *
 * alias -> name as it appears in the source data
 */
const ALIASES = {
  Bangalore: 'Bengaluru',
  Bombay: 'Mumbai',
  Madras: 'Chennai',
  Calcutta: 'Kolkata',
  Gurugram: 'Gurgaon',
  Prayagraj: 'Allahabad',
  Mysuru: 'Mysore',
  Belagavi: 'Belgaum',
  Hubballi: 'Hubli',
  Shivamogga: 'Shimoga',
  Kalaburagi: 'Gulbarga',
  Vijayapura: 'Bijapur',
  Pondicherry: 'Puducherry',
  Trivandrum: 'Thiruvananthapuram',
  Banaras: 'Varanasi',
  Benares: 'Varanasi',
  Baroda: 'Vadodara',
  Cochin: 'Kochi',
  Poona: 'Pune',
  Cawnpore: 'Kanpur',
  Simla: 'Shimla',
  Shimla: 'Simla',
  Panjim: 'Panaji',
  Trichy: 'Tiruchirappalli',
  Tiruchirapalli: 'Tiruchirappalli',
  Vizag: 'Visakhapatnam',
  Mangaluru: 'Mangalore',
  Thoothukudi: 'Tuticorin',
  Rajahmundry: 'Rajamahendravaram',
  Rajamahendravaram: 'Rajahmundry',
  Secunderabad: 'Hyderabad',
};

/** ISO codes the country-name source does not carry. */
const EXTRA_COUNTRIES = { XK: 'Kosovo' };

const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const round2 = (n) => Math.round(n * 100) / 100;

function main() {
  const cities = require('all-the-cities');
  const tzlookup = require('tz-lookup');
  const { cityMapping } = require('city-timezones');

  const countryName = { ...EXTRA_COUNTRIES };
  for (const c of cityMapping) {
    if (c.iso2 && c.country && !countryName[c.iso2]) countryName[c.iso2] = c.country;
  }

  const selected = [];
  for (const c of cities) {
    const isIndia = c.country === 'IN';
    const floor = isIndia ? INDIA_MIN_POPULATION : WORLD_MIN_POPULATION;
    if (c.population < floor) continue;

    const [lon, lat] = c.loc.coordinates;
    let timezone;
    try {
      timezone = tzlookup(lat, lon);
    } catch {
      continue; // no timezone means we cannot chart it correctly; skip it
    }

    const region = isIndia
      ? IN_STATES[c.adminCode] || ''
      : countryName[c.country] || c.country;

    selected.push({
      name: stripAccents(c.name),
      region,
      country: c.country,
      lat: round2(lat),
      lon: round2(lon),
      timezone,
      population: c.population,
    });
  }

  if (selected.length < 5000) {
    throw new Error(`only ${selected.length} cities resolved — the source data looks wrong`);
  }
  const indiaCount = selected.filter((c) => c.country === 'IN').length;
  if (indiaCount < 2000) {
    throw new Error(`only ${indiaCount} Indian cities resolved — expected far more`);
  }

  // Add alias rows for renamed cities, each pointing at the canonical entry.
  const byName = new Map(selected.map((c) => [c.name.toLowerCase(), c]));
  let aliasCount = 0;
  for (const [alias, canonical] of Object.entries(ALIASES)) {
    const target = byName.get(canonical.toLowerCase());
    if (!target) continue;                         // source spells it differently
    if (byName.has(alias.toLowerCase())) continue; // already a real city
    selected.push({
      ...target,
      name: alias,
      // Keep the canonical label so the stored value is the current name.
      aliasOf: target.name,
      population: target.population - 1, // sort just below the real entry
    });
    aliasCount++;
  }
  console.log(`[build-cities] added ${aliasCount} alias rows`);

  // Most populous first: for duplicate names the larger city is matched first.
  selected.sort((a, b) => b.population - a.population);

  const timezones = [...new Set(selected.map((c) => c.timezone))];
  const regions = [...new Set(selected.map((c) => c.region))];
  const tzIndex = new Map(timezones.map((t, i) => [t, i]));
  const regionIndex = new Map(regions.map((r, i) => [r, i]));

  // Seventh field is the canonical name, present only on alias rows.
  const rows = selected
    .map((c) => {
      const base = [c.name, regionIndex.get(c.region), c.country, c.lat, c.lon, tzIndex.get(c.timezone)];
      if (c.aliasOf) base.push(c.aliasOf);
      return base.join('|');
    })
    .join('\n');

  // The rows go into a template literal, so these would break the output.
  for (const ch of ['`', '${', '\\']) {
    if (rows.includes(ch)) {
      throw new Error(`city data contains ${ch}, which would break the generated module`);
    }
  }

  const moduleSource = `/**
 * Birth-location database: ${selected.length.toLocaleString('en-US')} cities.
 *
 * GENERATED FILE — do not edit. Produced by scripts/build-cities.mjs during the
 * build; run "npm run build:cities" to refresh it by hand.
 *
 * India is covered down to ~${INDIA_MIN_POPULATION.toLocaleString('en-US')} population so that small towns
 * resolve; the rest of the world down to ~${WORLD_MIN_POPULATION.toLocaleString('en-US')}.
 *
 * Stored as one packed string rather than an array of objects: it is roughly a
 * third of the size, and this module is loaded on demand (see utils/loadCities)
 * so it never lands in the initial page download.
 *
 * Row format: name|regionIndex|countryISO2|lat|lon|timezoneIndex[|canonicalName]
 */

const TIMEZONES = ${JSON.stringify(timezones)};

const REGIONS = ${JSON.stringify(regions)};

const ROWS = \`${rows}\`;

export type City = {
  /** City name, transliterated to plain ASCII. */
  name: string;
  /** Indian state, or country name for cities elsewhere. */
  region: string;
  /** ISO-3166 alpha-2 country code. */
  country: string;
  lat: number;
  lon: number;
  /** IANA timezone, e.g. "Asia/Kolkata". */
  timezone: string;
  /** "Chaibasa, Jharkhand" — what we display and store. */
  label: string;
};

let cache: City[] | null = null;

/** Parses the packed rows once, then serves from memory. */
export function getCities(): City[] {
  if (cache) return cache;
  const out: City[] = [];
  for (const row of ROWS.split(String.fromCharCode(10))) {
    if (!row) continue;
    const [name, regionIdx, country, lat, lon, tzIdx, canonical] = row.split('|');
    const region = REGIONS[+regionIdx] || '';
    // Alias rows are searchable under the old name but label themselves with
    // the current one, so that is what gets stored on the profile.
    const display = canonical || name;
    out.push({
      name,
      region,
      country,
      lat: +lat,
      lon: +lon,
      timezone: TIMEZONES[+tzIdx],
      label: region ? display + ', ' + region : display,
    });
  }
  cache = out;
  return out;
}
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, moduleSource);

  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log(`[build-cities] ${selected.length} cities (${indiaCount} in India) -> src/data/cities.ts (${kb}KB)`);
}

try {
  main();
} catch (err) {
  console.error('[build-cities] FAILED:', err.message);
  process.exit(1);
}
