import {
  getOrderStatus as getKurdistaniStatus,
  getCurrentOrderSheet,
  SCRIPT_URL,
  Order,
} from "@/types";
import {
  getOrderStatus as getIraqiStatus,
  getCurrentOrderSheet as getIraqiSheet,
  SCRIPT_URL as IRAQI_SCRIPT_URL,
} from "@/iraqi/types";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { supabase, ORDERS_TABLE, Branch, OrderInsert } from "@/lib/supabase";

/**
 * Order submission, written to the Google sheet and then to Supabase.
 *
 * Both copies are needed for now because nothing in the app reads orders from
 * Supabase yet — the order list, and every edit and status change, still work from
 * the sheet. An order saved only to Supabase would be invisible and uneditable, so
 * the sheet keeps a copy until reads and edits have moved across.
 *
 * The period is taken from the clock inside this module and never accepted from the
 * caller: the order form carries an "active sheet" that can still be pointing at
 * last month, so trusting it would file a brand-new order into July.
 */

/** The form fields this reads. Both order forms use these names. */
export interface OrderFormValues {
  name?: string;
  insta?: string;
  phone?: string;
  price?: string | number;
  place?: string;
  link?: string;
  pics_text?: string | number;
  initial_payment?: string | number;
  box_cost?: string | number;
  fib?: string;
  box_name?: string;
  trackNo?: string;
  /** Comma-joined lists of image urls, as the sheet stored them. */
  primary_urls?: string;
  proof_urls?: string;
  /** Status is not a field on either form — it travels as a [TAG] in these. */
  extra?: string;
  note?: string;
}

export interface SubmitContext {
  adminName: string;
  adminRole: string;
}

export interface SubmitResult {
  ok: boolean;
  row: OrderInsert | null;
  error: string | null;
  /** Row number the sheet assigned, which the edit path needs to find the order. */
  sheetRowId: number | null;
  /** Set when Supabase saved but the sheet copy did not, so it can be surfaced. */
  sheetError: string | null;
}

export interface SheetMirrorOptions {
  /**
   * The payload the order form already builds for Apps Script. Passed through so
   * the sheet copy is identical to what the sheet used to receive, rather than a
   * second, subtly different mapping of the same form.
   */
  sheetPayload?: Record<string, unknown>;
  /** Primary picture urls, which the sheet stores through a separate action. */
  primaryUrls?: string[];
}

/** Who is signed in, as the database sees them. */
export interface ActiveStaff {
  id: string | null;
  name: string | null;
  role: string | null;
}

// Looked up once per signed-in user. The profile does not change between orders, so
// re-reading it on every submit would add a round trip for nothing.
let cachedStaff: { userId: string; staff: ActiveStaff } | null = null;

/**
 * Reads the signed-in user from the Supabase session, and their name and role from
 * their `profiles` row.
 *
 * Taken from the session rather than anything the form or localStorage supplies, so
 * an order is always attributed to whoever is actually signed in — a stale or edited
 * local value cannot put someone else's name on it.
 */
export async function getActiveStaff(): Promise<ActiveStaff> {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return { id: null, name: null, role: null };
  if (cachedStaff?.userId === user.id) return cachedStaff.staff;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .single();

  if (error) {
    // The id is the part that matters and it is already known, so a missing profile
    // still attributes the order rather than losing it.
    console.warn(`[staff] no profile for the signed-in user: ${error.message}`);
    return { id: user.id, name: null, role: null };
  }

  const staff: ActiveStaff = {
    id: user.id,
    name: profile?.username ? String(profile.username) : null,
    role: profile?.role ? String(profile.role) : null,
  };
  cachedStaff = { userId: user.id, staff };
  return staff;
}

/** The month and year a new order belongs to: always now. */
export function getCurrentPeriod(now: Date = new Date()) {
  return { order_year: now.getFullYear() };
}

const text = (raw: unknown): string | null => {
  const value = String(raw ?? "").trim();
  return value ? value : null;
};

/**
 * Money columns are `bigint`, so only a whole number may be sent. Anything else
 * becomes null rather than being reduced to its digits — pulling numbers out of a
 * typo would store an amount nobody entered.
 */
