// Where a scanned code is looked up.
//
// Supabase is asked first because it answers in well under a second, while the
// Apps Script it replaces takes two to three seconds for the same question. The
// Apps Script is still tried when Supabase has nothing, so codes that only exist
// in the old sheet keep resolving until the extractor bot has filled Supabase.

const SUPABASE_URL = "https://nbzgmrltykhadwyyesvd.supabase.co/rest/v1/orders";
// Publishable (anon) key - meant for client use; row access is governed by RLS.
const SUPABASE_KEY = "sb_publishable_wVJFTAiKIufi0Rv6GnpjPg_A9QReZ52";

const LEGACY_SKU_API_URL =
  "https://script.google.com/macros/s/AKfycbxUmtYopoO9HznjbfiAP8heZTZlk0RvxtuInPzlEuneNXs4RGAlDvY_FjUAqK8yyT8/exec";

export interface SkuLookupResult {
  name?: string;
  link?: string;
  quantity?: string | number;
  pcs?: string | number;
  sku?: string;
  [key: string]: unknown;
}

export type SkuLookupSource = "supabase" | "legacy" | "none";

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

async function searchSupabase(code: string, signal?: AbortSignal) {
  const query =
    `${SUPABASE_URL}?sku=ilike.*${encodeURIComponent(code)}*` +
    `&select=id,name,link,pcs,sku&limit=20`;
  const response = await fetch(query, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    signal,
    cache: "no-store",
  });
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

async function searchLegacyScript(code: string, signal?: AbortSignal) {
  const response = await fetch(`${LEGACY_SKU_API_URL}?query=${encodeURIComponent(code)}`, {
    signal,
    redirect: "follow",
  });
  const text = await response.text();
  let data: { status?: string; results?: SkuLookupResult[] } | null = null;
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }
  return data?.status === "success" && Array.isArray(data.results) ? data.results : [];
}

/**
 * Look a code up, fastest source first. Never throws: a lookup failure returns
 * no results rather than breaking the search screen.
 */
export async function lookupSku(
  code: string,
  signal?: AbortSignal,
): Promise<{ results: SkuLookupResult[]; source: SkuLookupSource }> {
  const pin = toPinCode(code);
  if (pin.length < 6) return { results: [], source: "none" };

  try {
    const results = await searchSupabase(pin, signal);
    if (results.length > 0) return { results, source: "supabase" };
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    console.warn("Supabase SKU lookup failed, falling back", error);
  }

  try {
    const results = await searchLegacyScript(pin, signal);
    return { results, source: results.length > 0 ? "legacy" : "none" };
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    console.warn("Legacy SKU lookup failed", error);
    return { results: [], source: "none" };
  }
}
