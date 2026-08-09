/**
 * A copy of the orders kept on the device, so coming back to the app is instant.
 *
 * A phone throws a backgrounded page out of memory. Answering a message and switching back
 * is therefore a cold start: the app boots, reads two thousand orders from Supabase, and
 * shows nothing for two or three seconds — which reads as the app being slow when it is
 * really the app being started again.
 *
 * The rows from the last successful read are written here, and the next start paints from
 * them immediately while the real read happens behind it. Supabase is still the only source
 * of truth; this is nothing more than what was on screen a moment ago.
 */

import { Order, MonthlyStats } from "@/types";

const KEY = "orders_cache_v1";

/** Anything older than this is not worth showing even for a moment. */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export interface CachedOrders {
  months: Record<string, Order[]>;
  stats: Record<string, MonthlyStats>;
  savedAt: number;
}

/**
 * Roughly what a browser will hold for one site is 5 MB. Two thousand orders come to about
 * 1.5 MB, so there is room — but the shop keeps adding orders, and a copy that quietly
 * outgrows the limit would start throwing on every save. This is where it stops growing.
 */
const MAX_BYTES = 3 * 1024 * 1024;

/**
 * Stores the orders for the next start.
 *
 * Failures are swallowed on purpose. A full or blocked localStorage is a reason to lose a
 * convenience, never a reason for a save or a load to fail — the app works without this.
 */

export function cacheOrders(months: Record<string, Order[]>, stats: Record<string, MonthlyStats>) {
  try {
    let payload = JSON.stringify({ months, stats, savedAt: Date.now() });

    if (payload.length > MAX_BYTES) {
      /*
       * Too big, so the oldest months go.
       *
       * Dropping months rather than refusing to store anything: the first paint shows the
       * month in progress, so the recent months are the ones worth having instantly and the
       * older ones can wait for the real read. Keys are in insertion order, oldest first,
       * which is the order the loader built them in.
       */
      const kept: Record<string, Order[]> = {};
      for (const month of Object.keys(months).reverse()) {
        kept[month] = months[month];
        if (JSON.stringify({ months: kept, stats, savedAt: 0 }).length > MAX_BYTES) {
          delete kept[month];
          break;
        }
      }
      payload = JSON.stringify({ months: kept, stats, savedAt: Date.now() });
      console.info(
        `[orders] local copy trimmed to ${Object.keys(kept).length} month(s) to stay within the ` +
          "browser's storage limit",
      );
    }

    localStorage.setItem(KEY, payload);
  } catch (error) {
    console.warn("[orders] could not keep a local copy", error);
  }
}

/** The stored orders, or null when there are none worth using. */
export function readCachedOrders(): CachedOrders | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedOrders;
    if (!parsed?.months || typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Forgets the local copy. Used when a sign-in changes, so one account cannot see another's. */
export function clearCachedOrders() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to do; the copy is only a convenience.
  }
}
