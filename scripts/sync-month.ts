/**
 * Copies one month's orders from the Google Sheet into Supabase.
 *
 *   npm run sync-month -- --month=Aug                    # dry run, writes nothing
 *   npm run sync-month -- --month=Aug --commit
 *   npm run sync-month -- --month=Aug --branch=iraqi --commit
 *
 * Written for the gap left while the migration was in progress: orders added during
 * those days reached the sheet but not Supabase.
 *
 * Safety rules:
 *   - Dry run is the default; --commit is required to write.
 *   - Google is read with GET only and never modified.
 *   - Supabase rows are only ever INSERTed. Nothing here updates or deletes an
 *     existing row, so an order already in Supabase is left exactly as it is.
 *   - An order already present is skipped, matched on its sheet row and on its key,
 *     so running this twice cannot duplicate anything.
 *   - `sheet_row` is always set, because every edit and delete finds an order in the
 *     sheet by row number.
 *   - Money is copied exactly or left null, never coerced from text.
 */
import { createClient } from "@supabase/supabase-js";
import { getOrderStatus, Order, YEARS_CONFIG } from "../src/types";
import { YEARS_CONFIG as IRAQI_YEARS_CONFIG } from "../src/iraqi/types";
import { getWarningImageSource } from "../src/lib/warning-image";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://rjwpvgzpyxgwlsanwwvd.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || "";

const BRANCHES = {
  kurdistani: {
    table: "orders_kurdistani",
    scriptUrl:
      "https://script.google.com/macros/s/AKfycbwWF-1pFpNaIq9qx2BrMVU5qiEduvrgnOiejDmdc0e975LPmbfCSIqzGsg6dR5mWBM/exec",
    config: YEARS_CONFIG,
  },
  iraqi: {
    table: "orders_iraqi",
    scriptUrl:
      "https://script.google.com/macros/s/AKfycbwYc-fXYeZv8iQd4zyMExvSHZ3lsVtPVSbgfkmn37s5sE-cnvGjufYvdXWJXTiu23Q/exec",
    config: IRAQI_YEARS_CONFIG,
  },
} as const;
type Branch = keyof typeof BRANCHES;

const args = process.argv.slice(2);
const value = (name: string) => {
  const hit = args.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1).trim() : null;
};
const month = value("--month");
const branch = (value("--branch") || "kurdistani") as Branch;
const commit = args.includes("--commit");

if (!month || !(branch in BRANCHES)) {
  console.error("Usage: npm run sync-month -- --month=Aug [--branch=kurdistani|iraqi] [--commit]");
  process.exit(1);
}
// Needed even for a dry run: the script has to read what Supabase already holds to
// work out what is genuinely missing, and Row Level Security refuses an anonymous read.
if (!SUPABASE_KEY) {
  console.error("Set SUPABASE_SECRET_KEY — it is needed to read Supabase, not only to write.");
  console.error("  SUPABASE_SECRET_KEY=sb_secret_... npm run sync-month -- --month=Aug");
  process.exit(1);
}

const { table, scriptUrl, config } = BRANCHES[branch];

/** The year this month belongs to, taken from the branch's own month list. */
function yearOf(name: string): number | null {
  for (const [year, months] of Object.entries(config)) {
    if (months.includes(name)) return Number(year);
  }
  return null;
}

const year = yearOf(month);
if (year === null) {
  console.error(
    `"${month}" is not a month in ${branch}. Known: ${Object.values(config).flat().join(", ")}`,
  );
  process.exit(1);
}

const text = (raw: unknown): string | null => {
  const value = String(raw ?? "").trim();
  return value ? value : null;
};

/**
 * Only an exact whole number is sent. A value holding anything else — a SKU, a link,
 * a note — becomes null rather than being reduced to its digits, which would store an
 * amount that was never entered.
 */
function exactInt(raw: unknown): number | null {
  if (raw === "" || raw === null || raw === undefined) return null;
  const cleaned = String(raw).trim().replace(/[,\s]/g, "");
  if (!/^-?\d+(\.0+)?$/.test(cleaned)) return null;
  const value = Math.trunc(Number(cleaned));
  return Number.isSafeInteger(value) ? value : null;
}

