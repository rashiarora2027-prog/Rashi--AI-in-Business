/**
 * Converting a stated birth time into the UTC instant the ephemeris needs.
 *
 * This is not a nicety. Birth time drives the Ascendant, which advances through
 * a full zodiac every 24 hours — roughly one sign every two hours. Treating an
 * Indian 08:30 as 08:30 UTC rather than 03:00 UTC moves the Lagna by about two
 * and a half signs, so the chart describes a different person.
 *
 * Uses Intl rather than a timezone library: the IANA rules ship with the
 * runtime, they cover historical offsets and DST, and there is no dependency to
 * break at deploy time.
 */

/** How far the given zone is ahead of UTC at a particular instant, in ms. */
function zoneOffsetMs(utcMs: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(new Date(utcMs))) parts[p.type] = p.value;

  const asUTC = Date.UTC(
    +parts.year,
    +parts.month - 1,
    +parts.day,
    +parts.hour % 24,
    +parts.minute,
    +parts.second
  );
  return asUTC - utcMs;
}

/**
 * Wall-clock birth time in `timeZone` -> the matching UTC Date.
 *
 * Resolved twice because the offset depends on the instant we are still
 * solving for; the second pass settles births that fall near a DST change.
 * Falls back to treating the input as UTC if the zone is unknown, which is the
 * old behaviour and better than throwing mid-chart.
 */
export function localBirthToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);

  try {
    const firstPass = zoneOffsetMs(wallAsUtc, timeZone);
    let instant = wallAsUtc - firstPass;

    const secondPass = zoneOffsetMs(instant, timeZone);
    if (secondPass !== firstPass) instant = wallAsUtc - secondPass;

    return new Date(instant);
  } catch {
    return new Date(wallAsUtc);
  }
}

/** "+05:30" — shown next to a resolved location so the offset is visible. */
export function formatZoneOffset(date: Date, timeZone: string): string {
  try {
    const ms = zoneOffsetMs(date.getTime(), timeZone);
    const totalMinutes = Math.round(ms / 60000);
    const sign = totalMinutes < 0 ? '-' : '+';
    const abs = Math.abs(totalMinutes);
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    return `${sign}${hh}:${mm}`;
  } catch {
    return '';
  }
}
