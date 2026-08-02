/**
 * Copies existing orders into Supabase. Copy only — nothing is deleted or changed
 * anywhere, and nothing is ever written back to Google.
 *
 *   npm run migrate -- --branch=kurdistani              # dry run, writes nothing
 *   npm run migrate -- --branch=kurdistani --limit=5 --commit
 *   npm run migrate -- --branch=kurdistani --commit
 *
 * Safety rules:
 *   - Dry run is the default; --commit is required to write.
 *   - Google is read, never written. Kurdistani reads the local snapshot, so the
 *     default path does not contact Google at all.
 *   - Supabase is only ever INSERTed into. No update, upsert, delete or truncate.
 *   - Stops if the target table already holds rows, unless --allow-existing.
 *   - Money and box figures are copied exactly or left null. A value that is not a
 *     clean whole number is never coerced into one, because digits pulled out of a
 *     URL or a SKU would read as a real amount.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { YEARS_CONFIG, getOrderStatus, Order } from "../src/types";
import { YEARS_CONFIG as IRAQI_YEARS_CONFIG } from "../src/iraqi/types";
import { getWarningImageSource } from "../src/lib/warning-image";
import { CLEARED_MONTHS } from "../src/lib/cleared-months";

const SNAPSHOT_PATH = resolve(process.cwd(), "data/orders-snapshot.json");
const SUPABASE_URL = process.env.SUPABASE_URL || "https://rjwpvgzpyxgwlsanwwvd.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_cywlx9aL7kwcSy9awp2jnQ_P9zwLVgV";

const TABLES = { kurdistani: "orders_kurdistani", iraqi: "orders_iraqi" } as const;
type Branch = keyof typeof TABLES;

const KURDISTANI_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwWF-1pFpNaIq9qx2BrMVU5qiEduvrgnOiejDmdc0e975LPmbfCSIqzGsg6dR5mWBM/exec";

const IRAQI_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwYc-fXYeZv8iQd4zyMExvSHZ3lsVtPVSbgfkmn37s5sE-cnvGjufYvdXWJXTiu23Q/exec";

const MONTH_PREFIXES = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/** Mirrors the table exactly; every column is optional so a sparse legacy row still inserts. */
interface Row {
  date: string | null;
  insta: string | null;
  name: string | null;
  place: string | null;
  phone: string | null;
  fib: string | null;
  price: number | null;
  box_cost: number | null;
  pics_text: string | null;
  shipping_cost: number | null;
  box_name: string | null;
  lost: number | null;
  profit: number | null;
  track_no: string | null;
  initial_payment: number | null;
  link: string | null;
  note: string | null;
  extra: string | null;
  status: string | null;
  primary_urls: string | null;
  proof_urls: string | null;
  warning_url: string | null;
  unique_order_id: string | null;
  admin_name: string | null;
  admin_role: string | null;
  linked_order_ids: string | null;
  is_finished: boolean | null;
  order_month: string | null;
  order_year: number | null;
  region: Branch;
}

/** Tally of values that could not be copied as numbers, reported at the end. */
const rejected: Record<string, { count: number; samples: string[] }> = {};

function noteRejected(field: string, raw: string) {
  const entry = (rejected[field] ??= { count: 0, samples: [] });
  entry.count += 1;
  if (entry.samples.length < 4) entry.samples.push(raw);
}

/**
 * Returns the value only if it is exactly a whole number. Thousands separators are
 * removed and a ".0" tail is tolerated, but anything containing other characters —
 * a URL, a SKU, a date, a status tag — is rejected rather than reduced to its
 * digits, which would invent an amount that was never in the sheet.
 */
function exactInt(raw: unknown, field: string): number | null {
  if (raw === "" || raw === null || raw === undefined) return null;
  const text = String(raw).trim();
  if (!text) return null;
  const cleaned = text.replace(/[,\s]/g, "");
  if (!/^-?\d+(\.0+)?$/.test(cleaned)) {
    noteRejected(field, text);
    return null;
  }
  const value = Math.trunc(Number(cleaned));
  if (!Number.isSafeInteger(value)) {
    noteRejected(field, text);
    return null;
  }
  return value;
}

