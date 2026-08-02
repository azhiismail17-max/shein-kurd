/**
 * The monthly running costs, read from the owner's expenses spreadsheet.
 *
 * The sheet is titled مەرسوفات (expenses) and row 30 holds each month's total. It is
 * fetched as CSV rather than through IMPORTRANGE, which only works inside Google
 * Sheets and cannot be evaluated by the app.
 */

const SHEET_ID = "1i0W7gjdm8pxXz4cZH0c6zppik98j2jvCRlpepmpREXU";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

/** Row holding the monthly totals, 1-based as shown in the spreadsheet. */
const TOTAL_ROW = 30;

/**
 * Spreadsheet column to the month key this app uses.
 *
 * Taken from row 2 of the sheet, which names each column: September, October,
 * November, December, jan, Frb, April, May, Jun, July, Aug, Sep, Oct, Nov, Dec. The
 * first four are 2025 because they come before January; the rest are 2026. The sheet
 * has no March column, so March has no figure.
 *
 * Worth noting the offset: the April column is G, not J, so every month sits one
 * letter later than a J-K-L-M-N reading would suggest.
 */
const COLUMN_TO_MONTH: Record<string, string> = {
  A: "Sept", // September 2025
  B: "Octo", // October 2025
  C: "Nove", // November 2025
  D: "Dece", // December 2025
  E: "Jan", // January 2026
  F: "Feb", // February 2026
  G: "Apr", // April 2026
  H: "Mayy", // May 2026
  I: "Jun", // June 2026
  J: "July",
  K: "Aug",
  L: "Sep",
  M: "Oct",
  N: "Nov",
  O: "Dec",
};

/** Column letter for a zero-based index: 0 -> A, 26 -> AA. */
function columnName(index: number): string {
  let name = "";
  let n = index;
  while (n >= 0) {
    name = String.fromCharCode(65 + (n % 26)) + name;
    n = Math.floor(n / 26) - 1;
  }
  return name;
}

/**
 * Splits CSV while respecting quotes.
 *
 * The totals are written with thousand separators — "648,157" — so a plain split on
 * commas tears each figure into two cells and silently shifts every later column.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
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

/** "648,157" -> 648157. Anything that is not a number becomes 0. */
function toAmount(raw: string): number {
  const cleaned = String(raw ?? "").replace(/[^0-9.-]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? Math.round(value) : 0;
}

export type MonthlyExpenses = Record<string, number>;

let inflight: Promise<MonthlyExpenses> | null = null;

/**
 * Each month's running cost, keyed by the month names this app uses.
 *
 * Returns an empty object if the sheet cannot be read, so the dashboard falls back to
 * showing no extra cost rather than failing to render.
 */
export function loadMonthlyExpenses(): Promise<MonthlyExpenses> {
  if (!inflight) {
    inflight = (async () => {
      try {
        const response = await fetch(CSV_URL, { redirect: "follow" });
        if (!response.ok) {
          console.warn(`[expenses] sheet returned ${response.status}`);
          return {};
        }
        const rows = parseCsv(await response.text());
        const totals = rows[TOTAL_ROW - 1];
        if (!totals) {
          console.warn(`[expenses] row ${TOTAL_ROW} is missing from the sheet`);
          return {};
        }

        const byMonth: MonthlyExpenses = {};
        totals.forEach((raw, index) => {
          const month = COLUMN_TO_MONTH[columnName(index)];
          if (!month) return;
          const amount = toAmount(raw);
          if (amount) byMonth[month] = amount;
        });

        console.info(
          "[expenses] " +
            Object.entries(byMonth)
              .map(([month, amount]) => `${month}:${amount.toLocaleString()}`)
              .join(" "),
        );
        return byMonth;
      } catch (error) {
        console.warn("[expenses] could not read the sheet", error);
        return {};
      }
    })();
  }
  return inflight;
}
