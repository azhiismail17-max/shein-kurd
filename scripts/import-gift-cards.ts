/**
 * Copies the historical gift cards into Supabase.
 *
 * Dry run by default: it reads, works out exactly what it would write, prints that, and
 * stops. Nothing reaches the database until --commit is passed. Nothing is ever deleted or
 * overwritten — a card whose code is already in the table is skipped, so the script can be
 * run as many times as needed.
 *
 *   npx esbuild scripts/import-gift-cards.ts --bundle --platform=node --format=esm \
 *     --alias:@=./src --outfile=.tmp/import-gift-cards.mjs
 *   SUPABASE_SECRET_KEY=... node .tmp/import-gift-cards.mjs                 # dry run
 *   SUPABASE_SECRET_KEY=... node .tmp/import-gift-cards.mjs --commit        # write
 *
 * Where the cards come from:
 *   --from=sheet        asks the Apps Script for them (needs the gift card handler
 *                       deployed; see the note at the bottom of this comment)
 *   --file=cards.json   a JSON array, or the whole { gift_cards: [...] } reply
 *   --file=cards.csv    a CSV whose first row is the headers
 *
 * The columns it understands are the ones your sheet already uses:
 *   ID, Date, Card Number, Card Pin, Payment Method, Payment Other,
 *   Card Price, Spent, Remaining, Linked Boxes, Notes
 *
 * ON THE DEPLOYED SCRIPT
 * ?action=get_gift_cards currently answers with the ordinary orders payload and no
 * gift_cards key at all, because the gift card handler lives in kurdistani.txt and that
 * file has never been pasted into the Apps Script editor. Deploy it and --from=sheet works
 * with no exporting by hand.
 */

import { readFileSync } from "node:fs";

const SUPABASE_URL = "https://rjwpvgzpyxgwlsanwwvd.supabase.co";
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwWF-1pFpNaIq9qx2BrMVU5qiEduvrgnOiejDmdc0e975LPmbfCSIqzGsg6dR5mWBM/exec";

const args = process.argv.slice(2);
const COMMIT = args.includes("--commit");
const FILE = args.find((a) => a.startsWith("--file="))?.slice(7) ?? "";
const FROM = args.find((a) => a.startsWith("--from="))?.slice(7) ?? (FILE ? "file" : "sheet");
/**
 * How to read a CSV that has no headers.
 *
 * The gift cards were not kept in the "Gift Card" tab in the end — they were entered as
 * ordinary order rows, with the card number in the Insta column and the pin in the Name
 * column. Such an export has no header line at all, so the columns can only be taken by
 * position, and that has to be asked for deliberately rather than guessed at.
 */
const LAYOUT = args.find((a) => a.startsWith("--layout="))?.slice(9) ?? "auto";

const KEY = process.env.SUPABASE_SECRET_KEY ?? "";
if (!KEY) {
  console.error("Set SUPABASE_SECRET_KEY. Nothing was read or written.");
  process.exit(1);
}
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

/** One card as it comes out of the sheet, whatever spelling the headers use. */
interface RawCard {
  [key: string]: unknown;
}

/** What will be written. Legacy columns are filled too, so nothing from the sheet is lost. */
interface CardRow {
  code: string;
  amount: number;
  status: "active" | "used";
  used_at: string | null;
  created_at: string | null;
  customer_name: string | null;
  card_number: number | null;
  card_pin: number | null;
  payment_method: string | null;
  card_price: number | null;
  spent: number | null;
  remaining: number | null;
  notes: string | null;
  date: string | null;
}

