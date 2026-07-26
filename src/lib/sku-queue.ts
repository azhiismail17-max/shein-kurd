// Queues a newly submitted order for the SKU extractor bot.
//
// The Google Sheet stays the system of record for an order - it is the only
// place that holds the phone, place, price, box, profit, pictures and month.
// This adds a second, tiny record whose whole purpose is to give sku.py
// something to pick up: a name, the link to scrape, the piece count, and a null
// sku that marks it as pending. The bot fills that sku in, and the PIN search in
// the app then resolves the code without touching Apps Script.
//
// Nothing here may ever block or fail an order save. A queue failure means the
// code gets extracted later, not that the order is lost.

const SUPABASE_URL = "https://nbzgmrltykhadwyyesvd.supabase.co/rest/v1/orders";
// Publishable (anon) key - intended for client use; access governed by RLS.
const SUPABASE_KEY = "sb_publishable_wVJFTAiKIufi0Rv6GnpjPg_A9QReZ52";

const QUEUED_KEY = "sku_queue_submitted_v1";
const QUEUED_LIMIT = 300;

const readQueued = (): string[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(QUEUED_KEY) || "[]");
    return Array.isArray(saved) ? saved.map(String) : [];
  } catch {
    return [];
  }
};

const rememberQueued = (token: string) => {
  const queued = [token, ...readQueued().filter((saved) => saved !== token)];
  localStorage.setItem(QUEUED_KEY, JSON.stringify(queued.slice(0, QUEUED_LIMIT)));
};

export interface SkuQueueEntry {
  /** Customer identity as the SKU pipeline stores it - the Instagram handle. */
  name: string;
  /** The Shein link the bot opens to read the product codes. */
  link: string;
  /** Expected piece count, used by the bot as a sanity check. */
  pcs: string | number;
  /**
   * Stable per-submission id. The order form already generates one, and reusing
   * it here stops a retried save from queueing the same order twice.
   */
  requestId?: string;
}

/**
 * Add one pending row for the extractor bot. Resolves to true only when the row
 * was actually created.
 */
export async function queueOrderForSkuExtraction(entry: SkuQueueEntry): Promise<boolean> {
  const link = String(entry.link || "").trim();
  const name = String(entry.name || "").trim();

  // With no link there is nothing for the bot to open, so a row would just sit
  // pending forever and be retried on every pass.
  if (!link) return false;

  const token = String(entry.requestId || "").trim() || `${name}|${link}`;
  if (readQueued().includes(token)) return false;

  try {
    const response = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        name,
        link,
        // pcs is an integer column, so it is sent as a number. A blank or
        // non-numeric piece count would otherwise be rejected outright and the
        // order would never reach the bot's queue.
        pcs: Number.parseInt(String(entry.pcs ?? ""), 10) || 1,
        // Explicitly null: this is the flag sku.py filters on to find work.
        sku: null,
      }),
    });

    if (!response.ok) {
      console.warn(
        "Could not queue this order for SKU extraction",
        response.status,
        (await response.text()).slice(0, 200),
      );
      return false;
    }

    rememberQueued(token);
    return true;
  } catch (error) {
    console.warn("Could not queue this order for SKU extraction", error);
    return false;
  }
}
