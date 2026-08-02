import * as XLSX from "xlsx";
import { Order, YEARS_CONFIG } from "@/types";

// Kept free of browser APIs on purpose: the snapshot generator runs this exact
// mapping under Node so a file imported in the app and a file converted on the
// command line can never disagree about what a column means.

/** Columns the sheet handler accepts, mapped from whatever the file calls them. */
const HEADER_ALIASES: Record<keyof ImportableFields, string[]> = {
  insta: ["insta", "instagram", "ig", "username", "user", "account", "handle", "instaname"],
  name: ["name", "customer", "customername", "fullname", "client"],
  link: ["link", "url", "productlink", "product", "producturl", "sheinlink"],
  place: ["place", "city", "location", "address", "area", "region"],
  fib: ["fib", "fibcode", "paymentcode", "fibnumber"],
  // "Price IQD" is the selling price in these books; "Price USD" is a working
  // figure with no column to land in, so it is deliberately not listed.
  price: [
    "price",
    "total",
    "amount",
    "sellprice",
    "sellingprice",
    "customerprice",
    "totalprice",
    "priceiqd",
    "iqdprice",
  ],
  initial_payment: [
    "initialpayment",
    "deposit",
    "paid",
    "advance",
    "prepaid",
    "downpayment",
    "pay",
  ],
  phone: ["phone", "phone1", "mobile", "number", "tel", "contact", "phonenumber"],
  phone2: ["phone2", "secondphone", "altphone", "mobile2", "phoneb"],
  pics_text: ["picstext", "pics", "quantity", "qty", "items", "count", "pieces", "pic"],
  // The workbooks spell this column three different ways, including two
  // misspellings, so every variant seen in the files is listed.
  extra: [
    "extra",
    "extras",
    "additional",
    "anythingelse",
    "anythingesle",
    "anythignelse",
    "anythingels",
  ],
  box_name: ["boxname", "box", "batch", "batchname", "boxno", "boxnumber"],
  box_cost: ["boxcost", "buyprice", "buyingprice", "cost", "purchaseprice", "buyingfee", "buyfee"],
  shipping_cost: [
    "shippingcost",
    "shipping",
    "weightcost",
    "wgt",
    "delivery",
    "deliverycost",
    "weight",
  ],
  lost: ["lost", "loss", "damaged", "missing"],
  profit: ["profit", "gain", "margin"],
  note: ["note", "notes", "comment", "remark", "description"],
  date: ["date", "orderdate", "created", "createdat", "time", "datetime"],
  // "id" belongs to the row id below, not here, so an exported sheet keeps its
  // real row numbers instead of them being read as the order number.
  orderNo: ["orderno", "ordernumber", "order", "no", "num"],
  // The sheet's own row id. Carrying it through is what keeps an imported order
  // pointing at the right row if it is ever edited.
  id: ["id", "rowid", "row", "orderid", "sheetrow"],
  trackNo: ["trackno", "tracking", "trackingnumber", "tracknumber", "awb", "waybill"],
  sku: ["sku", "code", "productcode", "itemcode", "skucode"],
  // Picture columns hold links, which is the only form a picture can arrive in —
  // images pasted into a workbook are stored outside the cells and are not read.
  // "pic" and "pics" are deliberately absent: in these books they mean quantity.
  image_url: ["image", "imageurl", "imagelink", "photo", "photourl", "picturelink", "picurl"],
  primary_urls: ["images", "picture", "pictures", "primaryurls", "photos", "imageurls"],
  proof_urls: ["proof", "proofurls", "proofpicture", "proofimage", "receipt", "receipturls"],
  // The warning picture is what marks an order as missing. The system reads it
  // from any of these names, including a bare "Y" column, so the importer accepts
  // the same set rather than a narrower one.
  warningBase64: [
    "warning",
    "warningpicture",
    "warningimage",
    "warningurl",
    "warningbase64",
    "warningimageurl",
    "missingimage",
    "missingpicture",
    "y",
    "columny",
  ],
  admin_name: ["admin", "adminname", "sender", "addedby", "createdby"],
  admin_role: ["adminrole", "role"],
  unique_order_id: ["uniqueorderid", "uniqueid", "orderuid"],
};

