/**
 * Turns a Google Sheets export into a static snapshot the app can render with no
 * network round trip.
 *
 *   npm run snapshot -- my-data.xlsx          # from a downloaded workbook
 *   npm run snapshot -- --from-api            # pull every month from Apps Script
 *
 * Closed months never change, so shipping them as a file removes the Apps Script
 * wait that made the app feel slow, and doubles as a copy of the data that lives
 * in the project instead of only in Drive.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { Order, YEARS_CONFIG, SCRIPT_URL } from "../src/types";
import { parseWorkbookData, resolveMonthAnyYear, resolveMonthName } from "../src/lib/excel-parse";
import { getWarningImageSource } from "../src/lib/warning-image";

// Outside public/ on purpose: this file holds customer names, phones and addresses
// and is served only through an authenticated route.
const OUTPUT_PATH = resolve(process.cwd(), "data/orders-snapshot.json");

interface SnapshotStats {
  count: number;
  revenue: number;
  balance: number;
  buy: number;
  wgt: number;
  etc: number;
  lost: number;
}

interface Snapshot {
  generatedAt: string;
  source: string;
  months: Record<string, Order[]>;
  stats: Record<string, SnapshotStats>;
  /**
   * Months the snapshot owns outright. The app must not refetch these from Apps
   * Script, otherwise a month deliberately emptied here fills straight back up
   * on the next view.
   */
  ownedMonths?: string[];
  /**
   * Extra months per year, so an imported tab can carry any name and still belong
   * to the year it was filed under. Without this the app would only recognise the
   * months hardcoded in YEARS_CONFIG.
   */
  yearMonths?: Record<string, string[]>;
}

const amount = (value: unknown) => Number(String(value ?? "").replace(/[^0-9.-]/g, "")) || 0;

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

/** 1–12 for a month tab, worked out from its first three letters. */
function monthNumber(month: string): number | null {
  const key = month
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .slice(0, 3);
  const index = MONTH_PREFIXES.indexOf(key);
  return index < 0 ? null : index + 1;
}

/**
 * Repairs dates a US-locale Excel stored the wrong way round.
 *
 * A sheet for August holding "08/02" is not the 8th of February — it is the 2nd of
 * August, typed as "2/8" and read as month/day. The swap is only applied when the
 * day happens to equal the month the sheet is for, which is what makes it a
 * mis-reading rather than a genuinely different date.
 */
function fixSwappedDates(orders: Order[], month: string): number {
  const target = monthNumber(month);
  if (!target) return 0;
  let fixed = 0;
  for (const order of orders) {
    const text = String(order.date || "");
    const match = text.match(/^(\d{1,2})\/(\d{1,2})(.*)$/);
    if (!match) continue;
    const day = Number(match[1]);
    const mon = Number(match[2]);
    if (mon === target || day !== target) continue;
    order.date = `${String(mon).padStart(2, "0")}/${String(target).padStart(2, "0")}${match[3]}`;
    fixed += 1;
  }
  return fixed;
}

function computeStats(orders: Order[]): SnapshotStats {
  let revenue = 0;
  let paid = 0;
  let buy = 0;
  let wgt = 0;
  let lost = 0;
  for (const order of orders) {
    revenue += amount(order.price);
    paid += amount(order.initial_payment);
    buy += amount(order.box_cost);
    wgt += amount(order.shipping_cost);
    lost += amount(order.lost);
  }
  return {
    count: orders.length,
    revenue,
    balance: revenue - paid,
    buy,
    wgt,
    etc: 0,
    lost,
  };
}