const text = (raw: unknown): string | null => {
  const value = String(raw ?? "").trim();
  return value ? value : null;
};

/**
 * The app stores dates without a year ("13/08", "01/11 00:00"), so the year comes
 * from the month the order is filed under. Built in UTC so the calendar day cannot
 * shift, and left null when the format is not recognised rather than guessed at.
 */
function toTimestamp(raw: unknown, year: number): string | null {
  const value = String(raw ?? "").trim();
  if (!value || /unknown/i.test(value)) return null;

  const full = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (full) {
    const [, d, m, y, hh = "0", mm = "0"] = full;
    return new Date(
      Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm)),
    ).toISOString();
  }

  const short = value.match(/^(\d{1,2})\/(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?$/);
  if (short) {
    const [, d, m, hh = "0", mm = "0"] = short;
    return new Date(Date.UTC(year, Number(m) - 1, Number(d), Number(hh), Number(mm))).toISOString();
  }
  return null;
}

function buildPeriodLookup(config: Record<string, string[]>) {
  const lookup = new Map<string, { month: string; year: number }>();
  for (const [year, months] of Object.entries(config)) {
    for (const name of months) {
      const key = name
        .toLowerCase()
        .replace(/[^a-z]/g, "")
        .slice(0, 3);
      if (MONTH_PREFIXES.includes(key)) lookup.set(name, { month: name, year: Number(year) });
    }
  }
  return lookup;
}

/**
 * Maps one order onto the table.
 *
 * `id` is left to the table's own sequence; the sheet's row id is preserved in
 * `unique_order_id` instead, so the original order can always be traced back to the
 * month and row it came from without fighting the identity column.
 */
function toRow(order: Order, branch: Branch, period: { month: string; year: number }): Row {
  const linked = Array.isArray(order.linkedOrderIds) ? order.linkedOrderIds.filter(Boolean) : [];
  const sheet = String(order.sheet_name || period.month);

  return {
    date: toTimestamp(order.date, period.year),
    insta: text(order.insta),
    name: text(order.name),
    place: text(order.place),
    // Kept verbatim as text: a "+" prefix, a leading zero and two numbers in one
    // cell are all real, and all of them are lost the moment this becomes a number.
    phone: text(order.phone),
    fib: text(order.fib),
    price: exactInt(order.price, "price"),
    box_cost: exactInt(order.box_cost, "box_cost"),
    pics_text: text(order.pics_text),
    shipping_cost: exactInt(order.shipping_cost, "shipping_cost"),
    box_name: text(order.box_name),
    lost: exactInt(order.lost, "lost"),
    profit: exactInt(order.profit, "profit"),
    track_no: text(order.trackNo),
    initial_payment: exactInt(order.initial_payment, "initial_payment"),
    link: text(order.link),
    note: text(order.note),
    extra: text(order.extra),
    status: getOrderStatus(order),
    primary_urls: text(order.primary_urls),
    proof_urls: Array.isArray(order.proof_urls)
      ? text(order.proof_urls.join(","))
      : text(order.proof_urls),
    warning_url: text(getWarningImageSource(order as unknown as Record<string, unknown>)),
    // The sheet only carries its own key on newer rows. For the rest the key is
    // derived from the month and row number, which the app can rebuild from the
    // order it already has — so a delete can still find the row without anything
    // being written back into the sheet.
    unique_order_id: text(order.unique_order_id) ?? `${branch}:${sheet}:${order.id}`,
    admin_name: text(order.admin_name),
    admin_role: text(order.admin_role),
    linked_order_ids: linked.length ? linked.join(",") : null,
    is_finished: typeof order.is_finished === "boolean" ? order.is_finished : null,
    order_month: period.month,
    order_year: period.year,
    region: branch,
  };
}

