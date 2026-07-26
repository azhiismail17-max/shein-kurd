// Where a scanned code is resolved.
//
// A network round trip cannot feel instant, so the codes are downloaded once and
// every scan is answered from memory. Only a code that is not in that local
// index costs a request, and the answer is then kept so the same code is never
// paid for twice.
//
// Order of attempts:
//   1. the local index   - no network at all, sub-millisecond
//   2. the saved answers - no network, survives a reload
//   3. Supabase          - the only remote source
//
// Supabase is the single source of truth for codes. The Google Apps Script that
// used to answer this is gone from the path entirely: it took two to three
// seconds per code, which no amount of caching around it could make feel fast.

const SUPABASE_URL = "https://nbzgmrltykhadwyyesvd.supabase.co/rest/v1/orders";
// Publishable (anon) key - intended for client use; access governed by RLS.
const SUPABASE_KEY = "sb_publishable_wVJFTAiKIufi0Rv6GnpjPg_A9QReZ52";

const INDEX_KEY = "sku_index_v1";
const ANSWERS_KEY = "sku_answers_v1";
const INDEX_MAX_ROWS = 5000;
const ANSWERS_MAX = 400;
// How stale the index may get before it is refreshed in the background. The
// refresh never blocks a lookup, so this only controls freshness, not speed.
const INDEX_TTL_MS = 5 * 60 * 1000;

export interface SkuLookupResult {
  name?: string;
  link?: string;
  quantity?: string | number;
  pcs?: string | number;
  sku?: string;
  [key: string]: unknown;
}

export type SkuLookupSource = "index" | "saved" | "supabase" | "none";

interface IndexRow {
  name: string;
  link: string;
  pcs: string;
  sku: string;
}

/**
 * Reduce anything scanned or typed to the PIN the codes are stored as: digits
 * only, and never more than the last 7 of them. A full label such as
 * "sj25030221453137331" becomes "3137331", which is exactly what the extractor
 * bot writes, so a scan and a hand-typed code look the same to the lookup.
 */
export const toPinCode = (value: unknown, maxDigits = 7) => {
  const digits = String(value ?? "").replace(/\D+/g, "");
  return digits.length > maxDigits ? digits.slice(-maxDigits) : digits;
};

// ---------------------------------------------------------------------------
// Local index
// ---------------------------------------------------------------------------

let indexRows: IndexRow[] | null = null;
let indexLoadedAt = 0;
let indexInFlight: Promise<void> | null = null;

const readStoredIndex = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(INDEX_KEY) || "null");
    if (!saved || !Array.isArray(saved.rows)) return null;
    return { rows: saved.rows as IndexRow[], at: Number(saved.at) || 0 };
  } catch {
    return null;
  }
};

const ensureIndexLoaded = () => {
  if (indexRows) return;
  const saved = readStoredIndex();
  if (saved) {
    indexRows = saved.rows;
    indexLoadedAt = saved.at;
  }
};

/**
 * Download every code once so later scans need no network. Safe to call often -
 * it refreshes at most once per TTL and never runs twice at the same time.
 */
export function primeSkuIndex(force = false): Promise<void> {
  ensureIndexLoaded();
  const isFresh = indexRows !== null && Date.now() - indexLoadedAt < INDEX_TTL_MS;
  if (!force && isFresh) return Promise.resolve();
  if (indexInFlight) return indexInFlight;

  indexInFlight = (async () => {
    try {
      // Rows with no code yet are of no use for a lookup, so they are skipped -
      // that keeps the download and the stored index as small as possible.
      const response = await fetch(
        `${SUPABASE_URL}?sku=not.is.null&select=name,link,pcs,sku&limit=${INDEX_MAX_ROWS}`,
        {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
          cache: "no-store",
        },
      );
      if (!response.ok) throw new Error(`Index download failed (${response.status})`);
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error("Unexpected index payload");

      indexRows = rows
        .map((row) => ({
          name: String(row?.name ?? ""),
          link: String(row?.link ?? ""),
          pcs: String(row?.pcs ?? ""),
          sku: String(row?.sku ?? ""),
        }))
        .filter((row) => row.sku);
      indexLoadedAt = Date.now();
      try {
        localStorage.setItem(INDEX_KEY, JSON.stringify({ at: indexLoadedAt, rows: indexRows }));
      } catch {
        // Storage full or unavailable - the in-memory copy still works.
      }
    } catch (error) {
      console.warn("Could not refresh the local SKU index", error);
    } finally {
      indexInFlight = null;
    }
  })();

  return indexInFlight;
}

