import { YEARS_CONFIG } from "@/types";

/**
 * The months a year is allowed to have are hardcoded in YEARS_CONFIG, which means
 * an imported workbook could only ever land on a name that was already listed.
 * A snapshot may declare extra months so a tab can be called anything and still
 * belong to a chosen year; those names are registered here and merged on top.
 *
 * Extras are appended after the configured months, so the built-in ordering is
 * preserved and custom months sort after them within their year.
 */
let extraMonths: Record<string, string[]> = {};

// The month list is rebuilt from scratch on every lookup otherwise, and sorting
// orders asks for it twice per comparison — tens of thousands of times for a few
// thousand orders. Both the list and the position lookup are cached, and the cache
// is dropped whenever the set of months changes.
let allMonthsCache: string[] | null = null;
let monthIndexCache: Map<string, number> | null = null;

export function registerYearMonths(yearMonths: Record<string, string[]> | undefined) {
  extraMonths = yearMonths ? { ...yearMonths } : {};
  allMonthsCache = null;
  monthIndexCache = null;
}

/** Configured months for a year followed by any snapshot-declared extras. */
export function getYearMonths(year: string): string[] {
  const base = YEARS_CONFIG[year] || [];
  const extra = (extraMonths[year] || []).filter((month) => !base.includes(month));
  return [...base, ...extra];
}

export function getYears(): string[] {
  return Array.from(new Set([...Object.keys(YEARS_CONFIG), ...Object.keys(extraMonths)]));
}

export function getAllMonths(): string[] {
  if (!allMonthsCache) {
    allMonthsCache = getYears()
      .sort()
      .flatMap((year) => getYearMonths(year));
  }
  return allMonthsCache;
}

/**
 * Position of a month on the overall timeline, used to sort orders across months.
 * Unknown names sort last rather than colliding at zero.
 */
export function getMonthIndex(month: string): number {
  if (!monthIndexCache) {
    monthIndexCache = new Map();
    getAllMonths().forEach((name, index) => monthIndexCache!.set(name, index));
  }
  return monthIndexCache.get(month) ?? Number.MAX_SAFE_INTEGER;
}