function exactInt(raw: unknown): number | null {
  if (raw === "" || raw === null || raw === undefined) return null;
  const cleaned = String(raw).trim().replace(/[,\s]/g, "");
  if (!/^-?\d+(\.0+)?$/.test(cleaned)) return null;
  const value = Math.trunc(Number(cleaned));
  return Number.isSafeInteger(value) ? value : null;
}

/**
 * The order's date, written the way every existing row is written.
 *
 * Deliberately not `toISOString()`. All 1,138 dated rows hold the Baghdad wall-clock
 * reading — that is what the sheet always recorded and what the import preserved — so an
 * order stored as a true UTC instant would sit three hours away from its neighbours and
 * the reports would put it in the wrong hour, sometimes the wrong day. This keeps one
 * convention across the whole table; the reports read it back with `wallClock`.
 */
function wallClockStamp(at: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}` +
    `T${pad(at.getHours())}:${pad(at.getMinutes())}:${pad(at.getSeconds())}`
  );
}

export function buildOrderRow(
  form: OrderFormValues,
  ctx: SubmitContext,
  branch: Branch,
): OrderInsert {
  const now = new Date();
  const statusOf = branch === "iraqi" ? getIraqiStatus : getKurdistaniStatus;
  const sheetOf = branch === "iraqi" ? getIraqiSheet : getCurrentOrderSheet;

  return {
    // Filled in by insertOrder once the sheet has assigned one. Declared here so the
    // type will not let a row be built without deciding what it should be.
    sheet_row: null,
    date: wallClockStamp(now),
    insta: text(form.insta),
    name: text(form.name),
    place: text(form.place),
    // Text on purpose: a "+" prefix and a leading zero are both real parts of a
    // phone number and both disappear if it is stored as a number.
    phone: text(form.phone),
    fib: text(form.fib),
    price: exactInt(form.price),
    box_cost: exactInt(form.box_cost),
    pics_text: text(form.pics_text),
    initial_payment: exactInt(form.initial_payment),
    link: text(form.link),
    note: text(form.note),
    extra: text(form.extra),
    status: statusOf({ extra: form.extra, note: form.note } as Order),
    box_name: text(form.box_name),
    track_no: text(form.trackNo),
    primary_urls: text(form.primary_urls),
    proof_urls: text(form.proof_urls),
    admin_name: ctx.adminName,
    admin_role: ctx.adminRole,
    // Attached from the signed-in session just before the insert.
    staff_id: null,
    staff_name: ctx.adminName,
    staff_role: ctx.adminRole,
    // Filled in once the sheet has assigned a row number.
    unique_order_id: null,
    // Month name, matching the text column and the keys used everywhere else.
    order_month: sheetOf(now),
    order_year: now.getFullYear(),
    region: branch,
  };
}

/**
 * Writes the sheet's copy of the order.
 *
 * `sheet` is overridden with the current month: the form's own value can still say
 * July, which would put a brand-new August order in last month's tab. `row_id` is
 * blanked so Apps Script appends instead of overwriting an existing row.
 */
async function mirrorToSheet(
  scriptUrl: string,
  payload: Record<string, unknown>,
  month: string,
  primaryUrls: string[],
  orderKey: string,
): Promise<{ rowId: number | null; uniqueOrderId: string | null; error: string | null }> {
  // The key is generated here and handed to Apps Script, which stores whatever it is
  // given (and only invents a uuid when none arrives). Both copies therefore share
  // the same key without depending on the reply being parsed successfully.
  const body = {
    ...payload,
    sheet: month,
    sheet_name: month,
    row_id: "",
    unique_order_id: orderKey,
  };

  const response = await fetchWithRetry(scriptUrl, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const raw = await response.text();

  let result: { status?: string; message?: string; unique_order_id?: string } | null = null;
  try {
    result = JSON.parse(raw);
  } catch {
    return { rowId: null, uniqueOrderId: null, error: "Sheet returned a non-JSON response" };
  }
  if (result?.status !== "success") {
    return {
      rowId: null,
      uniqueOrderId: null,
      error: result?.message || "Sheet rejected the order",
    };
  }

  // "Created Row 12" / "Updated Row 12". Useful for the edit path, but no longer
  // what the two copies are matched on.
  const match = String(result.message || "").match(/Row (\d+)/);
  const rowId = match ? Number(match[1]) : null;
  const uniqueOrderId = String(result.unique_order_id || orderKey);

  // The create handler only stores one image column, so the full list goes through
  // the dedicated action once the row number is known.
  if (rowId && primaryUrls.length > 0) {
    fetchWithRetry(scriptUrl, {
      method: "POST",
      body: JSON.stringify({
        action: "update_primary_picture",
        sheet_name: month,
        row_id: rowId,
        primary_urls: primaryUrls.join(","),
      }),
    }).catch((err) => console.error("Primary urls save failed", err));
  }

  return { rowId, uniqueOrderId, error: null };
}

/**
 * Saves the order to the sheet, then to Supabase.
 *
 * The sheet is written first because it is the only thing that assigns a row number,
 * and that number is the handle every later edit and delete uses. Writing Supabase
 * first left rows with nothing to match them back to, which is why a deleted order
 * stayed behind in Supabase.
 *
 * If the sheet write fails nothing is saved at all, so a retry cannot duplicate. If
 * the sheet accepts it but Supabase does not, the order is reported as saved with
 * `sheetError` explaining that Supabase is missing its copy.
 */
/**
 * Saves an order: Supabase first, then the sheet.
 *
 * The order used to go to the sheet first, because the sheet was the only thing that could
 * assign a row number and that number was how every later edit and delete found the order.
 * The consequence was that a slow or broken sheet meant the order was not saved at all — and
 * worse, the row number never made it onto the Supabase row, so orders landed in the database
 * and were then skipped on the way back out.
 *
 * Supabase is the record now. The order is written there and exists from that moment. The
 * sheet is a copy made afterwards, and if it fails the order is still saved — the row number
 * is simply written back later, or not at all. Losing the copy is an inconvenience; losing
 * the order is not acceptable.
 */
async function insertOrder(
  form: OrderFormValues,
  ctx: SubmitContext,
  branch: Branch,
  mirror: SheetMirrorOptions = {},
): Promise<SubmitResult> {
  const row = buildOrderRow(form, ctx, branch);
  const table = ORDERS_TABLE[branch];

  if (!row.name && !row.insta) {
    const message = "Enter a customer name or an Instagram handle before saving.";
    console.error(`[${table}] not submitted:`, message);
    return { ok: false, row: null, error: message, sheetRowId: null, sheetError: null };
  }

  // Made here, before either write, so both copies carry the same key whatever the sheet
  // replies with. This is what a later edit or delete matches on.
  const orderKey =
    globalThis.crypto?.randomUUID?.() ??
    `${branch}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Who is signed in, straight from the session and their profile.
  const staff = await getActiveStaff();
  if (!staff.id) {
    console.warn(`[${table}] no signed-in user — this order will have no staff recorded`);
  }

  const linked: OrderInsert = {
    ...row,
    // Filled in below once the sheet has assigned one. An order without a sheet row is
    // still shown and still editable — loadOrders keys it by its id instead.
    sheet_row: null,
    staff_id: staff.id,
    // The profile is the source of truth; the values the form passed are only used if the
    // profile could not be read.
    staff_name: staff.name ?? row.staff_name,
    staff_role: staff.role ?? row.staff_role,
    unique_order_id: orderKey,
  };

  // ---- 1. Supabase. If this fails, nothing is saved anywhere. ----
  const { error } = await supabase.from(table).insert(linked);
  if (error) {
    // code and hint name the failing policy or missing column, separating "the table
    // rejected this" from "the request never arrived".
    console.error(`[${table}] insert failed, nothing saved:`, error.message, {
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    const message =
      error.code === "42501"
        ? "The database refused this order for this account. Check its profile row."
        : `Could not save the order: ${error.message}`;
    return { ok: false, row: null, error: message, sheetRowId: null, sheetError: null };
  }

  console.log(
    `[${table}] saved: ${linked.order_month} ${linked.order_year} —`,
    linked.name || linked.insta,
    `by ${linked.staff_name ?? "unknown"} (${linked.staff_role ?? "?"})`,
  );

  // ---- 2. The sheet, as a copy. A failure here does not lose the order. ----
  if (!mirror.sheetPayload) {
    return { ok: true, row: linked, error: null, sheetRowId: null, sheetError: null };
  }

  const scriptUrl = branch === "iraqi" ? IRAQI_SCRIPT_URL : SCRIPT_URL;
  let sheetRowId: number | null = null;
  let sheetProblem: string | null = null;
  try {
    const mirrored = await mirrorToSheet(
      scriptUrl,
      mirror.sheetPayload,
      row.order_month,
      mirror.primaryUrls ?? [],
      orderKey,
    );
    if (mirrored.error) sheetProblem = mirrored.error;
    else {
      sheetRowId = mirrored.rowId;
      console.log(`[${table}] sheet copy at row ${sheetRowId} in ${row.order_month}`);
    }
  } catch (err) {
    sheetProblem = err instanceof Error ? err.message : String(err);
  }

  // ---- 3. Write the sheet's row number back onto the saved order. ----
  //
  // Matched on the key rather than the row number, because the key is the one thing both
  // copies were given before either write.
  if (sheetRowId !== null) {
    const { error: linkError } = await supabase
      .from(table)
      .update({ sheet_row: sheetRowId })
      .eq("unique_order_id", orderKey);
    if (linkError) {
      console.warn(`[${table}] could not store sheet row ${sheetRowId}:`, linkError.message);
    } else {
      linked.sheet_row = sheetRowId;
    }
  }

  if (sheetProblem) {
    console.warn(`[${table}] order saved, sheet copy failed:`, sheetProblem);
    return {
      ok: true,
      row: linked,
      error: null,
      sheetRowId: null,
      sheetError: `The order is saved. The Google Sheet copy failed: ${sheetProblem}`,
    };
  }

  return { ok: true, row: linked, error: null, sheetRowId, sheetError: null };
}

/**
 * The two forms an order's key can take. Historical rows were given a key derived
 * from their month and row because the sheet had none of its own; newer rows carry
 * the sheet's uuid. Both are tried so every order is reachable.
 */
function orderKeys(
  branch: Branch,
  order: { unique_order_id?: string | null; sheet_name?: string | null; id?: string | number },
): string[] {
  return [
    String(order.unique_order_id || "").trim(),
    order.sheet_name && order.id !== undefined ? `${branch}:${order.sheet_name}:${order.id}` : "",
  ].filter(Boolean);
}

/** Columns an edit or status change is allowed to touch. */
export interface OrderUpdate {
  insta?: string | null;
  name?: string | null;
  place?: string | null;
  phone?: string | null;
  fib?: string | null;
  price?: number | null;
  box_cost?: number | null;
  pics_text?: string | null;
  shipping_cost?: number | null;
  box_name?: string | null;
  lost?: number | null;
  profit?: number | null;
  track_no?: string | null;
  initial_payment?: number | null;
  link?: string | null;
  note?: string | null;
  extra?: string | null;
  status?: string | null;
  primary_urls?: string | null;
  proof_urls?: string | null;
  is_finished?: boolean | null;
}

export interface UpdateResult {
  ok: boolean;
  /** How many Supabase rows matched. Zero means the order is not in Supabase yet. */
  supabaseUpdated: number;
  error: string | null;
}

/**
 * Applies an edit or status change to Supabase.
 *
 * The month, year and region are deliberately not updatable: an edit changes an
 * order's details, never which month it belongs to.
 *
 * A count of zero is not an error — an order that predates the migration, or one
 * added while Supabase was unreachable, simply has no row yet. The caller can carry
 * on writing the sheet, which is still the working copy.
 */
export async function updateOrderEverywhere(
  branch: Branch,
  order: { unique_order_id?: string | null; sheet_name?: string | null; id?: string | number },
  updates: OrderUpdate,
): Promise<UpdateResult> {
  const table = ORDERS_TABLE[branch];
  const keys = orderKeys(branch, order);

  if (!keys.length) {
    console.warn(`[${table}] order has no key to match on — Supabase not updated`);
    return { ok: true, supabaseUpdated: 0, error: null };
  }

  // Undefined fields are dropped so an edit never blanks a column it did not touch.
  const patch: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(updates)) {
    if (value !== undefined) patch[field] = value;
  }
  if (!Object.keys(patch).length) return { ok: true, supabaseUpdated: 0, error: null };

  const { data, error } = await supabase
    .from(table)
    .update(patch)
    .in("unique_order_id", keys)
    .select("unique_order_id");

  if (error) {
    console.error(`[${table}] update failed for ${keys[0]}:`, error.message, {
      code: error.code,
      hint: error.hint,
    });
    return { ok: false, supabaseUpdated: 0, error: error.message };
  }

  const count = data?.length ?? 0;
  if (count === 0) console.warn(`[${table}] no Supabase row matched ${keys.join(" or ")}`);
  else console.log(`[${table}] updated ${count} row(s):`, Object.keys(patch).join(", "));
  return { ok: true, supabaseUpdated: count, error: null };
}

