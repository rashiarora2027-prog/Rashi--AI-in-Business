/**
 * Loads the city dataset and registers it with the chart engine.
 *
 * Kept separate from locations.ts so that importing *this* module costs
 * nothing: the data arrives through a dynamic import, which lets the bundler
 * split it into its own chunk. Call it before computing a chart, or when a
 * location field is about to be used.
 *
 * Safe to call repeatedly — the work happens once and later callers await the
 * same promise.
 */

import { setCityResolver } from './astronomy';

let pending: Promise<boolean> | null = null;
let ready = false;

export function citiesReady(): boolean {
  return ready;
}

export function loadCities(): Promise<boolean> {
  if (pending) return pending;

  pending = import('./locations')
    .then((mod) => {
      setCityResolver((locationStr) => {
        const city = mod.resolveCity(locationStr);
        if (!city) return null;
        return { label: city.label, lat: city.lat, lon: city.lon, timezone: city.timezone };
      });
      ready = true;
      return true;
    })
    .catch((err) => {
      console.error('Could not load the city database:', err);
      // Allow a later attempt rather than failing for the rest of the session.
      pending = null;
      return false;
    });

  return pending;
}