function readKurdistani(): { rows: Row[]; skipped: string[] } {
  const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8")) as {
    months: Record<string, Order[]>;
  };
  const lookup = buildPeriodLookup(YEARS_CONFIG);
  const rows: Row[] = [];
  const skipped: string[] = [];

  for (const [month, orders] of Object.entries(snapshot.months)) {
    const period = lookup.get(month);
    if (!period) {
      skipped.push(`${month} (${orders.length} orders — month name not recognised)`);
      continue;
    }
    for (const order of orders) rows.push(toRow(order, "kurdistani", period));
  }
  return { rows, skipped };
}

/**
 * Reads a branch's months from its Apps Script with GET requests only.
 *
 * Preferred over the snapshot file for a re-migration: the snapshot is a point in
 * time, so anything edited in the sheet since it was made would be silently rolled
 * back to the older values.
 */
async function readFromSheet(
  branch: Branch,
  scriptUrl: string,
  config: Record<string, string[]>,
): Promise<{ rows: Row[]; skipped: string[] }> {
  const lookup = buildPeriodLookup(config);
  const rows: Row[] = [];
  const skipped: string[] = [];

  for (const [month, period] of lookup) {
    process.stdout.write(`  reading ${month} … `);
    // Apps Script drops requests now and then. One silent failure would leave a whole
    // month out of the copy, so each is retried before being given up on.
    let lastError = "";
    let done = false;
    for (let attempt = 1; attempt <= 3 && !done; attempt++) {
      try {
        const response = await fetch(`${scriptUrl}?month=${encodeURIComponent(month)}`, {
          redirect: "follow",
        });
        const json = JSON.parse(await response.text()) as { data?: Order[] };
        const orders = Array.isArray(json.data) ? json.data : [];
        for (const order of orders) rows.push(toRow(order, branch, period));
        console.log(`${orders.length} orders`);
        done = true;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        if (attempt < 3) {
          process.stdout.write(`retry ${attempt} … `);
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        }
      }
    }
    if (!done) {
      skipped.push(`${month} (${lastError})`);
      console.log("FAILED after 3 attempts");
    }
  }
  return { rows, skipped };
}

async function readIraqi(): Promise<{ rows: Row[]; skipped: string[] }> {
  const lookup = buildPeriodLookup(IRAQI_YEARS_CONFIG);
  const rows: Row[] = [];
  const skipped: string[] = [];

  for (const [month, period] of lookup) {
    process.stdout.write(`  reading ${month} … `);
    try {
      const response = await fetch(`${IRAQI_SCRIPT_URL}?month=${encodeURIComponent(month)}`, {
        redirect: "follow",
      });
      const json = JSON.parse(await response.text()) as { data?: Order[] };
      const orders = Array.isArray(json.data) ? json.data : [];
      for (const order of orders) rows.push(toRow(order, "iraqi", period));
      console.log(`${orders.length} orders`);
    } catch (error) {
      skipped.push(`${month} (${error instanceof Error ? error.message : String(error)})`);
      console.log("failed");
    }
  }
  return { rows, skipped };
}

/**
 * Picks the better source per month.
 *
 * The 2025 months were rebuilt from the owner's Excel files and only ever existed in
 * the snapshot — the sheet still holds the original sparse rows for them (April has 6
 * there against 56 here). Every other month lives in the sheet and is edited there,
 * so the sheet is newer. Reading everything from one place would lose one or the
 * other, which is why each month is taken from wherever its good copy is.
 */