export type ImportableFields = Pick<
  Order,
  | "insta"
  | "name"
  | "link"
  | "place"
  | "fib"
  | "price"
  | "initial_payment"
  | "phone"
  | "phone2"
  | "pics_text"
  | "extra"
  | "box_name"
  | "box_cost"
  | "shipping_cost"
  | "lost"
  | "profit"
  | "note"
  | "date"
  | "orderNo"
  | "trackNo"
  | "sku"
  | "image_url"
  | "primary_urls"
  | "proof_urls"
  | "warningBase64"
  | "admin_name"
  | "admin_role"
  | "unique_order_id"
  | "id"
>;

export interface ImportRow {
  /** 1-based row number as it appears in the spreadsheet, for error messages. */
  rowNumber: number;
  data: Partial<ImportableFields>;
  errors: string[];
  warnings: string[];
}

export interface ParsedSheet {
  /** Tab name exactly as it appears in the uploaded file. */
  sourceName: string;
  /** Month tab this maps to, resolved against YEARS_CONFIG. */
  targetMonth: string | null;
  headers: string[];
  unmappedHeaders: string[];
  /** 1-based spreadsheet row the column names were found on. */
  headerRow: number;
  rows: ImportRow[];
}

const normalizeHeader = (header: string) =>
  String(header || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const FIELD_BY_ALIAS = new Map<string, keyof ImportableFields>();
for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
  for (const alias of aliases) {
    // First alias to claim a name wins, so "id" cannot steal a column that a
    // later field spells out more explicitly.
    if (!FIELD_BY_ALIAS.has(alias)) {
      FIELD_BY_ALIAS.set(alias, field as keyof ImportableFields);
    }
  }
}

/**
 * Month tabs are spelled inconsistently across years ("Juni" in 2025 but "Jun"
 * in 2026), so a name is always resolved inside the year being imported before
 * falling back to a global match.
 */
export function resolveMonthName(sourceName: string, activeYear: string): string | null {
  const target = normalizeHeader(sourceName);
  if (!target) return null;

  const yearMonths = YEARS_CONFIG[activeYear] || [];
  const exact = yearMonths.find((m) => normalizeHeader(m) === target);
  if (exact) return exact;

  // "June" should still find the 2025 tab that is actually spelled "Juni".
  const prefix = yearMonths.find((m) => {
    const candidate = normalizeHeader(m);
    return candidate.startsWith(target.slice(0, 3)) && target.startsWith(candidate.slice(0, 3));
  });
  if (prefix) return prefix;

  const anyYear = Object.values(YEARS_CONFIG)
    .flat()
    .find((m) => normalizeHeader(m) === target);
  return anyYear || null;
}

/**
 * Resolves a tab when no year has been chosen, as the snapshot generator does.
 * Exact spellings are matched across every year before any fuzzy match is
 * considered, otherwise a tab called "April" would be claimed by 2026's "Apr"
 * just as readily as by 2025's "April".
 */
export function resolveMonthAnyYear(sourceName: string): string | null {
  const target = normalizeHeader(sourceName);
  if (!target) return null;

  for (const months of Object.values(YEARS_CONFIG)) {
    const exact = months.find((m) => normalizeHeader(m) === target);
    if (exact) return exact;
  }
  for (const year of Object.keys(YEARS_CONFIG)) {
    const fuzzy = resolveMonthName(sourceName, year);
    if (fuzzy) return fuzzy;
  }
  return null;
}

const EXCEL_EPOCH_OFFSET_DAYS = 25569;
const MS_PER_DAY = 86400000;

/**
 * The dashboard splits `date` on a space and then on "/" to chart activity, so
 * anything imported has to arrive as "DD/MM HH:mm" or it silently drops out of
 * the graphs.
 */