export interface DeleteResult {
  ok: boolean;
  /** How many Supabase rows matched. Zero means the key did not line up. */
  supabaseDeleted: number;
  error: string | null;
}

/**
 * Removes an order from Supabase, matched on the key both copies share.
 *
 * Supabase goes first so a failure stops the whole delete: the order stays in both
 * places and can be retried. Doing the sheet first is what produced the orphan —
 * the sheet copy vanished while Supabase kept its row.
 *
 * A match count of zero is reported rather than treated as success, since that is
 * true of any order created before the key was being written.
 */
export async function deleteOrderEverywhere(
  branch: Branch,
  order: { unique_order_id?: string | null; sheet_name?: string | null; id?: string | number },
): Promise<DeleteResult> {
  const table = ORDERS_TABLE[branch];

  // Most historical rows never had a key of their own in the sheet, so the migration
  // gave them one derived from their month and row. Both forms are tried: the sheet's
  // own key first, then the derived one. Matching on name or price instead could
  // delete a different customer's order, so it is never attempted.
  const keys = orderKeys(branch, order);

  if (!keys.length) {
    console.warn(`[${table}] order has no key to match on — nothing deleted there`);
    return { ok: true, supabaseDeleted: 0, error: null };
  }
  const key = keys[0];

  const { data, error } = await supabase
    .from(table)
    .delete()
    .in("unique_order_id", keys)
    .select("unique_order_id");

  if (error) {
    console.error(`[${table}] delete failed for ${key}:`, error.message, {
      code: error.code,
      hint: error.hint,
    });
    return { ok: false, supabaseDeleted: 0, error: error.message };
  }

  const count = data?.length ?? 0;
  if (count === 0) console.warn(`[${table}] no Supabase row matched ${key}`);
  else console.log(`[${table}] deleted ${count} row(s) for ${key}`);
  return { ok: true, supabaseDeleted: count, error: null };
}