async function readBest(): Promise<{ rows: Row[]; skipped: string[] }> {
  // Raw orders are collected first and only the chosen month is mapped. Mapping both
  // sources in full would tally warnings against rows that are then thrown away,
  // which made the report look far worse than the data actually is.
  const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8")) as {
    months: Record<string, Order[]>;
  };
  const lookup = buildPeriodLookup(YEARS_CONFIG);
  const skipped: string[] = [];
  const rows: Row[] = [];
  const excelMonths: string[] = [];
  const sheetMonths: string[] = [];

  for (const [month, period] of lookup) {
    // Deliberately left out: not fetched at all, so it cannot be reported as a
    // failed read and cannot block the commit.
    if (skipMonths.includes(month)) {
      console.log(`  skipping ${month} (asked to leave it out)`);
      continue;
    }
    // The 2025 months were rebuilt from the owner's Excel files and only ever existed
    // in the snapshot; the sheet still holds the original sparse rows for them. Every
    // other month is edited in the sheet, so the sheet is the newer copy there.
    if (CLEARED_MONTHS.has(month)) {
      const orders = snapshot.months[month] || [];
      if (!orders.length) continue;
      for (const order of orders) rows.push(toRow(order, "kurdistani", period));
      excelMonths.push(month);
      continue;
    }

    process.stdout.write(`  reading ${month} … `);
    let lastError = "";
    let done = false;
    for (let attempt = 1; attempt <= 3 && !done; attempt++) {
      try {
        const response = await fetch(
          `${KURDISTANI_SCRIPT_URL}?month=${encodeURIComponent(month)}`,
          { redirect: "follow" },
        );
        const json = JSON.parse(await response.text()) as { data?: Order[] };
        const orders = Array.isArray(json.data) ? json.data : [];
        for (const order of orders) rows.push(toRow(order, "kurdistani", period));
        if (orders.length) sheetMonths.push(month);
        console.log(`${orders.length} orders`);
        done = true;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        if (attempt < 3) {
          process.stdout.write(`retry ${attempt} … `);
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        }
      }
    }
    if (!done) {
      skipped.push(`${month} (${lastError})`);
      console.log("FAILED after 3 attempts");
    }
  }

  console.log(`
  from the Excel rebuild (snapshot): ${excelMonths.join(", ")}`);
  console.log(`  from the sheet, live:              ${sheetMonths.join(", ")}`);
  return { rows, skipped };
}

const args = process.argv.slice(2);
const value = (name: string) => {
  const hit = args.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1).trim() : null;
};
const branch = value("--branch") as Branch | null;
const commit = args.includes("--commit");
const allowExisting = args.includes("--allow-existing");
const limit = Number(value("--limit") || 0) || 0;
// The snapshot is a point in time; the sheet is current. A re-migration should read
// the sheet so edits made since the snapshot are not rolled back.
const source = (value("--source") || "best").toLowerCase();
// Only needed if the id column is a plain primary key with no default of its own.
const withIds = args.includes("--with-ids");
// Months to leave out entirely, e.g. one still being worked on in the sheet.
const skipMonths = (value("--skip-months") || "")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

if (!branch || !(branch in TABLES)) {
  console.error("Usage: npm run migrate -- --branch=kurdistani|iraqi [--limit=N] [--commit]");
  console.error("Without --commit nothing is written.");
  process.exit(1);
}

const table = TABLES[branch];
console.log(`\nMigrating ${branch} -> ${table}`);
console.log(commit ? "MODE: COMMIT (rows will be inserted)" : "MODE: DRY RUN (nothing written)");
console.log("Google Sheets: read only, never modified\n");

const { rows: allRows, skipped } =
  branch === "iraqi"
    ? await readIraqi()
    : source === "snapshot"
      ? readKurdistani()
      : source === "sheet"
        ? await readFromSheet("kurdistani", KURDISTANI_SCRIPT_URL, YEARS_CONFIG)
        : await readBest();
const rows = limit > 0 ? allRows.slice(0, limit) : allRows;

const byPeriod = new Map<string, number>();
for (const row of rows)
  byPeriod.set(
    `${row.order_month}/${row.order_year}`,
    (byPeriod.get(`${row.order_month}/${row.order_year}`) || 0) + 1,
  );
console.log(`Found ${allRows.length} orders${limit ? `, limited to ${rows.length}` : ""}`);
for (const key of [...byPeriod.keys()]) {
  console.log(`  ${key.padEnd(12)} ${String(byPeriod.get(key)).padStart(5)} orders`);
}