/** "13/08" and "01/08 09:05" carry no year, so it comes from the month being synced. */
function toTimestamp(raw: unknown): string | null {
  const value = String(raw ?? "").trim();
  if (!value || /unknown/i.test(value)) return null;
  const full = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (full) {
    const [, d, m, y, hh = "0", mm = "0"] = full;
    return new Date(Date.UTC(+y, +m - 1, +d, +hh, +mm)).toISOString();
  }
  const short = value.match(/^(\d{1,2})\/(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?$/);
  if (short) {
    const [, d, m, hh = "0", mm = "0"] = short;
    return new Date(Date.UTC(year, +m - 1, +d, +hh, +mm)).toISOString();
  }
  return null;
}

function toRow(order: Order) {
  const sheetRow = Number(order.id);
  const linked = Array.isArray(order.linkedOrderIds) ? order.linkedOrderIds.filter(Boolean) : [];
  return {
    sheet_row: Number.isFinite(sheetRow) ? sheetRow : null,
    // The sheet's own key when it has one, otherwise the same derived form the
    // migration used, so the app can rebuild it from the month and row.
    unique_order_id: text(order.unique_order_id) ?? `${branch}:${month}:${sheetRow}`,
    date: toTimestamp(order.date),
    insta: text(order.insta),
    name: text(order.name),
    place: text(order.place),
    phone: text(order.phone),
    fib: text(order.fib),
    price: exactInt(order.price),
    box_cost: exactInt(order.box_cost),
    pics_text: text(order.pics_text),
    shipping_cost: exactInt(order.shipping_cost),
    box_name: text(order.box_name),
    lost: exactInt(order.lost),
    profit: exactInt(order.profit),
    track_no: text(order.trackNo),
    initial_payment: exactInt(order.initial_payment),
    link: text(order.link),
    note: text(order.note),
    extra: text(order.extra),
    status: getOrderStatus(order),
    primary_urls: text(order.primary_urls),
    proof_urls: Array.isArray(order.proof_urls)
      ? text(order.proof_urls.join(","))
      : text(order.proof_urls),
    warning_url: text(getWarningImageSource(order as unknown as Record<string, unknown>)),
    admin_name: text(order.admin_name),
    admin_role: text(order.admin_role),
    linked_order_ids: linked.length ? linked.join(",") : null,
    is_finished: typeof order.is_finished === "boolean" ? order.is_finished : null,
    order_month: month,
    order_year: year,
    region: branch,
  };
}

console.log(`\nSyncing ${branch} ${month} ${year} -> ${table}`);
console.log(commit ? "MODE: COMMIT (rows will be inserted)" : "MODE: DRY RUN (nothing written)");
console.log("Google Sheets: read only, never modified\n");

// --- read the sheet, with retries so a dropped request is not read as "no orders" ---
let sheetOrders: Order[] = [];
let read = false;
for (let attempt = 1; attempt <= 3 && !read; attempt++) {
  try {
    process.stdout.write(`  reading ${month} from the sheet … `);
    const response = await fetch(`${scriptUrl}?month=${encodeURIComponent(month)}`, {
      redirect: "follow",
    });
    const json = JSON.parse(await response.text()) as { data?: Order[] };
    sheetOrders = Array.isArray(json.data) ? json.data : [];
    console.log(`${sheetOrders.length} orders`);
    read = true;
  } catch (error) {
    console.log(`failed (${error instanceof Error ? error.message : String(error)})`);
    if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 2000));
  }
}
if (!read) {
  console.error("Could not read the sheet after 3 attempts. Nothing was written.");
  process.exit(1);
}
if (!sheetOrders.length) {
  console.log("\nThe sheet has no orders for this month. Nothing to do.");
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// --- what is already in Supabase for this month ---
const { data: existing, error: readError } = await supabase
  .from(table)
  .select("sheet_row, unique_order_id")
  .eq("order_month", month)
  .eq("order_year", year);

if (readError) {
  console.error(`Could not read ${table}: ${readError.message}`);
  process.exit(1);
}
const haveRows = new Set((existing ?? []).map((r) => Number(r.sheet_row)));
const haveKeys = new Set((existing ?? []).map((r) => String(r.unique_order_id)));
console.log(`  already in Supabase: ${existing?.length ?? 0}`);

// --- decide what is genuinely missing ---
const toInsert: ReturnType<typeof toRow>[] = [];
const skippedExisting: number[] = [];
const skippedNoRow: string[] = [];

for (const order of sheetOrders) {
  const row = toRow(order);
  if (row.sheet_row === null) {
    // Without a row number the order could not be edited later, and it could not be
    // matched to avoid a duplicate either.
    skippedNoRow.push(String(order.insta || order.name || "(unnamed)"));
    continue;
  }
  if (haveRows.has(row.sheet_row) || haveKeys.has(row.unique_order_id)) {
    skippedExisting.push(row.sheet_row);
    continue;
  }
  toInsert.push(row);
}

console.log(`  already present, skipped: ${skippedExisting.length}`);
console.log(`  missing, to insert      : ${toInsert.length}`);
if (skippedNoRow.length) {
  console.warn(`  ! ${skippedNoRow.length} order(s) had no row number and were skipped:`);
  console.warn(`    ${JSON.stringify(skippedNoRow.slice(0, 5))}`);
}

if (toInsert.length) {
  console.log(`\n  sample row to insert:\n  ${JSON.stringify(toInsert[0])}`);
  const sum = (field: "price" | "box_cost" | "shipping_cost" | "lost" | "profit") =>
    toInsert.reduce((total, row) => total + (row[field] ?? 0), 0);
  console.log("\n  figures being added (compare after the run):");
  for (const field of ["price", "box_cost", "shipping_cost", "lost", "profit"] as const) {
    console.log(`    ${field.padEnd(15)} ${sum(field).toLocaleString()}`);
  }
}

if (!commit) {
  console.log("\nDry run complete — nothing was written.");
  console.log(
    `To sync for real:  npm run sync-month -- --month=${month} --branch=${branch} --commit`,
  );
  process.exit(0);
}
if (!toInsert.length) {
  console.log("\nSupabase is already up to date for this month.");
  process.exit(0);
}

const BATCH = 200;
let inserted = 0;
const failures: string[] = [];
for (let start = 0; start < toInsert.length; start += BATCH) {
  const batch = toInsert.slice(start, start + BATCH);
  const { error } = await supabase.from(table).insert(batch);
  if (error) {
    failures.push(`rows ${start + 1}-${start + batch.length}: ${error.message}`);
    console.error(`  batch ${start + 1}-${start + batch.length} FAILED: ${error.message}`);
    if (error.hint) console.error(`    hint: ${error.hint}`);
  } else {
    inserted += batch.length;
    console.log(`  inserted ${inserted}/${toInsert.length}`);
  }
}

console.log(`\nAdded ${inserted} of ${toInsert.length} orders to ${table}.`);
if (failures.length) {
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}
console.log("Google Sheets was not modified. Existing Supabase rows were not touched.");
