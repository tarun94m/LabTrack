// THE due-date fix, part 2: a due date is a calendar day, so we carry it as "YYYY-MM-DD"
// everywhere and never let it become a local-time Date.
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

function utcMs(iso) {
  const m = ISO.exec(iso);
  if (!m) throw new Error(`Expected YYYY-MM-DD, got "${iso}"`);
  return Date.UTC(+m[1], +m[2] - 1, +m[3]);
}

/** "2026-12-01" -> "1 Dec 2026", identical in every time zone. */
export function formatDue(iso) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(utcMs(iso)));
}

/** Today's calendar date in a given IANA zone (the lab's), as YYYY-MM-DD. */
export function todayIn(timeZone, now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(now);
}

/** Whole days from a to b (positive = b is later). */
export function daysBetween(a, b) {
  return Math.round((utcMs(b) - utcMs(a)) / 86_400_000);
}

/** Add n days to a YYYY-MM-DD string (used by the seed script). */
export function addDays(iso, n) {
  return new Date(utcMs(iso) + n * 86_400_000).toISOString().slice(0, 10);
}