function normalizeDate(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";

  let date: Date | null = null;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "number" && Number.isFinite(value)) {
    // Excel stores dates as days since 1899-12-30.
    date = new Date((value - EXCEL_EPOCH_OFFSET_DAYS) * MS_PER_DAY);
  } else {
    const text = String(value).trim();
    // Already in the shape the app expects — leave it untouched.
    if (/^\d{1,2}\/\d{1,2}(\s+\d{1,2}:\d{2})?$/.test(text)) return text;
    // Hand-typed day-month entries like "13-8" or "13.8". new Date() reads "13-8"
    // as a year, so these have to be recognised before it gets a chance.
    const dayMonth = text.match(/^(\d{1,2})[-.](\d{1,2})$/);
    if (dayMonth) {
      const day = Number(dayMonth[1]);
      const month = Number(dayMonth[2]);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
      }
    }
    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
    else return text;
  }

  if (!date || Number.isNaN(date.getTime())) return "";

  // A date held as an Excel serial is a fraction of a day, so 09:05 comes back as
  // 09:04:59.999 and truncating the minute would report the wrong time. Snapping
  // to the nearest second absorbs that error before the minute is read.
  const snapped = new Date(Math.round(date.getTime() / 1000) * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(snapped.getDate())}/${pad(snapped.getMonth() + 1)} ${pad(snapped.getHours())}:${pad(snapped.getMinutes())}`;
}

function normalizeAmount(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") return String(value);
  return String(value).replace(/[^0-9.-]/g, "");
}

const AMOUNT_FIELDS = new Set<keyof ImportableFields>([
  "price",
  "initial_payment",
  "box_cost",
  "shipping_cost",
  "lost",
  "profit",
]);

const MAX_HEADER_SCAN_ROWS = 25;

/**
 * Real exports open with a title or a merged banner, so the column names are
 * rarely on row 1. Whichever row recognises the most known column names is the
 * header; taking row 1 on faith turns the title into the headers and makes every
 * data row below it look empty.
 */
function detectHeaderRow(grid: unknown[][]): number {
  let bestIndex = 0;
  let bestScore = 0;
  const limit = Math.min(grid.length, MAX_HEADER_SCAN_ROWS);

  for (let index = 0; index < limit; index++) {
    const seen = new Set<keyof ImportableFields>();
    for (const cell of grid[index] || []) {
      const field = FIELD_BY_ALIAS.get(normalizeHeader(String(cell ?? "")));
      if (field) seen.add(field);
    }
    if (seen.size > bestScore) {
      bestScore = seen.size;
      bestIndex = index;
    }
  }

  // One lucky word is not a header row; fall back to the first row instead.
  return bestScore >= 2 ? bestIndex : 0;
}

/** Reads an .xlsx/.xls/.csv buffer. Works in the browser and under Node. */
export function parseWorkbookData(
  data: ArrayBuffer | Uint8Array,
  activeYear: string,
): ParsedSheet[] {
  const workbook = XLSX.read(data, { cellDates: true });

  return workbook.SheetNames.map((sourceName) => {
    const worksheet = workbook.Sheets[sourceName];
    // Read as a plain grid so the header row can be located before any column
    // names are assigned.
    const grid = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      defval: "",
      raw: true,
      blankrows: true,
    });

    const headerIndex = detectHeaderRow(grid);
    const headerCells = (grid[headerIndex] || []).map((cell) => String(cell ?? "").trim());

    const mapping = new Map<number, keyof ImportableFields>();
    const headers: string[] = [];
    const unmappedHeaders: string[] = [];
    headerCells.forEach((header, column) => {
      if (!header) return;
      headers.push(header);
      const field = FIELD_BY_ALIAS.get(normalizeHeader(header));
      if (field && !Array.from(mapping.values()).includes(field)) mapping.set(column, field);
      else unmappedHeaders.push(header);
    });

    const raw = grid.slice(headerIndex + 1);
    const rows: ImportRow[] = [];
    raw.forEach((gridRow, index) => {
      const rowData: Partial<ImportableFields> = {};
      for (const [column, field] of mapping) {
        const value = gridRow?.[column];
        if (field === "date") {
          const formatted = normalizeDate(value);
          if (formatted) rowData.date = formatted;
        } else if (AMOUNT_FIELDS.has(field)) {
          const amount = normalizeAmount(value);
          if (amount !== "") (rowData as Record<string, unknown>)[field] = amount;
        } else {
          const text = String(value ?? "").trim();
          if (text) (rowData as Record<string, unknown>)[field] = text;
        }
      }

      // A row of empty cells is padding, not an order.
      const hasContent = Object.values(rowData).some((v) => String(v ?? "").trim() !== "");
      if (!hasContent) return;

      const errors: string[] = [];
      const warnings: string[] = [];
      if (!rowData.insta && !rowData.name) errors.push("No customer — needs 'insta' or 'name'");
      if (rowData.price === undefined || rowData.price === "")
        warnings.push("Missing price, will save 0");
      if (!rowData.pics_text) rowData.pics_text = "1";
      if (rowData.initial_payment === undefined) rowData.initial_payment = "0";

      // grid index 0 is spreadsheet row 1, and these rows start below the header.
      rows.push({
        rowNumber: headerIndex + index + 2,
        data: rowData,
        errors,
        warnings,
      });
    });

    return {
      sourceName,
      targetMonth: resolveMonthName(sourceName, activeYear),
      headers,
      unmappedHeaders,
      headerRow: headerIndex + 1,
      rows,
    };
  });
}