/** Kurdistani orders — Supabase table plus the Kurdistani sheet. */
export function submitKurdistaniOrder(
  form: OrderFormValues,
  ctx: SubmitContext,
  mirror?: SheetMirrorOptions,
) {
  return insertOrder(form, ctx, "kurdistani", mirror);
}

/**
 * Whether the Iraqi branch may take new orders.
 *
 * Closed. Every order goes to the Kurdistani table, and the Iraqi one is empty on purpose —
 * its orders were moved across. Flip this to true to reopen it; nothing else needs changing.
 */
export const IRAQI_ORDERS_OPEN = false;

/**
 * Iraqi orders — refused while the branch is closed.
 *
 * The refusal lives here rather than in the form, because this is the single door every
 * Iraqi order has to come through. Hiding a button would leave the door open behind it.
 */
export function submitIraqiOrder(
  form: OrderFormValues,
  ctx: SubmitContext,
  mirror?: SheetMirrorOptions,
): Promise<SubmitResult> {
  if (!IRAQI_ORDERS_OPEN) {
    const message =
      "The Iraqi branch is closed. Every order goes to Kurdistani — place it there instead.";
    console.warn(`[orders_iraqi] refused: ${message}`);
    // Nothing is written anywhere: no Supabase row and no sheet row, so a refused order
    // cannot leave half a record behind.
    return Promise.resolve({
      ok: false,
      row: null,
      error: message,
      sheetRowId: null,
      sheetError: null,
    });
  }
  return insertOrder(form, ctx, "iraqi", mirror);
}