const num = (value: unknown): number => {
  const cleaned = String(value ?? "").replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const text = (value: unknown): string | null => {
  const out = String(value ?? "").trim();
  return out === "" ? null : out;
};

/** Header spellings seen in the sheet, mapped to one name each. */
function pick(card: RawCard, ...names: string[]): unknown {
  const keys = Object.keys(card);
  for (const name of names) {
    const wanted = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const hit = keys.find((key) => key.toLowerCase().replace(/[^a-z0-9]/g, "") === wanted);
    if (hit !== undefined && card[hit] !== undefined && card[hit] !== null) return card[hit];
  }
  return undefined;
}

/** Quote-aware CSV split into a plain grid. Amounts and notes both contain commas. */
function splitCsv(body: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (quoted) {
      if (char === '"') {
        if (body[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** A CSV that names its columns, read by header. */
function parseCsv(body: string): RawCard[] {
  let rows = splitCsv(body);

  // The header row is found, not assumed to be the first.
  //
  // A tab exported from Google Sheets often carries a title above the headers — the orders
  // workbooks all did, and reading row 1 as the headers there produced columns called
  // __EMPTY_1 and not a single usable row. So the first row that actually names a card
  // column wins.
  const looksLikeHeader = (row: string[]) => {
    const joined = row.join(" ").toLowerCase();
    return /card\s*number|card\s*price/.test(joined);
  };
  let headerIndex = rows.findIndex(looksLikeHeader);
  if (headerIndex < 0) headerIndex = 0;
  if (headerIndex > 0) {
    console.log(`  (headers found on line ${headerIndex + 1}; ${headerIndex} line(s) above skipped)`);
  }
  const header = (rows[headerIndex] ?? []).map((h) => h.trim());
  rows = rows.slice(headerIndex + 1);

  return rows
    .filter((r) => r.some((v) => String(v).trim() !== ""))
    .map((r) => {
      const card: RawCard = {};
      header.forEach((name, i) => (card[name] = r[i]));
      return card;
    });
}

/**
 * Column positions in an order-row export, counted from zero.
 *
 * Taken from the file rather than assumed: column 0 holds 38 distinct nineteen-digit
 * numbers, column 1 is "PIN 7063" every time, column 4 is only ever 300 or 500, column 6
 * is a payment method, column 13 is 0 on every row, and column 16 is a day-first
 * timestamp. Anything else in the row is empty on all 38.
 */
const ORDER_ROW_COLUMNS = {
  cardNumber: 0,
  pin: 1,
  amount: 4,
  paymentMethod: 6,
  spent: 13,
  date: 16,
  uniqueId: 30,
} as const;

/** "04/07/2026 17:03:56" is the 4th of July, not the 7th of April. */
function parseDayFirst(value: string): string | null {
  const match = String(value ?? "")
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) {
    const loose = new Date(value);
    return Number.isNaN(loose.getTime()) ? null : loose.toISOString();
  }
  const [, day, month, year, hour, minute, second] = match;
  // Built in UTC so the digits written in the sheet are the digits stored, matching how
  // every other date in this system is handled.
  const at = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour ?? 0),
      Number(minute ?? 0),
      Number(second ?? 0),
    ),
  );
  return Number.isNaN(at.getTime()) ? null : at.toISOString();
}

/** Turns headerless order rows into the same shape a Gift Card tab would give. */
function fromOrderRows(rows: string[][]): RawCard[] {
  const at = (row: string[], index: number) => String(row[index] ?? "").trim();
  return rows.map((row) => ({
    "Card Number": at(row, ORDER_ROW_COLUMNS.cardNumber),
    // "PIN 7063" -> 7063
    "Card Pin": at(row, ORDER_ROW_COLUMNS.pin).replace(/[^0-9]/g, ""),
    "Card Price": at(row, ORDER_ROW_COLUMNS.amount),
    "Payment Method": at(row, ORDER_ROW_COLUMNS.paymentMethod),
    Spent: at(row, ORDER_ROW_COLUMNS.spent),
    Date: parseDayFirst(at(row, ORDER_ROW_COLUMNS.date)) ?? "",
    // The order's own id, kept for tracing a card back to the row it came from. It is
    // deliberately not offered as a customer name: it is a uuid, and it would fill the
    // Customer column of the history list with unreadable text.
    Notes: at(row, ORDER_ROW_COLUMNS.uniqueId),
    Customer: "",
  }));
}

async function readSource(): Promise<RawCard[]> {
  if (FROM === "file") {
    const body = readFileSync(FILE, "utf8");
    if (FILE.toLowerCase().endsWith(".csv")) {
      const grid = splitCsv(body);
      const headed = grid.findIndex((row) =>
        /card\s*number|card\s*price/i.test(row.join(" ")),
      );
      const useOrderRows =
        LAYOUT === "order-rows" || (LAYOUT === "auto" && headed < 0);
      if (useOrderRows) {
        console.log("  layout: order rows, read by position (this file has no header line)");
        return fromOrderRows(grid.filter((row) => row.some((v) => String(v).trim() !== "")));
      }
      return parseCsv(body);
    }
    const parsed = JSON.parse(body);
    if (Array.isArray(parsed)) return parsed as RawCard[];
    if (Array.isArray(parsed.gift_cards)) return parsed.gift_cards as RawCard[];
    throw new Error("The JSON is neither an array nor { gift_cards: [...] }");
  }

  const response = await fetch(`${SCRIPT_URL}?action=get_gift_cards&t=${Date.now()}`, {
    redirect: "follow",
  });
  const body = await response.text();
  let payload: { gift_cards?: RawCard[] } | null = null;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error(`The script answered with ${response.status} and something other than JSON.`);
  }
  if (!payload || !Array.isArray(payload.gift_cards)) {
    throw new Error(
      "The reply has no gift_cards. The deployed Apps Script has no gift card handler yet — " +
        "paste kurdistani.txt into the Apps Script editor and redeploy, or use --file=",
    );
  }
  return payload.gift_cards;
}

/**
 * One sheet card, mapped to a row.
 *
 * The awkward part is status. The sheet tracks a card with a price, an amount spent and a
 * balance, so a card can be half used — 300 loaded with 120 spent. The new table only knows
 * active or used, so anything with a balance left counts as active and anything with none
 * counts as used. The original figures are written into the legacy columns beside them, so
 * a partly-spent card is still legible even though the status alone cannot say so.
 */
function toRow(card: RawCard): { row: CardRow; warning?: string } | { skip: string } {
  const code = String(pick(card, "card_number", "cardnumber", "code", "card") ?? "").trim();
  if (!code) return { skip: "no card number" };

  const price = num(pick(card, "card_price", "cardprice", "amount", "price"));
  const spent = num(pick(card, "spent"));
  const rawRemaining = pick(card, "remaining");
  // A blank balance means untouched, not zero — treating it as zero would mark every
  // card in the sheet as used.
  const remaining = rawRemaining === undefined || String(rawRemaining).trim() === ""
    ? price - spent
    : num(rawRemaining);

  const dateText = text(pick(card, "date"));
  const when = dateText ? new Date(dateText) : null;
  const iso = when && !Number.isNaN(when.getTime()) ? when.toISOString() : null;

  const status: "active" | "used" = remaining > 0 ? "active" : "used";

  let warning: string | undefined;
  if (spent > 0 && remaining > 0) {
    warning = `${code}: ${spent} of ${price} already spent, ${remaining} left — recorded as active`;
  }
  if (!price) warning = `${code}: no price in the sheet, amount written as 0`;

  return {
    row: {
      code,
      amount: price,
      status,
      // The constraint insists a used card says when. The sheet never recorded the moment
      // a card was spent, so its own date is used — the closest honest answer available.
      used_at: status === "used" ? iso : null,
      created_at: iso,
      // "customer" first, so a layout that supplies one wins; notes are only used when
      // they are a real note rather than a bare id.
      customer_name: text(pick(card, "customer", "customer_name")),
      // Left null unless the digits survive being turned into a number and back.
      //
      // These card numbers are nineteen digits, past the largest integer JavaScript can
      // hold exactly, so 1112417830209600220 comes back as 1112417830209600300 — a
      // different card. The code column is text and keeps every digit, so it is the
      // accurate copy and this legacy column simply stays empty rather than holding a
      // number that is quietly wrong.
      card_number: /^\d+$/.test(code) && String(Number(code)) === code ? Number(code) : null,
      card_pin: num(pick(card, "card_pin", "cardpin")) || null,
      payment_method: text(pick(card, "payment_method", "paymentmethod")),
      card_price: price || null,
      spent: spent || null,
      remaining,
      notes: text(pick(card, "notes")),
      date: dateText,
    },
    warning,
  };
}

async function existingCodes(): Promise<Set<string>> {
  const codes = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/gift_cards?select=code&offset=${from}&limit=1000`,
      { headers: HEADERS },
    );
    if (!response.ok) throw new Error(`Could not read gift_cards: ${await response.text()}`);
    const rows = (await response.json()) as { code: string | null }[];
    for (const row of rows) if (row.code) codes.add(row.code.trim().toUpperCase());
    if (rows.length < 1000) break;
  }
  return codes;
}

(async () => {
  console.log(`source: ${FROM === "file" ? FILE : "Apps Script"}`);
  const raw = await readSource();
  console.log(`read ${raw.length} card(s) from the source\n`);

  if (raw.length === 0) {
    console.error("Nothing to import. Refusing to go further so an empty read cannot be");
    console.error("mistaken for a finished import.");
    process.exit(1);
  }

  const already = await existingCodes();
  console.log(`gift_cards already holds ${already.size} card(s) with a code\n`);

  const toInsert: CardRow[] = [];
  const skipped: string[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();

  for (const card of raw) {
    const mapped = toRow(card);
    if ("skip" in mapped) {
      skipped.push(mapped.skip);
      continue;
    }
    const key = mapped.row.code.toUpperCase();
    if (already.has(key)) {
      skipped.push(`${mapped.row.code}: already in Supabase`);
      continue;
    }
    if (seen.has(key)) {
      skipped.push(`${mapped.row.code}: appears twice in the source`);
      continue;
    }
    seen.add(key);
    if (mapped.warning) warnings.push(mapped.warning);
    toInsert.push(mapped.row);
  }

  const active = toInsert.filter((r) => r.status === "active");
  const used = toInsert.filter((r) => r.status === "used");
  const value = (rows: CardRow[]) => rows.reduce((sum, r) => sum + r.amount, 0);

  console.log(`would insert : ${toInsert.length}`);
  console.log(`  active     : ${active.length}  worth ${value(active).toLocaleString()}`);
  console.log(`  used       : ${used.length}  worth ${value(used).toLocaleString()}`);
  console.log(`  total value: ${value(toInsert).toLocaleString()}`);
  console.log(`skipped      : ${skipped.length}`);
  skipped.slice(0, 15).forEach((s) => console.log(`    ${s}`));
  if (skipped.length > 15) console.log(`    ... and ${skipped.length - 15} more`);

  if (warnings.length) {
    console.log(`\nworth a look (${warnings.length}):`);
    warnings.slice(0, 20).forEach((w) => console.log(`    ${w}`));
  }

  console.log("\nfirst five rows exactly as they would be written:");
  toInsert.slice(0, 5).forEach((r) => console.log(`    ${JSON.stringify(r)}`));

  if (!COMMIT) {
    console.log("\nDry run. Nothing was written. Pass --commit to insert.");
    return;
  }
  if (toInsert.length === 0) {
    console.log("\nNothing new to insert.");
    return;
  }

  // Inserted in batches, and never with an upsert: an existing card must not be
  // overwritten by a stale copy from the sheet.
  let written = 0;
  for (let i = 0; i < toInsert.length; i += 100) {
    const batch = toInsert.slice(i, i + 100);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/gift_cards`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify(batch),
    });
    if (!response.ok) {
      console.error(`\nBatch starting at ${i} failed: ${await response.text()}`);
      console.error(`${written} card(s) were written before this. Re-run to continue —`);
      console.error("cards already in the table are skipped.");
      process.exit(1);
    }
    written += ((await response.json()) as unknown[]).length;
    console.log(`  wrote ${written}/${toInsert.length}`);
  }

  const after = await existingCodes();
  console.log(`\ndone. gift_cards now holds ${after.size} card(s) with a code.`);
})().catch((error) => {
  console.error(`\nfailed: ${error instanceof Error ? error.message : error}`);
  console.error("Nothing partial was left behind by this error itself.");
  process.exit(1);
});
