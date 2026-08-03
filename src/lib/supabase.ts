import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for the browser.
 *
 * The key below is a *publishable* key, which is designed to be shipped in client
 * code — it carries no privileges of its own. Everything it is allowed to do is
 * decided by Row Level Security policies on the table, so those policies are the
 * only thing standing between this key and the orders table.
 *
 * Both values can be overridden per environment; the literals are the fallback so
 * the app still works if the variables are not set.
 */
// Optional-chained because `import.meta.env` only exists where Vite defines it;
// reading it directly throws at import time anywhere else.
const SUPABASE_URL =
  import.meta.env?.VITE_SUPABASE_URL || "https://rjwpvgzpyxgwlsanwwvd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_cywlx9aL7kwcSy9awp2jnQ_P9zwLVgV";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // The session has to outlive a page reload. Row Level Security decides what a
    // request may do from the signed-in user, so a client that forgets its session
    // falls back to anonymous and every insert is refused after a refresh.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

/**
 * One table per branch, so Kurdistani and Iraqi rows cannot end up in the same
 * place. A shared table with a region filter would rely on every single query
 * remembering that filter; a missed `.eq()` would silently mix the two.
 */
export const ORDERS_TABLE = {
  kurdistani: "orders_kurdistani",
  iraqi: "orders_iraqi",
} as const;

export type Branch = keyof typeof ORDERS_TABLE;

/**
 * The columns the order tables expect.
 *
 * Deliberately limited to the columns that exist in the tables. Postgres rejects
 * an insert naming a column it does not have, so sending anything extra — a
 * human-readable month label, for instance — would fail every save rather than
 * being ignored.
 */
export interface OrderInsert {
  /**
   * The order's row number in the Google Sheet.
   *
   * Not optional by accident — it is the handle every edit and delete uses to find an
   * order, and `loadOrders` throws away any row that has none. An insert that omitted it
   * landed in the table and was then invisible in the app, which is exactly what happened
   * to new orders: written to Supabase, skipped on the way back out.
   */
  sheet_row: number | null;
  date: string | null;
  insta: string | null;
  name: string | null;
  place: string | null;
  /** Text, not a number — "+964…" and leading zeros are real and must survive. */
  phone: string | null;
  fib: string | null;
  price: number | null;
  box_cost: number | null;
  pics_text: string | null;
  initial_payment: number | null;
  link: string | null;
  note: string | null;
  extra: string | null;
  status: string | null;
  box_name: string | null;
  track_no: string | null;
  /** Comma-joined lists, matching how the sheet stored them. */
  primary_urls: string | null;
  proof_urls: string | null;
  admin_name: string | null;
  admin_role: string | null;
  /**
   * Who created the order.
   *
   * `staff_id` is the Supabase user id and is what the security policies match on —
   * a name can be changed or repeated, an id cannot. The name and role are stored
   * alongside it so the app can show who took an order without a second lookup.
   */
  staff_id: string | null;
  staff_name: string | null;
  staff_role: string | null;
  /**
   * Stable key of the form "region:month:sheetRow". It is what ties a Supabase row
   * to its sheet row, so an order can be found again to edit or delete. Migrated
   * rows already carry it in this shape.
   */
  unique_order_id: string | null;
  /** Month name such as "Aug", matching the text column in both tables. */
  order_month: string;
  order_year: number;
  /** Kept on the row as well as in the table name, so a row is self-describing. */
  region: Branch;
}