function fromWorkbook(
  filePath: string,
  year: string | null,
  monthName: string | null,
  fixDates: boolean,
): Snapshot {
  const buffer = readFileSync(filePath);
  const months: Record<string, Order[]> = {};
  const skipped: string[] = [];
  const parsed = parseWorkbookData(buffer, year || Object.keys(YEARS_CONFIG)[0]);
  const withRows = parsed.filter((sheet) => sheet.rows.length);

  if (monthName && withRows.length > 1) {
    console.error(
      `--month=${monthName} names a single month, but ${withRows.length} tabs hold data. ` +
        `Rename the tabs instead, or import one tab per file.`,
    );
    process.exit(1);
  }

  // Parsed once, and each tab is resolved on its own. Looping the years instead
  // would let one tab be claimed by two different years and duplicate the data.
  for (const sheet of parsed) {
    if (!sheet.rows.length) continue;

    // With an explicit year, a tab is first matched against that year's own months
    // so "Augs" fills 2025's "Augi" rather than creating a near-duplicate. Only a
    // name that matches nothing is kept literally, which is what allows custom
    // months. Resolution stays inside the chosen year, so a tab called "Jun"
    // cannot reach 2026's "Jun" and overwrite it.
    const month = monthName
      ? monthName.trim()
      : year
        ? resolveMonthName(sheet.sourceName, year) || sheet.sourceName.trim()
        : resolveMonthAnyYear(sheet.sourceName);
    if (!month) {
      skipped.push(sheet.sourceName);
      continue;
    }
    if (months[month]) {
      console.warn(`  ! two tabs both map to ${month}; keeping the first`);
      continue;
    }

    const orders: Order[] = [];
    sheet.rows.forEach((row, index) => {
      if (row.errors.length) return;
      const order = {
        ...row.data,
        // A real row id from the file is kept; only invented when absent, so an
        // exported sheet stays aligned with the rows it came from.
        id: row.data.id || row.data.orderNo || index + 1,
        sheet_name: month,
        price: row.data.price ?? "0",
        insta: row.data.insta || row.data.name || "",
      } as Order;

      // Mirrors what the app does when it reads a row from Apps Script: a warning
      // picture is what marks an order missing, and it is stored under both names
      // so every screen that looks for it finds it.
      const warning = getWarningImageSource(order as unknown as Record<string, unknown>);
      if (warning) {
        order.warningBase64 = warning;
        order.warningImageUrl = warning;
        order.missing = true;
      }

      orders.push(order);
    });
    if (orders.length) months[month] = orders;

    if (fixDates && orders.length) {
      const fixed = fixSwappedDates(orders, month);
      if (fixed) console.log(`      repaired ${fixed} date(s) read as month/day`);
    }

    // The only place these details were visible used to be the import screen, so
    // the run reports them here: a wrong header row or a silently ignored column
    // is the difference between importing the data and importing nothing.
    console.log(`  ${sheet.sourceName} -> ${month}`);
    console.log(`      columns read from row ${sheet.headerRow}: ${sheet.headers.join(", ")}`);
    if (sheet.unmappedHeaders.length) {
      console.log(`      ignored columns: ${sheet.unmappedHeaders.join(", ")}`);
    }
    const bad = sheet.rows.filter((row) => row.errors.length).length;
    if (bad) console.log(`      skipped ${bad} row(s) with no customer name or insta`);
  }

  if (skipped.length) {
    console.warn(`  ! tabs with no matching month, not included: ${skipped.join(", ")}`);
    console.warn(`    pass --year=2025 to file them under a year using their own names`);
  }

  const snapshot = buildSnapshot(months, basename(filePath));
  // Only the months this workbook supplied are owned. Deriving that after a merge
  // would wrongly claim every month already in the snapshot and stop the live ones
  // refreshing from the sheet.
  snapshot.ownedMonths = Object.keys(months);
  // Recording the year lets the app offer these names in its month picker even
  // when they are nothing like the months in YEARS_CONFIG.
  if (year) snapshot.yearMonths = { [year]: Object.keys(months) };
  return snapshot;
}

async function fromApi(): Promise<Snapshot> {
  const months: Record<string, Order[]> = {};
  const allMonths = Object.values(YEARS_CONFIG).flat();

  for (const month of allMonths) {
    process.stdout.write(`  fetching ${month} … `);
    try {
      const response = await fetch(`${SCRIPT_URL}?month=${encodeURIComponent(month)}`, {
        redirect: "follow",
      });
      const json = JSON.parse(await response.text());
      const rows: Order[] = Array.isArray(json?.data) ? json.data : [];
      if (rows.length) {
        months[month] = rows.map((order) => ({ ...order, sheet_name: order.sheet_name || month }));
      }
      console.log(`${rows.length} rows`);
    } catch (error) {
      // One unreachable month must not throw away every month already fetched.
      console.log(`failed (${error instanceof Error ? error.message : String(error)})`);
    }
  }

  return buildSnapshot(months, "apps-script");
}