// Box and money totals, so the figures in Supabase can be reconciled against the
// source before and after the copy.
const sum = (field: keyof Row) =>
  rows.reduce(
    (total, row) => total + (typeof row[field] === "number" ? (row[field] as number) : 0),
    0,
  );
console.log("\nBox and money totals being copied (compare these after the run):");
for (const field of ["price", "box_cost", "shipping_cost", "lost", "profit"] as const) {
  const present = rows.filter((r) => r[field] !== null).length;
  console.log(
    `  ${field.padEnd(15)} ${String(present).padStart(5)} values, total ${sum(field).toLocaleString()}`,
  );
}
console.log(
  `  ${"box_name".padEnd(15)} ${String(rows.filter((r) => r.box_name).length).padStart(5)} values`,
);

if (Object.keys(rejected).length) {
  console.warn("\nValues left NULL because they are not whole numbers (never coerced):");
  for (const [field, info] of Object.entries(rejected)) {
    console.warn(`  ${field}: ${info.count} — e.g. ${JSON.stringify(info.samples)}`);
  }
}
if (skipped.length) {
  console.warn("\nNot included:");
  for (const note of skipped) console.warn(`  ! ${note}`);
}
if (!rows.length) {
  console.log("\nNothing to copy.");
  process.exit(0);
}

console.log(`\nSample row:\n  ${JSON.stringify(rows[0])}`);

// A month that could not be read means the copy would be incomplete. Committing that
// quietly is how an entire month goes missing, so it stops here unless overridden.
if (skipped.length && commit && !args.includes("--allow-partial")) {
  console.error("\nRefusing to commit: some months could not be read.");
  for (const note of skipped) console.error(`  ! ${note}`);
  console.error("Re-run to try again, or pass --allow-partial to accept the gap.");
  process.exit(1);
}

// Writing the exact rows out lets them be inspected before anything is committed,
// rather than being taken on trust.
const dumpPath = value("--dump");
if (dumpPath) {
  writeFileSync(resolve(process.cwd(), dumpPath), JSON.stringify(rows, null, 1));
  console.log(
    `\nExact rows written to ${dumpPath} (${rows.length} rows) — nothing sent to Supabase.`,
  );
}

if (!commit) {
  console.log("\nDry run complete — nothing was written.");
  console.log(`To copy for real:  npm run migrate -- --branch=${branch} --commit`);
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { count, error: countError } = await supabase
  .from(table)
  .select("*", { count: "exact", head: true });

if (countError) {
  console.error(`\nCould not read ${table}: ${countError.message}`);
  process.exit(1);
}
if (count && count > 0 && !allowExisting) {
  console.error(`\n${table} already holds ${count} rows. Stopping so nothing is duplicated.`);
  console.error("Empty the table yourself, or re-run with --allow-existing if that is intended.");
  process.exit(1);
}

const BATCH = 500;
let inserted = 0;
const failures: string[] = [];

for (let start = 0; start < rows.length; start += BATCH) {
  const batch = rows.slice(start, start + BATCH).map((row, offset) =>
    // Postgres fills this in itself when the column has a default. Supplying one is
    // only correct where the primary key has none.
    withIds ? { ...row, id: start + offset + 1 } : row,
  );
  const { error } = await supabase.from(table).insert(batch);
  if (error) {
    failures.push(`rows ${start + 1}-${start + batch.length}: ${error.message}`);
    console.error(`  batch ${start + 1}-${start + batch.length} FAILED: ${error.message}`);
    if (error.hint) console.error(`    hint: ${error.hint}`);
  } else {
    inserted += batch.length;
    console.log(`  inserted ${inserted}/${rows.length}`);
  }
}

console.log(`\nCopied ${inserted} of ${rows.length} orders into ${table}.`);
if (failures.length) {
  console.error("Failures:");
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}
console.log("Google Sheets was not modified.");