/**
 * Answer a code from the local index. Returns null when the index simply has
 * nothing for it, so the caller knows to go to the network.
 */
export function lookupSkuInIndex(code: string): SkuLookupResult[] | null {
  const pin = toPinCode(code);
  if (pin.length < 6) return null;
  ensureIndexLoaded();
  if (!indexRows || indexRows.length === 0) return null;

  const hits = indexRows.filter((row) => row.sku.includes(pin));
  return hits.length > 0
    ? hits.map((row) => ({
        name: row.name,
        link: row.link,
        quantity: row.pcs,
        pcs: row.pcs,
        sku: row.sku,
      }))
    : null;
}

export function getSkuIndexInfo() {
  ensureIndexLoaded();
  return { size: indexRows?.length ?? 0, loadedAt: indexLoadedAt };
}

// ---------------------------------------------------------------------------
// Saved answers - a code resolved once stays instant, even after a reload
// ---------------------------------------------------------------------------

const readAnswers = (): Record<string, SkuLookupResult[]> => {
  try {
    const saved = JSON.parse(localStorage.getItem(ANSWERS_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
};

const rememberAnswer = (pin: string, results: SkuLookupResult[]) => {
  if (results.length === 0) return; // never cache "not found"; it may arrive later
  try {
    const answers = readAnswers();
    answers[pin] = results;
    const keys = Object.keys(answers);
    if (keys.length > ANSWERS_MAX) {
      for (const key of keys.slice(0, keys.length - ANSWERS_MAX)) delete answers[key];
    }
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  } catch {
    // Not being able to remember an answer is not worth failing a lookup over.
  }
};

// ---------------------------------------------------------------------------
// Network sources
// ---------------------------------------------------------------------------

async function searchSupabase(pin: string, signal?: AbortSignal) {
  const response = await fetch(
    `${SUPABASE_URL}?sku=ilike.*${encodeURIComponent(pin)}*&select=name,link,pcs,sku&limit=20`,
    {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      signal,
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error(`Supabase lookup failed (${response.status})`);
  const rows = await response.json();
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    name: row?.name ?? "",
    link: row?.link ?? "",
    quantity: row?.pcs ?? "",
    pcs: row?.pcs ?? "",
    sku: row?.sku ?? "",
  })) as SkuLookupResult[];
}

/**
 * Look a code up as fast as possible. Never throws: a failure returns no
 * results rather than breaking the search screen.
 */
export async function lookupSku(
  code: string,
  signal?: AbortSignal,
): Promise<{ results: SkuLookupResult[]; source: SkuLookupSource }> {
  const pin = toPinCode(code);
  if (pin.length < 6) return { results: [], source: "none" };

  const fromIndex = lookupSkuInIndex(pin);
  if (fromIndex) return { results: fromIndex, source: "index" };

  const saved = readAnswers()[pin];
  if (Array.isArray(saved) && saved.length > 0) return { results: saved, source: "saved" };

  let results: SkuLookupResult[] = [];
  let source: SkuLookupSource = "none";
  try {
    results = await searchSupabase(pin, signal);
    if (results.length > 0) source = "supabase";
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    console.warn("Supabase SKU lookup failed", error);
  }

  rememberAnswer(pin, results);
  // Supabase knowing a code the index did not means the index is behind, so top
  // it up in the background now that the answer has already been returned. A hit
  // from the old Apps Script says nothing about the index - Supabase genuinely
  // has no such row - so refreshing on that would download nothing, repeatedly.
  if (source === "supabase") void primeSkuIndex(true);
  return { results, source };
}