function buildSnapshot(months: Record<string, Order[]>, source: string): Snapshot {
  const stats: Record<string, SnapshotStats> = {};
  for (const [month, orders] of Object.entries(months)) {
    stats[month] = computeStats(orders);
  }
  return { generatedAt: new Date().toISOString(), source, months, stats };
}

function readExisting(): Snapshot | null {
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, "utf8")) as Snapshot;
  } catch {
    return null;
  }
}

const args = process.argv.slice(2);

/**
 * `npm run` appends arguments into a shell string and drops the quoting, so
 * `--month="Winter Sale"` arrives as `--month=Winter` followed by a bare `Sale`.
 * Bare words after --month are rejoined onto it; the file name is recognised
 * before that, so it is never swallowed.
 */
function parseArgs() {
  let source: string | undefined;
  let monthParts: string[] | null = null;
  let collecting = false;

  for (const arg of args) {
    if (arg.startsWith("--")) {
      collecting = false;
      if (arg.startsWith("--month=")) {
        monthParts = [arg.slice("--month=".length)];
        collecting = true;
      }
    } else if (collecting && monthParts) {
      monthParts.push(arg);
    } else if (!source) {
      source = arg;
    }
  }

  return {
    source,
    month: monthParts ? monthParts.join(" ").trim() || null : null,
  };
}

const { source, month: parsedMonth } = parseArgs();
const fromApiFlag = args.includes("--from-api");
const mergeFlag = args.includes("--merge");
const listValue = (name: string) => {
  const hit = args.find((a) => a.startsWith(`${name}=`));
  return hit
    ? hit
        .slice(name.length + 1)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
};
const pruned = listValue("--prune");
const cleared = listValue("--clear");
const excluded = new Set([...listValue("--exclude"), ...pruned]);

const singleValue = (name: string) => {
  const hit = args.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1).trim() : null;
};
const year = singleValue("--year");
const monthName = parsedMonth;

if (!source && !fromApiFlag && !pruned.length && !cleared.length && !listValue("--own").length) {
  console.error("Usage: npm run snapshot -- <file.xlsx> --year=2025 [--month=Name] [--merge]");
  console.error("       npm run snapshot -- --from-api [--exclude=Month,Month]");
  console.error("       npm run snapshot -- --prune=Month,Month     (drop months entirely)");
  console.error("       npm run snapshot -- --clear=Month,Month     (keep month, zero orders)");
  console.error(
    "       npm run snapshot -- --own=Month,Month       (stop refetching a closed month)",
  );
  process.exit(1);
}

if (monthName && !year) {
  console.error("--month needs --year too, so the month knows which year it belongs to.");
  process.exit(1);
}

let snapshot: Snapshot;
if (source) {
  snapshot = fromWorkbook(
    resolve(process.cwd(), source),
    year,
    monthName,
    args.includes("--fix-dates"),
  );
} else if (fromApiFlag) {
  snapshot = await fromApi();
} else {
  // --prune on its own edits what is already there, so months can be dropped
  // without spending minutes refetching every other month.
  const existing = readExisting();
  if (!existing) {
    console.error("No snapshot to prune. Generate one first.");
    process.exit(1);
  }
  snapshot = existing;
}

// Refreshing from Apps Script rebuilds every month, which would discard months
// that were imported from a workbook. Merging an API refresh therefore lets the
// existing snapshot keep the months it owns, and takes the sheet's copy for the
// rest — so live data can be pulled down without losing an import.
if (mergeFlag && fromApiFlag && !source) {
  const existing = readExisting();
  if (existing) {
    const owned = new Set(existing.ownedMonths || []);
    const months = { ...existing.months };
    const stats = { ...existing.stats };
    const kept: string[] = [];
    for (const [month, rows] of Object.entries(snapshot.months)) {
      if (owned.has(month)) {
        kept.push(month);
        continue;
      }
      months[month] = rows;
      stats[month] = snapshot.stats[month];
    }
    if (kept.length) console.log(`  kept imported months untouched: ${kept.join(", ")}`);
    snapshot = {
      generatedAt: snapshot.generatedAt,
      source: `${existing.source} + refreshed`,
      months,
      stats,
      ownedMonths: existing.ownedMonths,
      yearMonths: existing.yearMonths,
    };
  }
}

// Merging keeps months the new source does not mention, which is what lets a
// single month be corrected from a workbook without discarding the rest.
if (mergeFlag && source) {
  const existing = readExisting();
  if (existing) {
    // Custom month names from earlier imports must survive this one, so the two
    // yearMonths maps are unioned per year rather than replaced.
    const mergedYearMonths: Record<string, string[]> = { ...(existing.yearMonths || {}) };
    for (const [y, names] of Object.entries(snapshot.yearMonths || {})) {
      mergedYearMonths[y] = Array.from(new Set([...(mergedYearMonths[y] || []), ...names]));
    }
    snapshot = {
      generatedAt: snapshot.generatedAt,
      source: `${existing.source} + ${snapshot.source}`,
      months: { ...existing.months, ...snapshot.months },
      stats: { ...existing.stats, ...snapshot.stats },
      ownedMonths: Array.from(
        new Set([...(existing.ownedMonths || []), ...(snapshot.ownedMonths || [])]),
      ),
      yearMonths: mergedYearMonths,
    };
  }
}

for (const month of excluded) {
  if (snapshot.months[month]) {
    console.log(`  - dropped ${month} (${snapshot.months[month].length} orders)`);
    delete snapshot.months[month];
    delete snapshot.stats[month];
  } else {
    console.warn(`  ! ${month} was not in the snapshot`);
  }
  // A dropped month must also stop being offered in the picker, otherwise its
  // name lingers in the year list with nothing behind it.
  if (snapshot.yearMonths) {
    for (const [y, names] of Object.entries(snapshot.yearMonths)) {
      snapshot.yearMonths[y] = names.filter((name) => name !== month);
      if (!snapshot.yearMonths[y].length) delete snapshot.yearMonths[y];
    }
  }
  if (snapshot.ownedMonths) {
    snapshot.ownedMonths = snapshot.ownedMonths.filter((name) => name !== month);
  }
}

// Marking a closed month owned stops the app refetching it from Apps Script every
// time it is viewed. The rows already in the snapshot become its record, which is
// safe only for a month no longer receiving orders — a live month would stop
// showing new ones.
const toOwn = listValue("--own");
for (const month of toOwn) {
  const rows = snapshot.months[month];
  if (!rows) {
    console.warn(`  ! ${month} is not in the snapshot, cannot own it`);
    continue;
  }
  console.log(`  = ${month} is now served from the file only (${rows.length} orders)`);
}

// A cleared month stays present but empty, and is marked owned so the app shows
// zero orders instead of pulling the rows back out of the sheet.
const owned = new Set(snapshot.ownedMonths || []);
for (const month of toOwn) if (snapshot.months[month]) owned.add(month);
for (const month of cleared) {
  const had = snapshot.months[month]?.length || 0;
  snapshot.months[month] = [];
  snapshot.stats[month] = { count: 0, revenue: 0, balance: 0, buy: 0, wgt: 0, etc: 0, lost: 0 };
  owned.add(month);
  console.log(`  = cleared ${month} to 0 orders${had ? ` (was ${had})` : ""}`);
}
snapshot.ownedMonths = Array.from(owned);

const monthNames = Object.keys(snapshot.months);
if (!monthNames.length) {
  console.error(
    "No months matched. Tab names must look like: " + Object.values(YEARS_CONFIG).flat().join(", "),
  );
  process.exit(1);
}

mkdirSync(resolve(process.cwd(), "data"), { recursive: true });
writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot));

const total = monthNames.reduce((sum, m) => sum + snapshot.months[m].length, 0);
const sizeKb = (Buffer.byteLength(JSON.stringify(snapshot)) / 1024).toFixed(0);
console.log(`\nSnapshot written: data/orders-snapshot.json (${sizeKb} kB)`);
console.log(`${total} orders across ${monthNames.length} months: ${monthNames.join(", ")}`);
for (const month of monthNames) {
  console.log(`  ${month.padEnd(7)} ${String(snapshot.months[month].length).padStart(5)} orders`);
}
